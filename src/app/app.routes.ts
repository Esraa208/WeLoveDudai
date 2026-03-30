import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'welcome'
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/welcome-registration/welcome-registration.page').then(
        (m) => m.WelcomeRegistrationPage
      )
  },
  {
    path: 'selfie',
    loadComponent: () =>
      import('./features/selfie-capture/selfie-capture.page').then((m) => m.SelfieCapturePage)
  },
  {
    path: 'confirmation',
    loadComponent: () =>
      import('./features/confirmation/confirmation.page').then((m) => m.ConfirmationPage)
  },
  {
    path: 'lookup',
    loadComponent: () => import('./features/lookup/lookup.page').then((m) => m.LookupPage)
  },
  {
    path: 'result',
    loadComponent: () => import('./features/final-result/final-result.page').then((m) => m.FinalResultPage)
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];
