import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppFlowStore } from '../../core/state/app-flow.store';

@Component({
  selector: 'app-selfie-capture-page',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="screen screen--fixed screen--bg-dark capture-screen">

    <header class="topbar topbar--back-only">
      <a routerLink="/welcome" class="back-link" aria-label="go back" (click)="stopCamera()">
        <!-- back arrow SVG -->
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
      </a>
    </header>

    <!-- Middle zone: grows to fill available height -->
    <div class="content-body">
      <p class="t-step">STEP 2 OF 3</p>
      <h1 class="t-h1">Capture<br />your selfie</h1>

      <!-- Camera / photo frame -->
      <div class="frame frame--oval">
        @if (!cameraError()) {
          <video #videoEl
            class="frame__media frame__media--mirror"
            [class.frame__media--hidden]="capturedImage()"
            autoplay playsinline muted>
          </video>
        }
        @if (capturedImage()) {
          <img [src]="capturedImage()!" class="frame__media" alt="Captured selfie" />
        }
        <!-- @if (cameraError()) {
          <div class="frame__error">
            <p>{{ cameraError() }}</p>
            <button class="action-btn" (click)="startCamera()">Try Again</button>
          </div>
        } -->
           @if (cameraError()) {
            <div class="camera-error">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="#FF5357" stroke-width="1.5" stroke-linecap="round">
                <path d="M23 7l-7 5 7 5V7z"></path>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                <line x1="1" y1="1" x2="23" y2="23" stroke="#FF5357" stroke-width="2"></line>
              </svg>
             <p>{{ cameraError() }}</p>
          </div>
          }
        <canvas #canvasEl class="hidden-canvas"></canvas>
      </div>

      <!-- Instruction text -->
      <div class="text-group">
        <h2 class="t-h2">
          @if (capturedImage()) { Looking good! }
          @else { Center your face and smile. }
        </h2>
        <p class="t-hint">Your portrait will be added to the collective heart of the city.</p>
      </div>

    <!-- Bottom actions — always visible, never scrolled away -->
    <div class="capture-actions">
      <div class="icon-btn-wrap">
        @if(capturedImage()){
        <button
          type="button"
          class="icon-btn icon-btn--dark"
          [class.icon-btn--disabled]="!capturedImage()"
          aria-label="retake"
          (click)="retake()"
        >
          <img src="/assets/retake.svg" alt="retake">
        </button>
        <span class="icon-btn-label icon-btn-label--muted">RETAKE</span>
        }
      </div>

      <button
        type="button"
        class="capture-btn"
        [class.icon-btn--disabled]="!!capturedImage() || !!cameraError()"
        aria-label="capture selfie"
        (click)="capture()"
      >
        <img src="/assets/camera.svg" alt="camera">
      </button>

      <div class="icon-btn-wrap">
        @if(capturedImage()){
        <button
          type="button"
          class="icon-btn icon-btn--success"
          [class.icon-btn--disabled]="!capturedImage()"
          aria-label="confirm"
          (click)="confirm()"
        >
          <img src="/assets/confirm.svg" alt="confirm">
        </button>
        <span class="icon-btn-label icon-btn-label--success">CONFIRM</span>
        }
      </div>
    </div>

  </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelfieCapturePage implements OnInit, OnDestroy {

  // ── Template refs ──────────────────────────────────────────────────────────
  @ViewChild('videoEl') videoElRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasElRef!: ElementRef<HTMLCanvasElement>;

  // ── Signals ────────────────────────────────────────────────────────────────
  readonly capturedImage = signal<string | null>(null);
  readonly cameraError = signal<string | null>(null);

  // ── Private ────────────────────────────────────────────────────────────────
  private stream: MediaStream | null = null;

  private readonly appFlowStore = inject(AppFlowStore);
  private readonly router = inject(Router);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  // ── Camera helpers ─────────────────────────────────────────────────────────

  async startCamera(): Promise<void> {
    this.cameraError.set(null);
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',        // front camera on phones
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      // Wait one tick so Angular renders the <video> element
      setTimeout(() => {
        if (this.videoElRef?.nativeElement) {
          this.videoElRef.nativeElement.srcObject = this.stream;
        }
      }, 0);

    } catch (err: unknown) {
      const name = (err as DOMException)?.name ?? '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        this.cameraError.set('Camera permission denied.\nPlease allow camera access and try again.');
      } else if (name === 'NotFoundError') {
        this.cameraError.set('No camera found on this device.');
      } else {
        this.cameraError.set('Could not start camera.\nPlease try again.');
      }
    }
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
  }

  // ── User actions ───────────────────────────────────────────────────────────

  /**
   * Freeze the current video frame onto an off-screen canvas and store
   * it as a base-64 JPEG.  The canvas context is mirrored so the final
   * image looks natural (not reversed) when saved / shared.
   */
  capture(): void {
    const video = this.videoElRef?.nativeElement;
    const canvas = this.canvasElRef?.nativeElement;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Mirror the captured frame (matches the mirrored CSS on <video>)
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    this.capturedImage.set(dataUrl);

    // Stop the stream — we no longer need the camera
    this.stopCamera();
  }

  /** Discard the captured photo and restart the live preview. */
  retake(): void {
    this.capturedImage.set(null);
    this.startCamera();
  }

  /** Persist the photo in the global store and advance to Confirmation. */
  confirm(): void {
    const image = this.capturedImage();
    if (!image) return;
    this.appFlowStore.setSelfieBase64(image);
    this.router.navigateByUrl('/confirmation');
  }
}
