import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-lookup-page',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="screen screen--fixed screen--bg-lookup lookup-screen">

      <header class="topbar topbar--logo-only">
        <img src="/assets/topbar-logo.svg" alt="We Love You" class="topbar-logo" />
      </header>

      <!-- Animated centre element -->
      <div class="look-up-anim">
        <div class="chevrons">
          <div class="chevron"></div>
          <div class="chevron"></div>
        </div>
        <a routerLink="/result" class="heart-badge" aria-label="See your result">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </a>
      </div>

      <h1>Look up – your heart is now beating with Dubai.</h1>

      <!-- Bottom stats block -->
      <div class="sync-block">
        <p class="sub-copy">
          Join the collective rhythm of the city. The transformation is happening above you.
        </p>
        <div class="progress-bar" aria-hidden="true">
          <div class="progress-bar__fill" [style.width.%]="portraitCount()"></div>
        </div>
        <p class="t-count">{{ portraitCount() | number }} HEARTS SYNCED</p>
      </div>

    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LookupPage implements OnInit {
  readonly portraitCount = signal<number | null>(null);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private getPortraitCount(): void {
    this.http.get(`${environment.apiUrl}/api/Users/count`).subscribe({
      next: (res: any) => {
        this.portraitCount.set(res?.usersCount);
      },
      error: (err) => {
        console.error('Error fetching portrait count:', err);
      }
    });
  }

  ngOnInit(): void {
    this.getPortraitCount();
    // Set a timeout for 10 seconds (8,000 milliseconds)
    setTimeout(() => {
      this.router.navigate(['/result']);
    }, 8000);
  }
}

