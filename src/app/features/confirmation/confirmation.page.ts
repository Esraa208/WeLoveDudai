import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink, Router } from '@angular/router';
import { AppFlowStore } from '../../core/state/app-flow.store';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-confirmation-page',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="screen screen--fixed screen--bg-dark confirmation-screen">

    <header class="topbar topbar--back-only">
      <a routerLink="/selfie" class="back-link" aria-label="go back">
        <!-- back arrow SVG -->
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
           <line x1="19" y1="12" x2="5" y2="12"></line>
           <polyline points="12 19 5 12 12 5"></polyline>
         </svg>
      </a>
    </header>


    <!-- Center zone -->
    <div class="content-body">
      <p class="t-step">STEP 3 OF 3</p>
      <h1 class="t-h1">Confirmation</h1>

      <!-- Photo preview frame -->
      <div class="frame frame--rect">
        @if (selfieUrl()) {
          <img [src]="selfieUrl()!" class="frame__media" alt="Your selfie" />
        } @else {
          <div class="frame__placeholder"></div>
        }
      </div>
    </div>

    <!-- Bottom CTA -->
    <div class="bottom-action">
      <button
        class="action-btn action-btn--constrained"
        [class.loading]="submitting()"
        [disabled]="submitting()"
        (click)="submit()"
      >
        @if (submitting()) {
          <span class="spinner"></span> Submitting…
        } @else {
          Submit
        }
      </button>
    </div>

     @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }

  </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationPage {
  private readonly http = inject(HttpClient);
  private readonly appFlowStore = inject(AppFlowStore);
  private readonly router = inject(Router);
  readonly toast = signal<string | null>(null);

  /** Selfie stored by SelfieCapturePage — shown in the preview. */
  readonly selfieUrl = this.appFlowStore.selfieBase64;

  /** Prevents double-tapping the submit button. */
  readonly submitting = this.appFlowStore.submitting;   // signal<boolean>

  submit(): void {
    const registration = this.appFlowStore.registration();
    const selfieBase64 = this.appFlowStore.selfieBase64();

    if (!selfieBase64) {
      console.error('No selfie found in store');
      this.showToast('No selfie found in store.');
      return;
    }

    this.appFlowStore.setSubmitting(true);

    const formData = new FormData();

    // Append registration data
    formData.append('FullName', registration.fullName || '');
    formData.append('Email', registration.email || '');
    formData.append('Nationality', registration.nationality || '');
    formData.append('Language', registration.language || '');
    // formData.append('YearsInDubai', (registration.yearsInDubai ?? 0).toString());

    try {
      // 1. Convert Base64 to a real Binary File
      const imageFile = this.base64ToFile(selfieBase64, 'selfie.jpg');

      // 2. Append the file with the key name expected by the backend
      formData.append('Image', imageFile, 'selfie.jpg');

      this.http.post(`${environment.apiUrl}/api/Users`, formData).subscribe({
        next: (res) => {
          this.appFlowStore.setSubmitting(false);
          this.router.navigate(['/lookup']);
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.appFlowStore.setSubmitting(false);
          // this.router.navigate(['/lookup']);
          this.showToast('Back to complete the form.');
        }
      });
    } catch (error) {
      console.error('Error processing file conversion:', error);
      this.appFlowStore.setSubmitting(false);
    }
  }

  /**
   * Helper function to convert Base64 string to a Binary File object
   */
  private base64ToFile(base64Data: string, filename: string): File {
    const arr = base64Data.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';

    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 2500);
  }
}

