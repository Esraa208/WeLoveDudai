import { HttpEvent, HttpHandlerFn, HttpHeaders, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, delay, of, switchMap } from 'rxjs';

interface UploadSelfieRequest {
  fullName: string;
  email: string;
  nationality: string;
  language?: string;
  yearsInDubai: number;
  selfieBase64: string;
}

interface UploadSelfieResponse {
  submissionId: string;
  message: string;
  uploadedAt: string;
}

interface LiveCounterResponse {
  count: number;
  updatedAt: string;
}

interface StoredRegistrationRecord {
  submissionId: string;
  fullName: string;
  email: string;
  nationality: string;
  language: string;
  yearsInDubai: number;
  rawSelfieBase64: string;
  uploadedAt: string;
}

interface CountryCount {
  country: string;
  count: number;
}

interface LanguageCount {
  language: string;
  count: number;
}

interface RegisteredCountriesResponse {
  countries: CountryCount[];
}

interface RegisteredLanguagesResponse {
  country: string;
  languages: LanguageCount[];
}

interface TotalRegisteredUsersResponse {
  totalUsers: number;
}

let liveHeartCounter = 1242;
const registrationsDb: StoredRegistrationRecord[] = [];
const pendingImageSubmissionIds: string[] = [];

const NETWORK_DELAY_MS = 800;
const LIVE_COUNTER_DELAY_MS = 350;

export const mockBackendInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const { method, url } = req;

  if (method === 'POST' && url.endsWith('/upload-selfie')) {
    return handleUploadSelfie(req);
  }

  if (method === 'GET' && url.endsWith('/live-counter')) {
    return handleLiveCounter();
  }

  if (method === 'GET' && url.endsWith('/registered-countries')) {
    return handleRegisteredCountries();
  }

  if (method === 'GET' && url.endsWith('/registered-languages')) {
    return handleRegisteredLanguages(req);
  }

  if (method === 'GET' && url.endsWith('/registered-users/total')) {
    return handleTotalRegisteredUsers();
  }

  if (method === 'GET' && url.endsWith('/uploaded-images/next')) {
    return handleNextUploadedImage();
  }

  return next(req);
};

function handleUploadSelfie(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  return of(null).pipe(
    switchMap(() => {
      const body = req.body as UploadSelfieRequest | null;

      if (!body?.selfieBase64 || !body?.fullName || !body?.email) {
        return of(
          new HttpResponse({
            status: 400,
            body: {
              message: 'Invalid payload. fullName, email and selfieBase64 are required.'
            }
          })
        );
      }

      const submissionId = crypto.randomUUID();
      const uploadedAt = new Date().toISOString();
      const record: StoredRegistrationRecord = {
        submissionId,
        fullName: body.fullName,
        email: body.email,
        nationality: body.nationality || 'Unknown',
        language: body.language || 'Unknown',
        yearsInDubai: body.yearsInDubai,
        rawSelfieBase64: body.selfieBase64,
        uploadedAt
      };

      registrationsDb.push(record);
      pendingImageSubmissionIds.push(submissionId);

      const response: UploadSelfieResponse = {
        submissionId,
        message: 'Selfie uploaded successfully.',
        uploadedAt
      };

      return of(new HttpResponse({ status: 200, body: response }));
    }),
    delay(NETWORK_DELAY_MS)
  );
}

function handleLiveCounter(): Observable<HttpEvent<unknown>> {
  const pulseIncrement = Math.floor(Math.random() * 6) + 1;
  liveHeartCounter += pulseIncrement;

  const response: LiveCounterResponse = {
    count: liveHeartCounter,
    updatedAt: new Date().toISOString()
  };

  return of(new HttpResponse({ status: 200, body: response })).pipe(delay(LIVE_COUNTER_DELAY_MS));
}

function handleRegisteredCountries(): Observable<HttpEvent<unknown>> {
  const countryCountMap = new Map<string, number>();

  for (const registration of registrationsDb) {
    const currentCount = countryCountMap.get(registration.nationality) ?? 0;
    countryCountMap.set(registration.nationality, currentCount + 1);
  }

  const countries: CountryCount[] = Array.from(countryCountMap.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));

  const response: RegisteredCountriesResponse = { countries };
  return of(new HttpResponse({ status: 200, body: response })).pipe(delay(NETWORK_DELAY_MS));
}

function handleRegisteredLanguages(req: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
  const requestedCountry = req.params.get('country');

  if (!requestedCountry) {
    return of(
      new HttpResponse({
        status: 400,
        body: { message: 'Missing required query parameter: country' }
      })
    ).pipe(delay(NETWORK_DELAY_MS));
  }

  const languageCountMap = new Map<string, number>();

  for (const registration of registrationsDb) {
    if (registration.nationality !== requestedCountry) {
      continue;
    }

    const currentCount = languageCountMap.get(registration.language) ?? 0;
    languageCountMap.set(registration.language, currentCount + 1);
  }

  const languages: LanguageCount[] = Array.from(languageCountMap.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count || a.language.localeCompare(b.language));

  const response: RegisteredLanguagesResponse = {
    country: requestedCountry,
    languages
  };

  return of(new HttpResponse({ status: 200, body: response })).pipe(delay(NETWORK_DELAY_MS));
}

function handleTotalRegisteredUsers(): Observable<HttpEvent<unknown>> {
  const response: TotalRegisteredUsersResponse = {
    totalUsers: registrationsDb.length
  };

  return of(new HttpResponse({ status: 200, body: response })).pipe(delay(NETWORK_DELAY_MS));
}

function handleNextUploadedImage(): Observable<HttpEvent<unknown>> {
  if (!pendingImageSubmissionIds.length) {
    return of(new HttpResponse({ status: 204 })).pipe(delay(LIVE_COUNTER_DELAY_MS));
  }

  const nextSubmissionId = pendingImageSubmissionIds.shift();
  const registration = registrationsDb.find((entry) => entry.submissionId === nextSubmissionId);

  if (!registration) {
    return of(new HttpResponse({ status: 204 })).pipe(delay(LIVE_COUNTER_DELAY_MS));
  }

  const { mimeType, bytes } = decodeDataUrl(registration.rawSelfieBase64);
  if (!bytes) {
    return of(
      new HttpResponse({
        status: 422,
        body: { message: 'Stored selfie image is not a valid base64 data URL.' }
      })
    ).pipe(delay(NETWORK_DELAY_MS));
  }

  return of(
    new HttpResponse({
      status: 200,
      body: bytes.buffer,
      headers: new HttpHeaders({ 'Content-Type': mimeType })
    })
  ).pipe(delay(LIVE_COUNTER_DELAY_MS));
}

function decodeDataUrl(dataUrl: string): { mimeType: string; bytes: Uint8Array | null } {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return { mimeType: 'application/octet-stream', bytes: null };
  }

  const mimeType = matches[1];
  const base64Payload = matches[2];
  const binary = atob(base64Payload);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return { mimeType, bytes };
}
