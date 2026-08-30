import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Service, Package, InvitationCard, Supervisor, Testimonial, BlogPost, EventType, SiteSettings } from '../models/content.interface';
import { DesignOrderService } from './design-order.service';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Arabic Event Types
  eventTypes = signal<EventType[]>([]);

  // Arabic Packages
  packages = signal<Package[]>([]);

  // Arabic Invitations
  invitations = signal<InvitationCard[]>([]);
  
  // Carousel Invitations
  carouselCards = signal<InvitationCard[]>([]);

  // Arabic Supervisors
  supervisors = signal<Supervisor[]>([]);
  supervisorsLoading = signal<boolean>(true);
  supervisorsError = signal<string | null>(null);

  // Arabic Blog Posts
  blogPosts = signal<BlogPost[]>([]);

  // Arabic Testimonials
  testimonials = signal<Testimonial[]>([]);

  // Locations
  countries = signal<any[]>([]);
  cities = signal<any[]>([]);

  services = signal<Service[]>([
    { id: '1', title: 'دعوات الزفاف', description: 'تصاميم فاخرة تليق بليلة العمر.', icon: 'heart' },
    { id: '2', title: 'مناسبات الشركات', description: 'حلول احترافية لفعاليات أعمالكم.', icon: 'briefcase' }
  ]);
  
  siteSettings = signal<SiteSettings>({
    'site-name': 'مؤسسة بطاقتي الخاصة',
    'contact-email': '',
    'contact-phone': '',
    'whatsapp-number': '',
    'facebook-url': 'https://www.facebook.com/profile.php?id=61592715750182',
    'instagram-url': 'https://www.instagram.com/specialcardsapp?utm_source=qr',
    'address': '',
    'design-order-message': 'يعجبني تصميم الكارت بالكود "{id}"'
  });

  private designOrderService = inject(DesignOrderService);

  constructor() {
    this.fetchAllData();
    this.fetchSiteSettings();
  }



  private fetchSiteSettings() {
    this.http.get<any>(`${this.apiUrl}/SiteSettings`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (data) {
          this.siteSettings.update(current => ({ ...current, ...data }));
          if (data['design-order-message']) {
            this.designOrderService.setTemplate(data['design-order-message']);
          }
        }
      },
      error: (err) => console.error('Error fetching site settings:', err)
    });
  }

  private fetchAllData() {
    // Fetch event types first so invitations can resolve names from IDs
    this.http.get<any>(`${this.apiUrl}/EventTypes`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;
        const formatted = data.map((item: any) => ({
          id: (item.id || item.Id || '').toString(),
          name: item.name || item.Name || '',
          imageUrl: this.resolveUrl(item.imageUrl || item.ImageUrl || '')
        }));
        this.eventTypes.set(formatted);
        // Build id→name lookup then fetch invitations
        const idToName = new Map<string, string>(formatted.map(e => [e.id, e.name]));
        this.fetchInvitations(idToName);
        this.fetchCarouselCards(idToName);
      },
      error: (err) => {
        console.error('Error fetching event types:', err);
        this.fetchInvitations(new Map());
      }
    });
    this.fetchPackages();
    this.fetchSupervisors();
    this.fetchBlogPosts();
    this.fetchTestimonials();
    this.fetchCountries();
    this.fetchCities();
  }

  private extractData(res: any): any {
    if (res && res.data) return res.data;
    if (res && res.Data) return res.Data;
    return res;
  }

  private fetchPackages() {
    this.http.get<any>(`${this.apiUrl}/Packages/active`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;
        const formatted = data.map(item => {
          const tiers = item.pricingTiers || item.PricingTiers || [];
          return {
            id: (item.id || item.Id || '').toString(),
            name: item.name || item.Name || '',
            price: (tiers?.[0]?.price || tiers?.[0]?.Price || '0').toString(),
            description: item.description || item.Description || '',
            features: (item.features || item.Features || []).map((f: any) => f.description || f.Description || ''),
            isPopular: item.isPopular || item.IsPopular || false,
            compensationPercentage: item.compensationPercentage || item.CompensationPercentage || 0,
            tiers: tiers.map((t: any) => ({
              count: t.maxInvitations || t.MaxInvitations || 0,
              price: t.price || t.Price || 0
            })) || []
          };
        });
        this.packages.set(formatted);
      },
      error: (err) => console.error('Error fetching packages:', err)
    });
  }

  private resolveUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base = this.apiUrl.replace(/\/api\/?$/, '');
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private fetchInvitations(idToName: Map<string, string>) {
    this.http.get<any>(`${this.apiUrl}/InvitationCards/visible`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;

        const formatted = data
          .filter((item: any) => item && (item.id || item.Id) && (item.imageUrl || item.ImageUrl)?.trim())
          .map((item: any) => this.mapCard(item, idToName));
        this.invitations.set(formatted);
      },
      error: (err) => console.error('Error fetching invitations:', err)
    });
  }

  private mapCard(item: any, idToName: Map<string, string>): InvitationCard {
    const ids: any[] = item.eventTypeIds || item.EventTypeIds || [];
    const eventTypeNames: string[] = ids
      .map((id: any) => idToName.get(id.toString()))
      .filter((n): n is string => !!n);

    const rawGender = item.gender ?? item.Gender;
    const gender = rawGender === 0 ? 'ذكوري' : rawGender === 1 ? 'أنثوي' : undefined;

    return {
      id: (item.id || item.Id || Math.random()).toString(),
      title: item.title || item.Title || 'بدون عنوان',
      category: eventTypeNames[0] || item.category || item.Category || 'عام',
      allCategories: eventTypeNames,
      price: (item.price || item.Price || '0').toString(),
      imageUrl: this.resolveUrl(item.imageUrl || item.ImageUrl),
      gender,
      isNew: (item.rating || item.Rating || 0) >= 4
    };
  }

  private fetchCarouselCards(idToName?: Map<string, string>) {
    const lookup = idToName || new Map<string, string>(this.eventTypes().map(e => [e.id, e.name]));
    this.http.get<any>(`${this.apiUrl}/InvitationCards/carousel`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;
        const formatted = data.map((item: any) => this.mapCard(item, lookup));
        this.carouselCards.set(formatted as InvitationCard[]);
      },
      error: (err) => console.error('Error fetching carousel cards:', err)
    });
  }

  retryFetchSupervisors() {
    this.fetchSupervisors();
  }

  private fetchSupervisors() {
    this.supervisorsLoading.set(true);
    this.supervisorsError.set(null);

    // The endpoint's declared response content-type is
    // application/octet-stream (it still serves JSON) — set explicitly
    // rather than relying on the default Accept header.
    const headers = new HttpHeaders({ accept: 'application/octet-stream' });

    this.http.get<any>(`${this.apiUrl}/Supervisors/visible`, { headers }).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) {
          this.supervisors.set([]);
          this.supervisorsLoading.set(false);
          return;
        }
        const formatted: Supervisor[] = data.map(item => {
          const supervisor: Supervisor = {
            id: (item.id || item.Id || '').toString(),
            name: item.name || item.Name || '',
            role: item.nickname || item.Nickname || item.role || item.Role || '',
            imageUrl: this.resolveUrl(item.imageUrl || item.ImageUrl || ''),
            rating: Number(item.rating ?? item.Rating ?? 0),
          };
          // Optional fields the API doesn't return today — only attached
          // if actually present, so the card can omit them cleanly
          // instead of rendering "undefined".
          const reviewsCount = item.reviewsCount ?? item.ReviewsCount;
          if (reviewsCount !== undefined && reviewsCount !== null) {
            supervisor.reviewsCount = Number(reviewsCount);
          }
          const city = item.city || item.City;
          if (city) {
            supervisor.city = city;
          }
          return supervisor;
        });
        this.supervisors.set(formatted);
        this.supervisorsLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching supervisors:', err);
        this.supervisorsError.set('load-failed');
        this.supervisorsLoading.set(false);
      }
    });
  }

  private fetchBlogPosts() {
    this.http.get<any>(`${this.apiUrl}/Blog/published`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;
        const formatted = data.map(item => {
          const rawContent = item.content || '';
          const wordCount = rawContent.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
          const readMinutes = Math.max(1, Math.ceil(wordCount / 200));
          const excerpt = rawContent.replace(/<[^>]+>/g, '').substring(0, 150).trim();

          return {
            id: item.id.toString(),
            title: item.title || '',
            // No hardcoded UI-language fallback here — category/author are
            // raw backend values (empty string if absent); the display
            // layer supplies a translated default so it stays reactive to
            // the active language instead of being baked in at fetch time.
            category: item.category || '',
            date: new Date(item.createdAt || item.createdDate || Date.now()).toISOString().split('T')[0],
            excerpt: excerpt ? excerpt + '…' : '',
            imageUrl: this.resolveUrl(item.imageUrl),
            readMinutes,
            slug: item.slug || item.id.toString(),
            metaTitle: item.metaTitle || item.title || '',
            metaDescription: item.metaDescription || '',
            altText: item.altText || item.title || '',
            author: item.author || '',
            tags: item.tags || '',
            content: rawContent
          };
        });
        this.blogPosts.set(formatted);
      },
      error: (err) => console.error('Error fetching blog posts:', err)
    });
  }

  private fetchTestimonials() {
    this.http.get<any>(`${this.apiUrl}/Testimonials/visible`).subscribe({
      next: (res) => {
        const data = this.extractData(res);
        if (!Array.isArray(data)) return;
        const formatted = data.map(item => ({
          id: item.id.toString(),
          name: item.name,
          role: item.role,
          content: item.content,
          rating: item.rating,
          eventType: 'عام'
        }));
        this.testimonials.set(formatted);
      },
      error: (err) => console.error('Error fetching testimonials:', err)
    });
  }

  getBlogPostById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/Blog/${id}`).pipe(
      map(res => this.extractData(res))
    );
  }

  private fetchCountries() {
    this.http.get<any>(`${this.apiUrl}/Countries`).subscribe({
      next: (res) => this.countries.set(this.extractData(res)),
      error: (err) => console.error('Error fetching countries:', err)
    });
  }


  private fetchCities() {
    this.http.get<any>(`${this.apiUrl}/Cities`).subscribe({
      next: (res) => this.cities.set(this.extractData(res)),
      error: (err) => console.error('Error fetching cities:', err)
    });
  }
}
