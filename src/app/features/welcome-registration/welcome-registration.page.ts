import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { getNames } from 'country-list';
import { UiInputComponent } from '../../shared/components/ui-input/ui-input.component';
import { AppFlowStore } from '../../core/state/app-flow.store';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-welcome-registration-page',
  standalone: true,
  imports: [UiInputComponent],
  template: `
  <div class="screen screen--scroll screen--bg-welcome welcome-screen">

    <header class="topbar">
      <img src="/assets/topbar-logo.svg" alt="We Love You" class="topbar-logo" />
      <button type="button" class="menu-btn" aria-label="menu"></button>
    </header>

    <h1>Dubai we<br />love you !</h1>

    <p class="t-lead">
      Share your portrait and become part of the living heart of the city.
    </p>

    <!-- Hero portraits block -->
    <div class="hero-block">
      <img
        src="/assets/welcome-portraits.png"
        alt="Portrait collage"
        class="hero-block__img"
      />

      <!-- Progress bar — [style.width.%] bound from portraitCount() -->
      <div class="progress-bar" aria-hidden="true">
        <div class="progress-bar__fill" [style.width.%]="portraitCount()"></div>
      </div>

      <div class="stats">
        <span class="stats__item">{{ portraitCount() }} PORTRAITS</span>
        <span class="stats__item stats__item--live">
          <i class="pulse-dot" aria-hidden="true"></i>LIVE PULSE
        </span>
      </div>
    </div>

    <!-- Form panel -->
    <div class="form-panel">
      <app-ui-input label="Full Name" placeholder="Enter your name" [value]="fullName()" (valueChange)="fullName.set($event)" />
      @if (showErrors() && fullName().trim().length === 0) {
        <p class="field-error">Please enter your full name.</p>
      }
      <app-ui-input
        label="Nationality"
        placeholder="Select your nationality"
        [isSelect]="true"
        [options]="countryOptions"
        [value]="nationality()"
        (valueChange)="nationality.set($event)"
      />
      @if (showErrors() && nationality().trim().length === 0) {
        <p class="field-error">Please select your nationality.</p>
      }
      <app-ui-input label="Email Address" type="email" placeholder="heartbeat@dubai.ae" [value]="email()" (valueChange)="email.set($event)" />
      @if (showErrors() && !isEmailValid()) {
        <p class="field-error">Please enter a valid email address.</p>
      }
    </div>

    <button type="button" class="action-btn" (click)="onJoinHeart()">
      JOIN THE HEART
    </button>

    <p class="agreement">
      BY JOINING, YOU AGREE TO BECOME PART OF THE PUBLIC DUBAI DIGITAL INSTALLATION.
    </p>

  </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WelcomeRegistrationPage {
  readonly countryOptions: string[] = getNames().sort((a: string, b: string) => a.localeCompare(b));
  readonly fullName = signal('');
  readonly nationality = signal('');
  readonly email = signal('');
  // readonly yearsInDubai = signal('');
  readonly showErrors = signal(false);
  readonly isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim()));
  // readonly isYearsValid = computed(() => {
  //   return /^\d+$/.test(this.yearsInDubai().trim());
  // });
  readonly canProceed = computed(() => {
    return (
      this.fullName().trim().length > 0 &&
      this.nationality().trim().length > 0 &&
      this.isEmailValid()
      // &&
      // this.isYearsValid()
    );
  });

  private readonly router = inject(Router);
  private readonly appFlowStore = inject(AppFlowStore);
  private readonly http = inject(HttpClient);
  readonly portraitCount = signal<number | null>(null);

  onJoinHeart(): void {
    if (!this.canProceed()) {
      this.showErrors.set(true);
      return;
    }

    this.showErrors.set(false);
    // const parsedYears = Number.parseInt(this.yearsInDubai(), 10);
    this.appFlowStore.setRegistration({
      fullName: this.fullName().trim(),
      nationality: this.nationality(),
      email: this.email().trim()
      // yearsInDubai: Number.isFinite(parsedYears) ? parsedYears : null
    });

    this.router.navigateByUrl('/selfie');
  }

  // onYearsChange(value: string): void {
  //   this.yearsInDubai.set(value.replace(/\D+/g, ''));
  // }

  private getPortraitCount(): void {
    this.http.get(`${environment.apiUrl}/api/Users/count`).subscribe({
      next: (res: any) => {
        this.portraitCount.set(res);
      },
      error: (err) => {
        console.error('Error fetching portrait count:', err);
      }
    });
  }

  ngOnInit(): void {
    this.getPortraitCount();
  }
}
