import { Component, inject, computed, OnInit } from '@angular/core';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';
import { ContentService } from '../../services/content.service';
import { DesignOrderService } from '../../services/design-order.service';
import { SeoService } from '../../services/seo.service';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';

// Sub-components
import { HeroComponent } from './components/hero/hero';
import { AboutComponent } from './components/about/about';
import { PlatformModulesComponent } from './components/platform-modules/platform-modules';
import { WhyChooseUsComponent } from './components/why-choose-us/why-choose-us';
import { SmartSystemComponent } from './components/smart-system/smart-system';
import { ReceptionManagementComponent } from './components/reception-management/reception-management';
import { AppShowcaseComponent } from './components/app-showcase/app-showcase';
import { WhyRiyadhComponent } from './components/why-riyadh/why-riyadh';
import { TechPlatformComponent } from './components/tech-platform/tech-platform';
import { PrivacySectionComponent } from './components/privacy-section/privacy-section';
import { FinalCtaComponent } from './components/final-cta/final-cta';
import { HowItWorksComponent } from './components/how-it-works/how-it-works';
import { DemoFormComponent } from './components/demo-form/demo-form';
import { PricingComponent } from './components/pricing/pricing';
import { PortfolioSliderComponent } from './components/portfolio-slider/portfolio-slider';
import { SupervisorsComponent } from './components/supervisors/supervisors';
import { AdditionalServicesComponent } from './components/additional-services/additional-services';
import { BlogComponent } from './components/blog/blog';
import { ContactComponent } from './components/contact/contact';
import { OrderModalComponent } from '../../components/order-modal/order-modal.component';
import { PlatformFeaturesComponent } from './components/platform-features/platform-features';
import { OrderRequestComponent } from './components/order-request/order-request';
import { TestimonialsComponent } from './components/testimonials/testimonials';
import { FaqComponent } from './components/faq/faq';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    ScrollRevealDirective,
    NavbarComponent,
    FooterComponent,
    HeroComponent,
    AboutComponent,
    PlatformModulesComponent,
    WhyChooseUsComponent,
    SmartSystemComponent,
    ReceptionManagementComponent,
    AppShowcaseComponent,
    WhyRiyadhComponent,
    TechPlatformComponent,
    PrivacySectionComponent,
    FinalCtaComponent,
    HowItWorksComponent,
    DemoFormComponent,
    PricingComponent,
    PortfolioSliderComponent,
    SupervisorsComponent,
    AdditionalServicesComponent,
    BlogComponent,
    ContactComponent,
    OrderModalComponent,
    PlatformFeaturesComponent,
    OrderRequestComponent,
    TestimonialsComponent,
    FaqComponent
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
