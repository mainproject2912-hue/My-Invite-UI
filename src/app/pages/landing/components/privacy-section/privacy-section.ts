import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageService } from '../../../../i18n/language.service';

@Component({
  selector: 'app-privacy-section',
  standalone: true,
  imports: [TranslocoModule, RouterLink],
  templateUrl: './privacy-section.html',
  styleUrl: './privacy-section.css'
})
export class PrivacySectionComponent {
  readonly languageService = inject(LanguageService);
}
