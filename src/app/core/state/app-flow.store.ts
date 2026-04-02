import { Injectable, signal } from '@angular/core';

export interface RegistrationData {
  fullName: string;
  nationality: string;
  email: string;
  // yearsInDubai: number | null;
  frameFileName?: string;
  language: string;
}

export interface CountryData {
  country: string;
  fileName: string;
  language: string;
}

@Injectable({ providedIn: 'root' })
export class AppFlowStore {

  // ── Registration ──────────────────────────────────────────────────────────
  private readonly _registration = signal<RegistrationData>({
    fullName: '',
    nationality: '',
    email: '',
    language: '',
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

  // ── Successful submission flag ────────────────────────────────────────────
  private readonly _isSubmitted = signal(false);
  readonly isSubmitted = this._isSubmitted.asReadonly();
  setIsSubmitted(value: boolean): void { this._isSubmitted.set(value); }

  // ── Full reset ────────────────────────────────────────────────────────────
  reset(): void {
    this._registration.set({
      fullName: '',
      nationality: '',
      email: '',
      language: '',
      // yearsInDubai: null
    });
    this._selfieBase64.set(null);
    this._submitting.set(false);
    this._isSubmitted.set(false);
  }

  validateRegistration(): boolean {
    const registration = this._registration();
    return (
      registration.fullName.trim().length > 0 &&
      registration.email.trim().length > 0 &&
      registration.nationality.trim().length > 0 &&
      registration.language.trim().length > 0
    );
  }
}
