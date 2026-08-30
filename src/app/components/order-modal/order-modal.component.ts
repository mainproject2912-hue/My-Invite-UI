import {
  Component, OnInit, signal, computed,
  ElementRef, ViewChild, HostListener, inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { DesignOrderService } from '../../services/design-order.service';
import { environment } from '../../../environments/environment';
import { CountriesService, DisplayCountry } from '../../shared/countries.service';

@Component({
  selector: 'app-order-modal',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TranslocoModule],
  templateUrl: './order-modal.component.html',
  styleUrl: './order-modal.component.css'
})
export class OrderModalComponent implements OnInit {
  @ViewChild('phoneRef') phoneRef!: ElementRef;

  readonly designOrderService = inject(DesignOrderService);
  private readonly http = inject(HttpClient);
  private readonly countriesService = inject(CountriesService);
  private readonly transloco = inject(TranslocoService);

  name = '';
  phone = '';
  message = '';

  submitting = signal(false);
  submitSuccess = signal(false);
  submitError = signal('');

  countries = this.countriesService.countries;
  selectedCountry = signal<DisplayCountry>(this.countriesService.defaultCountry());
  searchQuery = signal('');
  dropdownOpen = signal(false);

  filteredCountries = computed(() => this.countriesService.filter(this.searchQuery()));

  displayTitle = computed(() => {
    const customTitle = this.designOrderService.modalTitle();
    if (customTitle) return customTitle;

    const msg = this.designOrderService.prefillMessage();
    if (msg.includes('باقة') || msg.toLowerCase().includes('package')) {
      return this.transloco.translate('orderModal.packageTitle');
    }
    return this.transloco.translate('orderModal.title');
  });

  ngOnInit() {
    // Set the pre-filled message when the modal mounts (it only mounts when open)
    this.message = this.designOrderService.prefillMessage();
  }

  selectCountry(c: DisplayCountry) {
    this.selectedCountry.set(c);
    this.dropdownOpen.set(false);
    this.searchQuery.set('');
  }

  toggleDropdown() {
    this.dropdownOpen.update(v => !v);
  }

  closeDropdown(e: Event) {
    if (this.phoneRef && !this.phoneRef.nativeElement.contains(e.target)) {
      this.dropdownOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() { this.close(); }

  close() {
    this.designOrderService.closeModal();
  }

  submit() {
    if (this.submitting()) return;
    if (!this.phone) {
      this.submitError.set(this.transloco.translate('orderModal.errors.allFieldsRequired'));
      return;
    }
    this.submitting.set(true);
    this.submitError.set('');

    this.http.post(`${environment.apiUrl}/Contacts`, {
      name: this.name,
      phoneNumber: `+${this.selectedCountry().dialCode}${this.phone}`,
      message: this.message,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.submitSuccess.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message || this.transloco.translate('orderModal.errors.genericError'));
      }
    });
  }
}
