import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  computed
} from '@angular/core';
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
      <!-- Custom Dropdown -->
      <div class="custom-select-wrapper">
        <button
          type="button"
          class="ui-input ui-select-trigger"
          [class.open]="isOpen()"
          [class.has-value]="!!value()"
          (click)="toggleDropdown()"
        >
          <span class="select-value">
            {{ value() || placeholder() }}
          </span>
          <span class="select-arrow" [class.rotated]="isOpen()">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
              <path d="M1 1L6 6L11 1" stroke="#7a7a7a" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </span>
        </button>

        @if (isOpen()) {
          <div class="dropdown-list">
            <div class="dropdown-search-wrapper" (click)="$event.stopPropagation()">
              <input 
                type="text" 
                class="dropdown-search-input" 
                placeholder="Search..." 
                [ngModel]="searchQuery()" 
                (ngModelChange)="searchQuery.set($event)"
              />
            </div>
            @for (option of filteredOptions(); track option) {
              <div
                class="dropdown-item"
                [class.selected]="option === value()"
                (click)="selectOption(option)"
              >
                {{ option }}
              </div>
            }
            @if (filteredOptions().length === 0) {
              <div class="dropdown-no-results">No results found</div>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: block;
      position: relative;
    }

    .ui-input-label {
      display: block;
      margin-bottom: 0.45rem;
      color: #a3a3a3;
      font-family: var(--font-body);
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
    }

    .ui-input {
      width: 100%;
      height: 64px;
      border-radius: 12px;
      border: 0 solid rgba(255, 255, 255, 0.12);
      background: #353534;
      color: #E5E2E1;
      padding: 20px 24px;
      font-family: var(--font-body);
      font-weight: 500;
      font-size: 16px;
      line-height: 24px;
      box-sizing: border-box;
    }

    .ui-input::placeholder {
      color: #525252;
    }

    /* ── Custom Select ── */
    .custom-select-wrapper {
      position: relative;
      width: 100%;
    }

    .ui-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      text-align: left;
      outline: none;
      border: 1px solid transparent;
      transition: border-color 0.2s;
    }

    .ui-select-trigger.open {
      border-color: rgba(255, 255, 255, 0.2);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .select-value {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #525252; /* placeholder color */
    }

    .ui-select-trigger.has-value .select-value {
      color: #E5E2E1; /* selected value color */
    }

    .select-arrow {
      flex-shrink: 0;
      margin-left: 12px;
      display: flex;
      align-items: center;
      transition: transform 0.2s ease;
    }

    .select-arrow.rotated {
      transform: rotate(180deg);
    }

    /* ── Dropdown List ── */
    .dropdown-list {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;           /* ← هنا السر: بيلتزم بعرض الـ trigger بالظبط */
      width: 100%;
      max-height: 240px;
      overflow-y: auto;
      background: #353534;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-top: none;
      border-bottom-left-radius: 12px;
      border-bottom-right-radius: 12px;
      z-index: 1000;
      box-sizing: border-box;

      /* Custom scrollbar */
      scrollbar-width: thin;
      scrollbar-color: #525252 transparent;
    }

    .dropdown-search-wrapper {
      padding: 12px;
      position: sticky;
      top: 0;
      background: #353534;
      z-index: 2;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .dropdown-search-input {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: #2a2a29;
      color: #E5E2E1;
      padding: 8px 16px;
      font-family: var(--font-body);
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s;
    }

    .dropdown-search-input:focus {
      border-color: rgba(255, 255, 255, 0.4);
    }

    .dropdown-search-input::placeholder {
      color: #7a7a7a;
    }

    .dropdown-no-results {
      padding: 14px 24px;
      color: #7a7a7a;
      font-family: var(--font-body);
      font-size: 14px;
      text-align: center;
    }

    .dropdown-list::-webkit-scrollbar {
      width: 4px;
    }
    .dropdown-list::-webkit-scrollbar-thumb {
      background: #525252;
      border-radius: 4px;
    }

    .dropdown-item {
      padding: 14px 24px;
      color: #E5E2E1;
      font-family: var(--font-body);
      font-size: 16px;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .dropdown-item:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .dropdown-item.selected {
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
    }
  `],
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

  isOpen = signal(false);
  searchQuery = signal('');

  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.options();
    }
    return this.options().filter(option => option.toLowerCase().includes(query));
  });

  private elRef = inject(ElementRef);

  // ← إغلاق الـ dropdown لو click برره
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchQuery.set('');
    }
  }

  toggleDropdown(): void {
    this.isOpen.update((v: boolean) => {
      const next = !v;
      if (!next) {
        this.searchQuery.set('');
      }
      return next;
    });
  }

  selectOption(option: string): void {
    this.valueChange.emit(option);
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onValueChange(nextValue: string): void {
    this.valueChange.emit(nextValue);
  }
}