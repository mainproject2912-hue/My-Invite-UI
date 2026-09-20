import { Component, Input, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoService, TranslocoModule } from '@jsverse/transloco';
import { DemoService } from '../../../../services/demo.service';
import { CountriesService, DisplayCountry } from '../../../../shared/countries.service';
import { ScrollService } from '../../../../services/scroll.service';
import { ContentService } from '../../../../services/content.service';
import { MetaTrackingService } from '../../../../services/meta-tracking.service';

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
  private metaTracking = inject(MetaTrackingService);

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
          this.errorMsg.set(this.apiErrorMessage(err, 'demoForm.errors.genericError'));
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

    // One id per verify attempt: the backend reuses it for the CAPI event, so
    // Meta de-duplicates it against the Pixel event fired below.
    const eventId = this.metaTracking.newEventId();

    this.demoService.verifyOtp(this.whatsAppNumber, this.otp.trim(), eventId)
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.step.set('success');
          // Only here — the demo request is now saved in the dashboard.
          this.metaTracking.trackLead(res?.eventId || eventId, { content_name: 'Demo Request' });
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMsg.set(this.apiErrorMessage(err, 'demoForm.errors.otpInvalid'));
        }
      });
  }

  /**
   * Only 4xx bodies carry a message meant for the customer. A 500 (or a dead
   * connection) returns the API's English "An unexpected error occurred.",
   * which has no business showing up inside the Arabic form.
   */
  private apiErrorMessage(err: unknown, fallbackKey: string): string {
    const status = (err as { status?: number })?.status ?? 0;
    const message = (err as { error?: { message?: string } })?.error?.message;

    return status >= 400 && status < 500 && message
      ? message
      : this.transloco.translate(fallbackKey);
  }

  resend() {
    this.otp = '';
    this.phoneLocal = '';
    this.errorMsg.set('');
    this.step.set('form');
  }
}
