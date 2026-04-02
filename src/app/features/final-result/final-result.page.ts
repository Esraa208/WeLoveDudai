import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AppFlowStore } from '../../core/state/app-flow.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-final-result-page',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="screen screen--fixed screen--bg-result result-screen">

    <header class="topbar">
      <img src="/assets/logo.png" alt="We Love You" class="topbar-logo" />
      <button type="button" class="close-btn" routerLink="/welcome" aria-label="close">&times;</button>
    </header>

    <!-- Photo card -->
    <div class="photo-card-wrapper">
      @if (selfieUrl()) {
        <img [src]="selfieUrl()!" alt="Your selfie" class="photo-card__selfie" />
      }
      <img [src]="registration().frameFileName" alt="Dubai portrait frame" class="photo-card__frame-img" />
    </div>

    <!-- Title + subtitle -->
   
        <h1>Download your<br><span>Dubai moment.</span></h1>
        <p class="subtitle">Save it. Share it. Spread the love.</p>
   

    <!-- CTA buttons -->
    <div class="action-btns">
      <button class="action-btn action-btn--constrained" [disabled]="saving()" (click)="saveToGallery()">
        @if (saving()) {
          <span class="spinner"></span> Saving…
        } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5"
               stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
               <polyline points="7 10 12 15 17 10"></polyline>
               <line x1="12" y1="15" x2="12" y2="3"></line>
             </svg>
          SAVE TO GALLERY
        }
      </button>

      <button class="action-btn action-btn--dark action-btn--constrained" (click)="share()">
       <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" class="btn-icon">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>  
      SHARE
      </button>
    </div>

    @if (toast()) {
      <div class="toast">{{ toast() }}</div>
    }

  </div>
`,
  styles: [`
    .photo-card-wrapper {
      position: relative;
      width: 100%;
      max-width: 342px;
      aspect-ratio: 342 / 456;
      margin: 0 auto 32px;
      border-radius: 30px;
    }
    .photo-card__frame-img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
      object-fit: contain;
    }
    .photo-card__selfie {
     // position: absolute;
    //  top: 3.73%;
    //  left: 4.97%;
     // width: 90.06%;
    //  height: 75%;
    //  object-fit: cover;
    //  border-radius: 24px;
    //  z-index: 5;
      position: absolute;
      top: 7.3%;
      left: 1%;
      width: 97.6%;
      height: 70.9%;
      object-fit: cover;
      border-radius: 24px;
      z-index: 5;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalResultPage {

  private readonly appFlowStore = inject(AppFlowStore);

  readonly registration = this.appFlowStore.registration;
  readonly selfieUrl = this.appFlowStore.selfieBase64;
  readonly toast = signal<string | null>(null);
  readonly saving = signal(false);
  readonly canShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ────────────────────────────────────────────────────────────────────────
  // Canvas card renderer — adapts to selfie's native resolution
  // ────────────────────────────────────────────────────────────────────────

  private async renderCardToBlob(): Promise<Blob> {
    const selfieDataUrl = this.selfieUrl();
    if (!selfieDataUrl) throw new Error('No selfie available');

    const frameUrl = this.registration().frameFileName;
    if (!frameUrl) throw new Error('No frame available');

    const [selfieImg, frameImg] = await Promise.all([
      this.loadImage(selfieDataUrl),
      this.loadImage(frameUrl)
    ]);

    // Use a high resolution for the output image to ensure crisp quality
    // Based on the 342 / 456 aspect ratio
    const W = 1026;
    const H = 1368;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // 1. Clip the whole wrapper to 30px border radius (scaled to 1026px width)
    const cardR = W * (30 / 342);
    ctx.save();
    this.drawRoundRect(ctx, 0, 0, W, H, cardR);
    ctx.clip();

    // 2. Draw selfie using the exact CSS percentages (left: 1%, top: 7.3%, w: 97.6%, h: 70.9%)
    const selfieX = W * 0.01;
    const selfieY = H * 0.073;
    const selfieW = W * 0.976;
    const selfieH = H * 0.709;
    const selfieR = W * (24 / 342);

    ctx.save();
    this.drawRoundRect(ctx, selfieX, selfieY, selfieW, selfieH, selfieR);
    ctx.clip();

    // object-fit: cover for the selfie
    const imgAspect = selfieImg.width / selfieImg.height;
    const targetAspect = selfieW / selfieH;
    let sx = 0, sy = 0, sw = selfieImg.width, sh = selfieImg.height;
    if (imgAspect > targetAspect) {
      sw = selfieImg.height * targetAspect;
      sx = (selfieImg.width - sw) / 2;
    } else {
      sh = selfieImg.width / targetAspect;
      sy = (selfieImg.height - sh) / 2;
    }
    ctx.drawImage(selfieImg, sx, sy, sw, sh, selfieX, selfieY, selfieW, selfieH);
    ctx.restore();

    // 3. Draw the frame PNG image overlay
    // matching CSS: top: 0, left: 0, width: 100%, height: 100%, object-fit: contain
    const frameImgAspect = frameImg.width / frameImg.height;
    const canvasAspect = W / H;
    let fx = 0, fy = 0, fw = W, fh = H;
    if (frameImgAspect > canvasAspect) {
      fh = W / frameImgAspect;
      fy = (H - fh) / 2;
    } else {
      fw = H * frameImgAspect;
      fx = (W - fw) / 2;
    }
    ctx.drawImage(frameImg, fx, fy, fw, fh);

    ctx.restore();

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
        'image/png', 1.0
      );
    });
  }

  // ────────────────────────────────────────────────────────────────────────
  // Canvas helpers
  // ────────────────────────────────────────────────────────────────────────

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private drawRoundRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number, r: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // ────────────────────────────────────────────────────────────────────────
  // Save to Gallery
  // ────────────────────────────────────────────────────────────────────────
  async saveToGallery(): Promise<void> {
    if (!this.selfieUrl()) {
      this.showToast('No photo to save yet.');
      return;
    }

    this.saving.set(true);
    try {
      const blob = await this.renderCardToBlob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `dubai-love-${Date.now()}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 1000);

      this.showToast('Photo saved! \u2713');
    } catch {
      this.showToast('Could not save photo. Please try again.');
    } finally {
      this.saving.set(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Share
  // ────────────────────────────────────────────────────────────────────────
  async share(): Promise<void> {
    if (!this.selfieUrl()) {
      this.showToast('No photo to share yet.');
      return;
    }

    try {
      const blob = await this.renderCardToBlob();
      const file = new File([blob], 'dubai-love.png', { type: 'image/png' });

      await navigator.share({
        title: 'I \u2764\ufe0f Dubai',
        text: 'I just joined the collective heart of Dubai!',
        files: [file],
      });
    } catch (err: unknown) {
      const name = (err as DOMException)?.name;
      if (name !== 'AbortError') {
        this.showToast('Could not share. Please try saving instead.');
      }
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────────
  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(null), 2500);
  }
}
