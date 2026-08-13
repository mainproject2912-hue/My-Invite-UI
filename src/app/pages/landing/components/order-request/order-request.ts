import { Component, signal, computed, inject, ElementRef, ViewChild, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { ContentService } from '../../../../services/content.service';
import { CountriesService, DisplayCountry } from '../../../../shared/countries.service';
import { environment } from '../../../../../environments/environment';

type EntityType = 'individual' | 'company';

@Component({
  selector: 'app-order-request',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TranslocoModule],
  templateUrl: './order-request.html',
  styleUrl: './order-request.css'
})
export class OrderRequestComponent {
  private readonly contentService = inject(ContentService);
  private readonly countriesService = inject(CountriesService);
  private readonly transloco = inject(TranslocoService);
  private readonly http = inject(HttpClient);

  readonly eventTypes = this.contentService.eventTypes;

  entityType = signal<EntityType>('individual');
  name = '';
  phoneLocal = '';
  email = '';
  guestsCount: number | null = null;
  eventType = '';
  notes = '';

  submitting = signal(false);
  submitSuccess = signal(false);

  countries = this.countriesService.countries;
  private selectedIso = signal<string | null>(null);
  selectedCountry = computed<DisplayCountry>(() => {
    const iso = this.selectedIso();
    const match = iso ? this.countries().find(c => c.isoCode === iso) : undefined;
    return match ?? this.countriesService.defaultCountry();
  });
  searchQuery = signal('');
  dropdownOpen = signal(false);
  filteredCountries = computed(() => this.countriesService.filter(this.searchQuery()));

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  setEntity(type: EntityType) {
    this.entityType.set(type);
  }

  selectCountry(c: DisplayCountry) {
    this.selectedIso.set(c.isoCode);
    this.dropdownOpen.set(false);
    this.searchQuery.set('');
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
    if (this.dropdownOpen()) this.searchQuery.set('');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    if (this.dropdownRef && !this.dropdownRef.nativeElement.contains(e.target)) {
      this.dropdownOpen.set(false);
    }
  }

  private buildWhatsAppMessage(): string {
    const t = (key: string) => this.transloco.translate(key);
    const lines = [t('orderRequest.messageIntro'), ''];

    lines.push(`${t('orderRequest.messageEntity')}: ${t(this.entityType() === 'company' ? 'orderRequest.entityCompany' : 'orderRequest.entityIndividual')}`);
    if (this.name.trim()) {
      lines.push(`${t('orderRequest.messageName')}: ${this.name.trim()}`);
    }
    lines.push(`${t('orderRequest.messagePhone')}: +${this.selectedCountry().dialCode}${this.phoneLocal.replace(/^0+/, '')}`);
    if (this.email.trim()) {
      lines.push(`${t('orderRequest.messageEmail')}: ${this.email.trim()}`);
    }
    if (this.guestsCount !== null && this.guestsCount !== undefined) {
      lines.push(`${t('orderRequest.messageGuests')}: ${this.guestsCount}`);
    }
    if (this.eventType) {
      lines.push(`${t('orderRequest.messageEventType')}: ${this.eventType}`);
    }
    if (this.notes.trim()) {
      lines.push(`${t('orderRequest.messageNotes')}: ${this.notes.trim()}`);
    }

    return lines.join('\n');
  }

  submitViaWhatsApp() {
    if (this.submitting()) return;
    this.submitting.set(true);

    const fullPhone = `+${this.selectedCountry().dialCode}${this.phoneLocal.replace(/^0+/, '')}`;

    const payload = {
      customerName: this.name,
      customerEmail: this.email,
      customerPhone: fullPhone,
      entityType: this.entityType(),
      guestsCount: this.guestsCount,
      eventType: this.eventType,
      notes: this.notes,
      quantity: this.guestsCount ?? 1,
      totalPrice: 0
    };

    this.http.post(`${environment.apiUrl}/Orders`, payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
        this.redirectToWhatsApp();
      },
      error: (err) => {
        console.error('Error saving order request to database:', err);
        this.submitting.set(false);
        this.submitSuccess.set(true);
        this.redirectToWhatsApp();
      }
    });
  }

  private redirectToWhatsApp() {
    const rawNumber = this.contentService.siteSettings()['whatsapp-number'] || '';
    const digits = rawNumber.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(this.buildWhatsAppMessage());
    const url = digits ? `https://wa.me/${digits}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
