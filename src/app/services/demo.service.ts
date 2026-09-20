import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MetaTrackingService } from './meta-tracking.service';

@Injectable({ providedIn: 'root' })
export class DemoService {
  private http = inject(HttpClient);
  private metaTracking = inject(MetaTrackingService);
  private apiUrl = `${environment.apiUrl}/demo`;

  // No Meta tracking on this step: the request is not confirmed until the OTP is verified.
  sendOtp(name: string, whatsAppNumber: string, invitationCardId?: number, eventType?: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/send-otp`, {
      name,
      whatsAppNumber,
      invitationCardId: invitationCardId ?? null,
      eventType: eventType || null
    });
  }

  /** The real submission moment — carries the eventId so the backend CAPI call reuses it. */
  verifyOtp(whatsAppNumber: string, otp: string, eventId: string): Observable<{ message: string; eventId?: string }> {
    return this.http.post<{ message: string; eventId?: string }>(
      `${this.apiUrl}/verify-otp`,
      { whatsAppNumber, otp, eventId },
      { headers: this.metaTracking.metaHeaders(eventId) }
    );
  }
}
