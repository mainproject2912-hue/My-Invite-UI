import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-privacy-section',
  standalone: true,
  imports: [TranslocoModule, RouterLink],
  templateUrl: './privacy-section.html',
  styleUrl: './privacy-section.css'
})
export class PrivacySectionComponent {}
