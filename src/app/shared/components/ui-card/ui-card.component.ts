import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  template: `
    <section class="ui-card">
      <ng-content />
    </section>
  `,
  styles: [
    `
      .ui-card {
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        padding: 1rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UiCardComponent {}
