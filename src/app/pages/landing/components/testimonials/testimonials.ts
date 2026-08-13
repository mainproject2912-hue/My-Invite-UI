import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ContentService } from '../../../../services/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class TestimonialsComponent {
  private readonly contentService = inject(ContentService);
  readonly testimonials = this.contentService.testimonials;

  readonly stars = [0, 1, 2, 3, 4];
}
