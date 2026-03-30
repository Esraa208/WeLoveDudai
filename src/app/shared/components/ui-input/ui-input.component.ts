import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label class="ui-input-label">{{ label() }}</label>
    @if (!isSelect()) {
      <input
        class="ui-input"
        [type]="type()"
        [placeholder]="placeholder()"
        [ngModel]="value()"
        (ngModelChange)="onValueChange($event)"
      />
    } @else {
      <select class="ui-input ui-select" [ngModel]="value()" (ngModelChange)="onValueChange($event)">
        <option value="" disabled>{{ placeholder() }}</option>
        @for (option of options(); track option) {
          <option [value]="option">{{ option }}</option>
        }
      </select>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .ui-input-label {
        display: block;
        margin-bottom: 0.45rem;
        color: #a3a3a3;
        font-family: var(--font-body);
        font-weight: 600;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0;
        vertical-align: middle;
      }

      .ui-input {
        width: 100%;
        height: 64px;
        border-radius: 12px;
        border: 0 solid rgba(255, 255, 255, 0.12);
        background: #353534;
        color: #E5E2E1;
        opacity: 1;
        padding: 20px 24px;
        font-family: var(--font-body);
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        letter-spacing: 0;
      }
      .ui-input::placeholder {
        color: #525252;
      }
      .ui-select {
        appearance: none;
        background-image:
          linear-gradient(45deg, transparent 50%, #7a7a7a 50%),
          linear-gradient(135deg, #7a7a7a 50%, transparent 50%);
        background-position:
          calc(100% - 20px) 30px,
          calc(100% - 14px) 30px;
        background-size: 6px 6px, 6px 6px;
        background-repeat: no-repeat;
        padding-right: 46px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiInputComponent {
  readonly label = input<string>('Label');
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'number'>('text');
  readonly value = input<string>('');
  readonly isSelect = input<boolean>(false);
  readonly options = input<string[]>([]);
  readonly valueChange = output<string>();

  onValueChange(nextValue: string): void {
    this.valueChange.emit(nextValue);
  }
}
