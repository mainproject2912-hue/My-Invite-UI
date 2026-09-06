import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterModule, NavbarComponent, FooterComponent, TranslocoModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.css'
})
export class PrivacyPolicyComponent implements OnInit {
  private contentService = inject(ContentService);
  private seoService = inject(SeoService);
  private transloco = inject(TranslocoService);
  readonly languageService = inject(LanguageService);

  siteName = computed(() => this.contentService.siteSettings()['site-name'] || this.transloco.translate('common.defaultCompanyName'));
  contactEmail = computed(() => this.contentService.siteSettings()['contact-email'] || '');
  contactPhone = computed(() => this.contentService.siteSettings()['contact-phone'] || '');

  ngOnInit() {
    this.seoService.setPage({
      titleKey: 'seo.privacyPolicy.title',
      descriptionKey: 'seo.privacyPolicy.description',
      path: '/privacy-policy',
      ogType: 'website',
    });
  }
}
