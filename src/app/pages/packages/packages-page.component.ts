import { Component, signal, computed, inject, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { ContentService } from '../../services/content.service';
import { DesignOrderService } from '../../services/design-order.service';
import { LanguageService } from '../../i18n/language.service';
import { SeoService } from '../../services/seo.service';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';

interface PricingTier {
  count: number;
  price: number;
}

interface ProcessedPackage {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  isPopular: boolean;
  compensationPercentage: number;
  tiers: PricingTier[];
  ctaLabelKey: string;
}

@Component({
  selector: 'app-packages-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    TranslocoModule,
    NavbarComponent,
    FooterComponent,
    OrderModalComponent
  ],
  templateUrl: './packages-page.component.html',
  styleUrl: './packages-page.component.css'
})
export class PackagesPageComponent implements OnInit {
  private contentService = inject(ContentService);
  private designOrderService = inject(DesignOrderService);
  private seoService = inject(SeoService);
  readonly languageService = inject(LanguageService);
  readonly activeLanguage = this.languageService.activeLanguage;

  showOrderModal = this.designOrderService.showModal;
  siteSettings = this.contentService.siteSettings;

  rawPackages = this.contentService.packages;

  packagesList = computed<ProcessedPackage[]>(() => {
    const pkgs = this.rawPackages();
    return pkgs.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      features: p.features || [],
      isPopular: !!p.isPopular,
      compensationPercentage: p.compensationPercentage || 0,
      tiers: p.tiers || [],
      ctaLabelKey: p.name.includes('الأعمال') ? 'pricing.ctaContactUs' : 'pricing.ctaOrderNow'
    }));
  });

  selectedCounts = signal<Record<string, number>>({});

  constructor() {
    effect(() => {
      const list = this.packagesList();
      const current = this.selectedCounts();
      const next: Record<string, number> = { ...current };
      let updated = false;
      list.forEach(p => {
        if (next[p.id] === undefined && p.tiers?.length > 0) {
          next[p.id] = p.tiers[0].count;
          updated = true;
        }
      });
      if (updated) {
        this.selectedCounts.set(next);
      }
    });
  }

  ngOnInit() {
    this.seoService.setPage({
      titleKey: 'seo.packages.title',
      descriptionKey: 'seo.packages.description',
      path: '/packages',
      keywords: 'باقات كروت الدعوات, أسعار بطاقات الدعوة, باقات الزواج, باقات المناسبات, Special Cards, مؤسسة بطاقتي الخاصة',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'باقات وأسعار Special Cards',
        description: 'تفاصيل باقات الدعوات الرقمية الفاخرة وإدارة الحضور',
        url: 'https://www.specialcards.net/packages'
      }
    });
  }

  selectedTierFor(pkg: ProcessedPackage): PricingTier {
    if (!pkg.tiers?.length) {
      return { count: 0, price: Number(pkg.price) || 0 };
    }
    const selectedCount = this.selectedCounts()[pkg.id];
    return pkg.tiers.find(t => t.count === selectedCount) ?? pkg.tiers[0];
  }

  compensatoryCountFor(pkg: ProcessedPackage): number {
    const tier = this.selectedTierFor(pkg);
    return Math.floor(tier.count * pkg.compensationPercentage / 100);
  }

  selectCount(pkgId: string, count: number) {
    this.selectedCounts.update(v => ({ ...v, [pkgId]: count }));
  }

  isSelected(pkgId: string, count: number): boolean {
    return this.selectedCounts()[pkgId] === count;
  }

  orderPackage(pkg: ProcessedPackage) {
    const tier = this.selectedTierFor(pkg);
    const countLabel = tier.count > 0 ? ` (${tier.count} دعوة - السعر: ${tier.price} ر.س)` : '';
    const message = `أود طلب باقة "${pkg.name}"${countLabel}.`;
    this.designOrderService.openModalWithMessage(message, 'طلب الباقة');
  }
}
