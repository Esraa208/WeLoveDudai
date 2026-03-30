import { computed, Injectable, signal } from '@angular/core';
import { EMPTY } from 'rxjs';

export interface RegistrationData {
  fullName: string;
  nationality: string;
  email: string;
  // yearsInDubai: number | null;
}

@Injectable({ providedIn: 'root' })
export class AppFlowStore {

  // ── Registration ──────────────────────────────────────────────────────────
  private readonly _registration = signal<RegistrationData>({
    fullName: '',
    nationality: '',
    email: '',
    // yearsInDubai: null
  });
  readonly registration = this._registration.asReadonly();
  setRegistration(data: RegistrationData): void { this._registration.set(data); }

  // ── Selfie base-64 data-URL ───────────────────────────────────────────────
  private readonly _selfieBase64 = signal<string | null>(null);
  readonly selfieBase64 = this._selfieBase64.asReadonly();
  setSelfieBase64(dataUrl: string): void { this._selfieBase64.set(dataUrl); }

  // ── Submission in-flight flag ─────────────────────────────────────────────
  private readonly _submitting = signal(false);
  readonly submitting = this._submitting.asReadonly();
  setSubmitting(value: boolean): void { this._submitting.set(value); }

  // ── Full reset ────────────────────────────────────────────────────────────
  reset(): void {
    this._registration.set({
      fullName: '',
      nationality: '',
      email: '',
      // yearsInDubai: null
    });
    this._selfieBase64.set(null);
    this._submitting.set(false);
  }
}
