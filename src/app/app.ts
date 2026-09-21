import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map, distinctUntilChanged } from 'rxjs/operators';
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
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    // Keeps ad-click attribution (_fbc) even if the Pixel script loads late.
    this.metaTracking.captureFbclid();

    if (isPlatformBrowser(this.platformId)) {
      // Fires PageView exactly once per settled route navigation (after any redirects).
      this.router.events
        .pipe(
          filter((event): event is NavigationEnd => event instanceof NavigationEnd),
          map((event) => event.urlAfterRedirects),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.metaTracking.trackPageView();
        });
    }
  }
}

