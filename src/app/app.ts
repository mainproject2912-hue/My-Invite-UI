import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaTrackingService } from './services/meta-tracking.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('My-Invite-UI');

  private metaTracking = inject(MetaTrackingService);

  constructor() {
    // Keeps ad-click attribution (_fbc) even if the Pixel script loads late.
    this.metaTracking.captureFbclid();
  }
}
