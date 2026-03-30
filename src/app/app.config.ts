import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { mockBackendInterceptor } from './core/interceptors/mock-backend.interceptor';
import { corsProxyInterceptor } from './core/interceptors/cors-proxy.interceptor';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { environment } from '../environments/environment';

const interceptors: HttpInterceptorFn[] = [];

if (!environment.production) {
  interceptors.push(corsProxyInterceptor, mockBackendInterceptor);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors(interceptors)),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
  ]
};
