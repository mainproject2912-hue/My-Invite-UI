import { Component, signal } from '@angular/core';
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

  openIndex = signal<number | null>(0);

  toggle(i: number) {
    this.openIndex.set(this.openIndex() === i ? null : i);
  }

  isOpen(i: number) {
    return this.openIndex() === i;
  }
}
