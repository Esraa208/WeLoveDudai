import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  template: `
    <button class="ui-button" [disabled]="disabled()">{{ label() }}</button>
  `,
  styles: [
    `
      .ui-button {
        width: 100%;
        border: 0;
        border-radius: 14px;
        padding: 1rem 1rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        font-size: 1.02rem;
        color: #fff;
        background: linear-gradient(180deg, #ff6573, #ff4f5f);
        box-shadow: 0 0 18px rgba(255, 79, 95, 0.45);
      }

      .ui-button:disabled {
        opacity: 0.45;
        box-shadow: none;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiButtonComponent {
  readonly label = input<string>('Continue');
  readonly disabled = input<boolean>(false);
}
