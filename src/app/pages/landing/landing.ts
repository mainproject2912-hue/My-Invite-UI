import { Component, inject, computed, OnInit } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ContentService } from '../../services/content.service';
import { DesignOrderService } from '../../services/design-order.service';
import { SeoService } from '../../services/seo.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

// Sub-components
import { HeroComponent } from './components/hero/hero';
import { PlatformModulesComponent } from './components/platform-modules/platform-modules';
import { PortfolioSliderComponent } from './components/portfolio-slider/portfolio-slider';
import { JourneyVisualizerComponent } from './components/journey-visualizer/journey-visualizer';
import { HowItWorksComponent } from './components/how-it-works/how-it-works';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us';
import { SmartSystemComponent } from './components/smart-system/smart-system';
import { PricingComponent } from './components/pricing/pricing';
import { AppShowcaseComponent } from './components/app-showcase/app-showcase';
import { TestimonialsComponent } from './components/testimonials/testimonials';
import { WhyRiyadhComponent } from './components/why-riyadh/why-riyadh';
import { PrivacySectionComponent } from './components/privacy-section/privacy-section';
import { FinalCtaComponent } from './components/final-cta/final-cta';
import { DemoFormComponent } from './components/demo-form/demo-form';
import { BlogComponent } from './components/blog/blog';
import { ContactComponent } from './components/contact/contact';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';
import { FaqComponent } from './components/faq/faq';
import { OrderRequestComponent } from './components/order-request/order-request';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    ScrollRevealDirective,
    NavbarComponent,
    FooterComponent,
    HeroComponent,
    PlatformModulesComponent,
    PortfolioSliderComponent,
    JourneyVisualizerComponent,
    HowItWorksComponent,
    WhyChooseUsComponent,
    SmartSystemComponent,
    PricingComponent,
    OrderRequestComponent,
    AppShowcaseComponent,
    TestimonialsComponent,
    WhyRiyadhComponent,
    PrivacySectionComponent,
    ContactComponent,
    FinalCtaComponent,
    DemoFormComponent,
    BlogComponent,
    FaqComponent,
    OrderModalComponent
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingPageComponent implements OnInit {
  private contentService = inject(ContentService);
  private designOrderService = inject(DesignOrderService);
  private seoService = inject(SeoService);

  showOrderModal = this.designOrderService.showModal;

  services = this.contentService.services;
  packages = this.contentService.packages;
  invitations = this.contentService.invitations;
  carouselCards = this.contentService.carouselCards;
  supervisors = this.contentService.supervisors;
  eventTypes = this.contentService.eventTypes;
  blogPosts = this.contentService.blogPosts;

  // Backend-provided category names only — the "All" filter option is
  // UI-owned and handled inside PortfolioSliderComponent via a stable
  // `null` sentinel, not mixed into this list as a synthetic string.
  categories = computed(() => this.eventTypes().map(et => et.name));

  ngOnInit() {
    this.seoService.setPage({
      titleKey: 'seo.home.title',
      descriptionKey: 'seo.home.description',
      path: '',
      keywords: 'كروت دعوة رقمية, دعوات زواج, دعوات تخرج, بطاقات دعوة, مناسبات خاصة, Special Cards, مؤسسة بطاقتي الخاصة',
      ogType: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'Special Cards | مؤسسة بطاقتي الخاصة',
        url: 'https://www.specialcards.net',
        logo: 'https://www.specialcards.net/assets/images/tab.png',
        description: 'كروت دعوة رقمية فاخرة لجميع مناسباتك - حفلات زواج، تخرج، مناسبات خاصة',
        priceRange: '$$',
        serviceType: 'Digital Invitation Cards',
        areaServed: 'SA',
        availableLanguage: 'Arabic'
      }
    });
  }
}
