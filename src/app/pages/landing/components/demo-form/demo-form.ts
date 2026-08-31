import { Component, Input, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { DemoService } from '../../../../services/demo.service';
import { CountriesService, DisplayCountry } from '../../../../shared/countries.service';
import { ScrollService } from '../../../../services/scroll.service';
import { ContentService } from '../../../../services/content.service';

type Step = 'form' | 'otp' | 'success';

@Component({
  selector: 'app-demo-form',
  standalone: true,
  imports: [FormsModule, LucideAngularModule, TranslocoModule],
  templateUrl: './demo-form.html',
  styleUrl: './demo-form.css'
})
export class DemoFormComponent {
  @Input() selectedCardId: number | null = null;

  private demoService = inject(DemoService);
  private countriesService = inject(CountriesService);
  private transloco = inject(TranslocoService);
  readonly scrollService = inject(ScrollService);
  private contentService = inject(ContentService);

  readonly eventTypes = this.contentService.eventTypes;

  step = signal<Step>('form');
  loading = signal(false);
  errorMsg = signal('');

  countries = this.countriesService.countries;

  // Holds only the ISO code, not the country object: DisplayCountry's
  // displayName is locale-baked, so caching the object itself froze the
  // selected country's name in whatever language was active when it was
  // picked (or on load, for the default) — it never updated when the
  // user switched language afterward. Re-deriving it here from the
  // reactive countries() list keeps it in sync.
  private selectedIso = signal<string | null>(null);
  selectedCountry = computed<DisplayCountry>(() => {
    const iso = this.selectedIso();
    const match = iso ? this.countries().find(c => c.isoCode === iso) : undefined;
    return match ?? this.countriesService.defaultCountry();
  });
  showCountryDropdown = false;

  name = '';
  phoneLocal = '';
  eventType = '';
  otp = '';

  get whatsAppNumber(): string {
    return this.selectedCountry().dialCode + this.phoneLocal.replace(/^0+/, '');
  }

  selectCountry(c: DisplayCountry) {
    this.selectedIso.set(c.isoCode);
    this.showCountryDropdown = false;
  }

  sendOtp() {
    this.errorMsg.set('');
    if (!this.phoneLocal.trim()) {
      this.errorMsg.set(this.transloco.translate('demoForm.errors.phoneRequired'));
      return;
    }

    this.loading.set(true);
    this.demoService.sendOtp(this.name.trim(), this.whatsAppNumber, this.selectedCardId ?? undefined, this.eventType || undefined)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.step.set('otp');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(err?.error?.message ?? this.transloco.translate('demoForm.errors.genericError'));
        }
      });
  }

  verifyOtp() {
    this.errorMsg.set('');
    if (!this.otp.trim()) {
      this.errorMsg.set(this.transloco.translate('demoForm.errors.otpRequired'));
      return;
    }

    this.loading.set(true);
    this.demoService.verifyOtp(this.whatsAppNumber, this.otp.trim())
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.step.set('success');
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(err?.error?.message ?? this.transloco.translate('demoForm.errors.otpInvalid'));
        }
      });
  }

  resend() {
    this.otp = '';
    this.phoneLocal = '';
    this.errorMsg.set('');
    this.step.set('form');
  }
}
