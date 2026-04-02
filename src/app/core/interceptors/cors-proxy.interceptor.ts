import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * During development, maps absolute API calls to testapi.shipsync.it.com
 * to local relative paths to avoid CORS issues via the dev-server proxy.
 * In production, it does nothing and lets the real URL through.
 */
export const corsProxyInterceptor: HttpInterceptorFn = (req, next) => {
  const targetBase = 'https://testapi.shipsync.it.com';

  // Skip proxy rewriting in production or if URL doesn't match
  if (environment.apiUrl || !req.url.startsWith(targetBase)) {
    return next(req);
  }

  // Rewrite absolute URL to relative to trigger dev-server proxy
  const proxiedUrl = req.url.replace(targetBase, '');
  const clonedReq = req.clone({ url: proxiedUrl });
  return next(clonedReq);
};
