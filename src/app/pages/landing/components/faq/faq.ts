import { Component, computed, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class FaqComponent {
  readonly indices = Array.from({ length: 12 }, (_, i) => i);
  readonly initialCount = 6;

  openIndex = signal<number | null>(0);
  showAll = signal(false);

  visibleIndices = computed(() =>
    this.showAll() ? this.indices : this.indices.slice(0, this.initialCount)
  );

  toggle(i: number) {
    this.openIndex.set(this.openIndex() === i ? null : i);
  }

  isOpen(i: number) {
    return this.openIndex() === i;
  }

  toggleShowAll() {
    this.showAll.set(!this.showAll());
  }
}
