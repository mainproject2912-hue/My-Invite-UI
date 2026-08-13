import { Component, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';
import { ContentService } from '../../../../services/content.service';
import { ScrollService } from '../../../../services/scroll.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent {
  private readonly contentService = inject(ContentService);
  readonly scrollService = inject(ScrollService);
  private readonly carouselCards = this.contentService.carouselCards;

  // Reference's phone mockup shows one static design shot — using the
  // first real card from the library rather than a placeholder so the
  // hero still reflects actual product imagery.
  readonly mockCard = computed(() => this.carouselCards()[0] ?? null);

  readonly badges = [
    { icon: 'qr-code', key: 'hero.badges.b0' },
    { icon: 'message-circle', key: 'hero.badges.b1' },
    { icon: 'bell', key: 'hero.badges.b2' },
    { icon: 'bar-chart-3', key: 'hero.badges.b3' }
  ];

  // Reference tracks the cursor and re-centers the nebula glow under it
  // via a CSS transform, recomputed on every mousemove.
  glowTransform = 'translate(0px, 0px)';

  onHeroMouseMove(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const damp = 0.15;
    this.glowTransform = `translate(${x * damp}px, ${y * damp}px)`;
  }
}
