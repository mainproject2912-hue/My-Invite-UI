import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DemoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/demo`;

  sendOtp(name: string, whatsAppNumber: string, invitationCardId?: number, eventType?: string, category?: string): Observable<{ message: string }> {
    const catValue = category || null;
    const isCompanyBool = catValue === 'company' || catValue === 'companies' || catValue === 'شركات' || catValue === 'شركة';

    return this.http.post<{ message: string }>(`${this.apiUrl}/send-otp`, {
      name,
      whatsAppNumber,
      invitationCardId: invitationCardId ?? null,
      eventType: eventType || null,
      category: catValue,
      clientType: catValue,
      userType: catValue,
      customerType: catValue,
      accountType: catValue,
      entityType: catValue,
      type: catValue,
      isCompany: isCompanyBool
    });
  }

  verifyOtp(whatsAppNumber: string, otp: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/verify-otp`, {
      whatsAppNumber,
      otp
    });
  }
}
