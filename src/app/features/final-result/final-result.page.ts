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
      <img src="/assets/topbar-logo.svg" alt="We Love You" class="topbar-logo" />
      <button type="button" class="close-btn" routerLink="/welcome" aria-label="close">&times;</button>
    </header>

    <!-- Photo card -->
    <div class="photo-card">
      <div class="photo-card__frame">
        @if (selfieUrl()) {
          <img [src]="selfieUrl()!" class="frame__media" alt="Your Dubai portrait" />
        }
        <div class="frame__badge">
          <span class="frame__badge-dot"></span>
          LIVE FROM DUBAI
        </div>
      </div>
      <div class="photo-card__footer">
        <div class="photo-card__text">
          <div class="photo-card__title">
            I <span class="photo-card__title-accent">LOVE</span>
          </div>
          <div class="photo-card__title">DUBAI</div>
          <div class="photo-card__subtext">AUTHENTIC MOMENT &bull; 2026</div>
        </div>
        <div class="photo-card__heart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>
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
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinalResultPage {

  private readonly appFlowStore = inject(AppFlowStore);

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

    const selfieImg = await this.loadImage(selfieDataUrl);

    // Frame aspect ratio (width / height)
    const frameAspect = 1.05;
    const imgAspect = selfieImg.width / selfieImg.height;

    // Size the frame to fit the selfie's cropped area — zero upscaling
    let frameW: number, frameH: number;
    if (imgAspect > frameAspect) {
      frameH = selfieImg.height;
      frameW = Math.round(frameH * frameAspect);
    } else {
      frameW = selfieImg.width;
      frameH = Math.round(frameW / frameAspect);
    }

    // Scale factor: UI designed at 768px frame width
    const s = frameW / 768;
    const pad = Math.round(16 * s);
    const W = frameW + pad * 2;
    const cardR = Math.round(48 * s);
    const frameR = Math.round(36 * s);
    const footerH = Math.round(150 * s);
    const H = pad * 2 + frameH + footerH;

    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // 1. Card background
    ctx.fillStyle = '#25282e';
    this.drawRoundRect(ctx, 0, 0, W, H, cardR);
    ctx.fill();

    // 2. Selfie — cover-fit with rounded corners
    ctx.save();
    this.drawRoundRect(ctx, pad, pad, frameW, frameH, frameR);
    ctx.clip();
    ctx.fillStyle = '#171b22';
    ctx.fillRect(pad, pad, frameW, frameH);

    let sx = 0, sy = 0, sw = selfieImg.width, sh = selfieImg.height;
    if (imgAspect > frameAspect) {
      sw = selfieImg.height * frameAspect;
      sx = (selfieImg.width - sw) / 2;
    } else {
      sh = selfieImg.width / frameAspect;
      sy = (selfieImg.height - sh) / 2;
    }
    ctx.drawImage(selfieImg, sx, sy, sw, sh, pad, pad, frameW, frameH);
    ctx.restore();

    // 3. "LIVE FROM DUBAI" badge
    const badgeFontSize = Math.round(18 * s);
    const badgeX = pad + Math.round(24 * s);
    const badgeY = pad + Math.round(24 * s);
    const badgeText = 'LIVE FROM DUBAI';
    ctx.font = `bold ${badgeFontSize}px Epilogue, sans-serif`;
    ctx.textBaseline = 'middle';
    const btw = ctx.measureText(badgeText).width;
    const dotSize = Math.round(10 * s);
    const badgePadX = Math.round(24 * s);
    const badgePadY = Math.round(12 * s);
    const bGap = Math.round(12 * s);
    const badgeW = badgePadX + dotSize + bGap + btw + badgePadX;
    const badgeH = badgePadY * 2 + badgeFontSize;

    ctx.fillStyle = 'rgba(57, 57, 57, 0.75)';
    this.drawRoundRect(ctx, badgeX, badgeY, badgeW, badgeH, badgeH / 2);
    ctx.fill();

    ctx.fillStyle = '#FFB3B0';
    ctx.beginPath();
    ctx.arc(badgeX + badgePadX + dotSize / 2, badgeY + badgeH / 2, dotSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(badgeText, badgeX + badgePadX + dotSize + bGap, badgeY + badgeH / 2 + 1);

    // 4. Footer — "I LOVE DUBAI"
    const textX = pad + Math.round(20 * s);
    const footerTop = pad + frameH + Math.round(24 * s);
    const titleFontSize = Math.round(52 * s);
    const subtextFontSize = Math.round(17 * s);

    ctx.font = `900 ${titleFontSize}px Epilogue, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFFFFF';
    const iW = ctx.measureText('I ').width;
    ctx.fillText('I ', textX, footerTop);

    ctx.fillStyle = '#ff4f5f';
    ctx.fillText('LOVE', textX + iW, footerTop);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('DUBAI', textX, footerTop + Math.round(54 * s));

    ctx.font = `600 ${subtextFontSize}px Manrope, sans-serif`;
    ctx.fillStyle = '#AC8886';
    ctx.fillText('AUTHENTIC MOMENT \u2022 2026', textX, footerTop + Math.round(116 * s));

    // 5. Heart icon (right side)
    ctx.save();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(255,255,255,0.8)';
    ctx.shadowBlur = Math.round(12 * s);
    const heartScale = 2.2 * s;
    const heartX = W - pad - Math.round(70 * s);
    const heartY = footerTop + Math.round(28 * s);
    ctx.translate(heartX, heartY);
    ctx.scale(heartScale, heartScale);
    const heartPath = new Path2D(
      'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 ' +
      '2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09' +
      'C13.09 3.81 14.76 3 16.5 3 ' +
      '19.58 3 22 5.42 22 8.5' +
      'c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
    );
    ctx.fill(heartPath);
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
