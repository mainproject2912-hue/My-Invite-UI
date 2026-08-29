import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-journey-visualizer',
  standalone: true,
  imports: [TranslocoModule, LucideAngularModule],
  templateUrl: './journey-visualizer.html',
  styleUrl: './journey-visualizer.css'
})
export class JourneyVisualizerComponent {
  steps = [
    {
      num: '01',
      icon: 'eye',
      titleKey: 'journey.step1Title',
      descKey: 'journey.step1Desc'
    },
    {
      num: '02',
      icon: 'lightbulb',
      titleKey: 'journey.step2Title',
      descKey: 'journey.step2Desc'
    },
    {
      num: '03',
      icon: 'sparkles',
      titleKey: 'journey.step3Title',
      descKey: 'journey.step3Desc'
    },
    {
      num: '04',
      icon: 'smartphone',
      titleKey: 'journey.step4Title',
      descKey: 'journey.step4Desc'
    },
    {
      num: '05',
      icon: 'user-check',
      titleKey: 'journey.step5Title',
      descKey: 'journey.step5Desc'
    },
    {
      num: '06',
      icon: 'shopping-bag',
      titleKey: 'journey.step6Title',
      descKey: 'journey.step6Desc'
    }
  ];
}
