import { Component, inject, computed, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { ContentService } from '../../services/content.service';
import { SeoService } from '../../services/seo.service';
import { LanguageService } from '../../i18n/language.service';

@Component({
  selector: 'app-cancellation-policy',
  standalone: true,
  imports: [RouterModule, NavbarComponent, FooterComponent, TranslocoModule],
  templateUrl: './cancellation-policy.component.html',
  styleUrl: './cancellation-policy.component.css'
})
export class CancellationPolicyComponent implements OnInit {
  private contentService = inject(ContentService);
  private seoService = inject(SeoService);
  private transloco = inject(TranslocoService);
  readonly languageService = inject(LanguageService);

  siteName = computed(() => this.contentService.siteSettings()['site-name'] || this.transloco.translate('common.defaultCompanyName'));

  ngOnInit() {
    this.seoService.setPage({
      titleKey: 'seo.cancellationPolicy.title',
      descriptionKey: 'seo.cancellationPolicy.description',
      path: '/cancellation-policy',
      ogType: 'website',
    });
  }
}
