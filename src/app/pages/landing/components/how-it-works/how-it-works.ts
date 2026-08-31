import { Component, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export interface StepItem {
  id: number;
  number: string;
  image: string;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css'
})
export class HowItWorksComponent {
  readonly steps: StepItem[] = [
    { id: 0, number: '01', image: 'assets/images/section/1.jpg' },
    { id: 1, number: '02', image: 'assets/images/section/2.jpg' },
    { id: 2, number: '03', image: 'assets/images/section/3.jpg' },
    { id: 3, number: '04', image: 'assets/images/section/4.jpg' }
  ];

  activeStep = signal<number>(0);
  modalImage = signal<string | null>(null);
  modalStepId = signal<number | null>(null);

  setActiveStep(id: number): void {
    this.activeStep.set(id);
  }

  openImageModal(image: string, stepId: number): void {
    this.modalImage.set(image);
    this.modalStepId.set(stepId);
  }

  closeImageModal(): void {
    this.modalImage.set(null);
    this.modalStepId.set(null);
  }

  handleImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
    }
  }
}

