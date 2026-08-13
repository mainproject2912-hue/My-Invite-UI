import { Component, input, ElementRef, ViewChild, signal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { InvitationCard } from '../../../../models/content.interface';
import { DesignOrderService } from '../../../../services/design-order.service';
import { LanguageService } from '../../../../i18n/language.service';

// Reference's card is a fixed 260px + 22px gap, not a responsive
// "N cards visible" width — matched here rather than kept dynamic.
const CARD_WIDTH = 260;
const CARD_GAP = 22;

@Component({
  selector: 'app-portfolio-slider',
  standalone: true,
  imports: [RouterModule, LucideAngularModule, TranslocoModule],
  templateUrl: './portfolio-slider.html',
  styleUrl: './portfolio-slider.css'
})
export class PortfolioSliderComponent {
  private designOrderService = inject(DesignOrderService);
  readonly languageService = inject(LanguageService);

  // Backend-provided category names (dynamic, stays exactly as received —
  // no synthetic "All" sentinel mixed in; that's UI-owned, see activeCategory.
  invitations = input<InvitationCard[]>([]);
  categories = input<string[]>([]);
  @ViewChild('sliderContainer') container!: ElementRef<HTMLDivElement>;

  previewCard = signal<InvitationCard | null>(null);

  // `null` = "All categories" — a stable sentinel, not a localized string,
  // so switching languages never affects the active filter's identity.
  activeCategory = signal<string | null>(null);

  // `null` = "All genders" — same stable-sentinel pattern as activeCategory.
  activeGender = signal<'ذكوري' | 'أنثوي' | null>(null);

  prevIcon = computed(() => this.languageService.activeLanguage().direction === 'rtl' ? 'chevron-right' : 'chevron-left');
  nextIcon = computed(() => this.languageService.activeLanguage().direction === 'rtl' ? 'chevron-left' : 'chevron-right');
  viewAllIcon = computed(() => this.languageService.activeLanguage().direction === 'rtl' ? 'arrow-left' : 'arrow-right');

  // Reference's drag-scrubber thumb position, 0-100, driven off the real
  // scrollLeft/scrollWidth ratio — a continuous scrub, not a stepped one.
  thumbPct = signal(0);
  private dragging = false;

  filteredInvitations = computed(() => {
    let items = this.invitations();
    const cat = this.activeCategory();
    const gender = this.activeGender();

    if (cat !== null) {
      const searchCat = cat.trim();
      items = items.filter(i =>
        (i.category && i.category.trim() === searchCat) ||
        (i.allCategories && i.allCategories.some(c => c.trim() === searchCat))
      );
    }

    if (gender !== null) {
      items = items.filter(i => i.gender === gender);
    }

    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (this.container) {
          this.container.nativeElement.scrollLeft = 0;
        }
        this.thumbPct.set(0);
      }, 50);
    }

    return items;
  });

  setCategory(cat: string | null) {
    this.activeCategory.set(cat);
  }

  setGender(gender: 'ذكوري' | 'أنثوي' | null) {
    this.activeGender.set(gender);
  }

  openPreview(card: InvitationCard) {
    this.previewCard.set(card);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  closePreview() {
    this.previewCard.set(null);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  orderDesign(card: InvitationCard) {
    this.closePreview();
    this.designOrderService.openModal(card.id);
  }

  private get step(): number {
    return CARD_WIDTH + CARD_GAP;
  }

  scrollNext() {
    this.scrollBy(this.step);
  }

  scrollPrev() {
    this.scrollBy(-this.step);
  }

  private scrollBy(delta: number): void {
    if (!this.container) return;
    const el = this.container.nativeElement;
    const isRtl = this.languageService.activeLanguage().direction === 'rtl';
    el.scrollBy({ left: isRtl ? -delta : delta, behavior: 'smooth' });
  }

  onScroll() {
    if (!this.container || this.dragging) return;
    this.updateThumbFromScroll();
  }

  private updateThumbFromScroll(): void {
    if (!this.container) return;
    const el = this.container.nativeElement;
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      this.thumbPct.set(0);
      return;
    }
    const pct = (Math.abs(el.scrollLeft) / maxScroll) * 100;
    this.thumbPct.set(Math.min(100, Math.max(0, pct)));
  }

  private scrubberEl?: HTMLElement;

  onTrackDown(event: PointerEvent, track: HTMLElement): void {
    this.scrubberEl = track;
    this.scrubToPointer(event);
    this.startDrag();
  }

  onThumbDown(event: PointerEvent, track: HTMLElement): void {
    event.stopPropagation();
    this.scrubberEl = track;
    this.startDrag();
  }

  private startDrag(): void {
    this.dragging = true;
    const move = (e: PointerEvent) => this.scrubToPointer(e);
    const up = () => {
      this.dragging = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  private scrubToPointer(event: PointerEvent): void {
    if (!this.scrubberEl || !this.container) return;
    const rect = this.scrubberEl.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const el = this.container.nativeElement;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const isRtl = this.languageService.activeLanguage().direction === 'rtl';
    // In RTL, scrollLeft runs 0 → -maxScroll and the track still reads
    // left-to-right visually, so the ratio maps directly either way.
    el.scrollLeft = isRtl ? -(ratio * maxScroll) : ratio * maxScroll;
    this.thumbPct.set(ratio * 100);
  }
}
