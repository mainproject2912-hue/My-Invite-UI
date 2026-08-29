import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css'
})
export class HowItWorksComponent {
  readonly steps = [0, 1, 2, 3];
}
