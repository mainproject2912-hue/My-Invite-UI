import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Custom data sent alongside a Lead event (content_name, value, currency, ...). */
export type MetaCustomData = Record<string, string | number | undefined>;

/**
 * One place for all Meta Lead tracking on the landing page.
 *
 * The rule every form follows: generate one `eventId` per submit attempt, send it
 * to our API (body + headers) so the server-side CAPI call reuses it, and only fire
 * the browser Pixel event *after* the API confirmed the submission was saved.
 * Sharing the id between Pixel and CAPI is what lets Meta de-duplicate the pair.
 *
 * The CAPI access token lives on the backend only — nothing here talks to Meta
 * except the Pixel.
 */
@Injectable({ providedIn: 'root' })
export class MetaTrackingService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  /** Unique id for one submission, shared by the Pixel event and the CAPI event. */
  newEventId(): string {
    if (this.isBrowser && typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().replace(/-/g, '');
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }

  /**
   * Headers every tracked request carries. The backend uses `_fbp` / `_fbc` and the
   * source URL to improve Event Match Quality; it falls back to the cookies and the
   * Referer header when they are missing.
   */
  metaHeaders(eventId: string): Record<string, string> {
    const headers: Record<string, string> = { 'X-Meta-Event-Id': eventId };
    if (!this.isBrowser) return headers;

    headers['X-Meta-Source-Url'] = window.location.href;

    const fbp = this.readCookie('_fbp');
    const fbc = this.readCookie('_fbc');
    if (fbp) headers['X-Meta-Fbp'] = fbp;
    if (fbc) headers['X-Meta-Fbc'] = fbc;

    return headers;
  }

  /**
   * Fires the browser-side Lead. Call it only after the API returned success —
   * never on submit click, never in a finally/error branch.
   */
  trackLead(eventId: string, customData: MetaCustomData = {}): void {
    if (!this.isBrowser || typeof window.fbq !== 'function') return;

    // `eventID` (capital D) is what the Pixel API expects; any other spelling
    // silently breaks de-duplication against the server event.
    window.fbq('track', 'Lead', customData, { eventID: eventId });
  }

  /**
   * The Pixel only writes `_fbc` if it loaded while `fbclid` was still in the URL.
   * Capturing it ourselves on app start keeps ad-click attribution for visitors who
   * navigate away before the script finishes loading.
   */
  captureFbclid(): void {
    if (!this.isBrowser) return;

    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (!fbclid || this.readCookie('_fbc')) return;

    const fbc = `fb.1.${Date.now()}.${fbclid}`;
    document.cookie = `_fbc=${fbc}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;
  }

  private readCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }
}
