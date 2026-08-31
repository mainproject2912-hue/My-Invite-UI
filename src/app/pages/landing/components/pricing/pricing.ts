import { Component, signal, computed, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { ContentService } from '../../../../services/content.service';
import { ScrollService } from '../../../../services/scroll.service';
import { LanguageService } from '../../../../i18n/language.service';
import { DesignOrderService } from '../../../../services/design-order.service';

interface PricingTier {
  count: number;
  price: number;
}

interface PlanData {
  id: string;
  label: string;
  tiers: PricingTier[];
  features: string[];
  compensatoryPercent: number;
  ctaLabelKey: string;
  isPopular: boolean;
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, TranslocoModule],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css'
})
export class PricingComponent {
  private contentService = inject(ContentService);
  private designOrderService = inject(DesignOrderService);
  readonly scrollService = inject(ScrollService);
  private readonly languageService = inject(LanguageService);
  readonly activeLanguage = this.languageService.activeLanguage;

  plans = computed<PlanData[]>(() => {
    const pkgs = this.contentService.packages();
    return pkgs.map(p => ({
      id: p.id,
      label: p.name,
      tiers: p.tiers || [],
      features: p.features,
      compensatoryPercent: p.compensationPercentage || 0,
      // Branches on the backend's own package-name contract value (Arabic,
      // per confirmed decision) — not a translated display string, so this
      // stays stable across languages. The CTA wording itself is now a
      // translation key rather than a hardcoded Arabic literal.
      ctaLabelKey: p.name.includes('الأعمال') ? 'pricing.ctaContactUs' : 'pricing.ctaOrderNow',
      isPopular: p.isPopular || false,
    }));
  });

  // One selected guest-count tier per card (was one global activeTab +
  // per-plan count, back when a single tab-switcher showed one plan at a
  // time). Now every plan renders as its own card simultaneously — see
  // the client reference's 3-card grid — so each card keeps its own
  // independent tier selection instead of sharing one active plan.
  selectedCounts = signal<Record<string, number>>({});

  constructor() {
    effect(() => {
      const currentPlans = this.plans();
      const existing = this.selectedCounts();
      const counts: Record<string, number> = { ...existing };
      let changed = false;
      currentPlans.forEach(p => {
        if (counts[p.id] === undefined && p.tiers?.length > 0) {
          counts[p.id] = p.tiers[0].count;
          changed = true;
        }
      });
      if (changed) this.selectedCounts.set(counts);
    });
  }

  selectedTierFor(plan: PlanData): PricingTier {
    if (!plan.tiers?.length) return { count: 0, price: 0 };
    const count = this.selectedCounts()[plan.id];
    return plan.tiers.find(t => t.count === count) ?? plan.tiers[0];
  }

  compensatoryCountFor(plan: PlanData): number {
    const tier = this.selectedTierFor(plan);
    return Math.floor(tier.count * plan.compensatoryPercent / 100);
  }

  selectCount(planId: string, count: number) {
    this.selectedCounts.update(v => ({ ...v, [planId]: count }));
  }

  isSelected(planId: string, count: number) {
    return this.selectedCounts()[planId] === count;
  }

  orderPlan(plan: PlanData, event?: Event) {
    if (event) event.preventDefault();
    const tier = this.selectedTierFor(plan);
    const countLabel = tier.count > 0 ? ` (${tier.count} دعوة - السعر: ${tier.price} ر.س)` : '';
    const message = `أود طلب باقة "${plan.label}"${countLabel}.`;
    this.designOrderService.openModalWithMessage(message, 'طلب الباقة');
  }
}
