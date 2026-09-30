/* ==========================================================================
   Raigon Arts Management System - Vuexy Custom Select2 Component (Angular TS)
   Replaces native browser <select> elements with authentic Vuexy Floating UI
   Uses Body Portal positioning to prevent modal clipping or overflow issues
   Tracks screen motion (scroll & resize) in real-time
   ========================================================================== */

import {
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Injectable,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface Select2Option {
  label: string;
  value: any;
  disabled?: boolean;
}

@Component({
  selector: 'app-select2',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select2.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select2Component),
      multi: true
    }
  ]
})
export class Select2Component implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() options: (Select2Option | string)[] = [];
  @Input() placeholder = 'Select option';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() isStatusBadge = false;
  @Input() disabled = false;
  @Input() openAbove = false;
  @Input() id = '';
  @Input() name = '';

  @Output() change = new EventEmitter<any>();

  @ViewChild('triggerRef') triggerRef!: ElementRef<HTMLDivElement>;

  isOpen = false;
  value: any = '';

  top = 0;
  left = 0;
  width = 0;
  isAbove = false;

  private onChange = (_: any) => { };
  private onTouched = () => { };

  private onScreenMotion = () => {
    if (this.isOpen) {
      this.updatePosition();
    }
  };

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', this.onScreenMotion, true);
      window.addEventListener('resize', this.onScreenMotion);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.onScreenMotion, true);
      window.removeEventListener('resize', this.onScreenMotion);
    }
  }

  get normalizedOptions(): Select2Option[] {
    if (!this.options) return [];
    return this.options.map(opt => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }

  get selectedLabel(): string {
    const found = this.normalizedOptions.find(o => o.value === this.value);
    return found ? found.label : (this.value ? String(this.value) : '');
  }

  get statusBadgeClass(): string {
    if (!this.isStatusBadge || !this.value) return '';
    const val = String(this.value).toLowerCase().replace(/\s+/g, '-');
    return `status-badge-${val}`;
  }

  getOptionClass(opt: Select2Option): string {
    if (!this.isStatusBadge) return '';
    const val = String(opt.value).toLowerCase().replace(/\s+/g, '-');
    return `status-option-${val}`;
  }

  toggle(e: Event): void {
    if (this.disabled) return;
    e.stopPropagation();
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.updatePosition();
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
  }

  select(opt: Select2Option, e: Event): void {
    if (opt.disabled) return;
    e.stopPropagation();
    this.value = opt.value;
    this.onChange(this.value);
    this.onTouched();
    this.change.emit(this.value);
    this.close();
  }

  updatePosition(): void {
    if (!this.triggerRef?.nativeElement) return;
    const rect = this.triggerRef.nativeElement.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    this.width = rect.width;
    this.left = rect.left;

    const dropdownHeight = 180;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (this.openAbove || (spaceBelow < dropdownHeight + 10 && rect.top > dropdownHeight + 10)) {
      this.isAbove = true;
      this.top = rect.top - dropdownHeight - 4;
    } else {
      this.isAbove = false;
      this.top = rect.bottom + 4;
    }
  }

  // ControlValueAccessor
  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}

// ==========================================================================
// VUEXY SELECT2 GLOBAL SERVICE & DIRECT-ENHANCEMENT SYSTEM
// ==========================================================================

export class VuexySelect2 {
  private instances = new Map<HTMLSelectElement, { container: HTMLElement; dropdown: HTMLElement; renderOptions: () => void }>();
  private activeDropdownInfo: { container: HTMLElement; trigger: HTMLElement; dropdown: HTMLElement } | null = null;
  private observer: MutationObserver | null = null;

  constructor() {
    if (typeof document !== 'undefined') {
      this.init();
    }
  }

  init(): void {
    if (typeof document === 'undefined') return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.enhanceAll());
    } else {
      this.enhanceAll();
    }

    if (typeof MutationObserver !== 'undefined') {
      this.observer = new MutationObserver((mutations) => {
        let hasUnenhanced = false;
        for (const mutation of mutations) {
          for (let i = 0; i < mutation.addedNodes.length; i++) {
            const node = mutation.addedNodes[i];
            if (node.nodeType === 1) {
              const el = node as HTMLElement;
              if (el.matches && el.matches('select.form-select, select.form-select-sm, select.form-select-lg, select.status-select-badge, select[data-select2]')) {
                if (el.dataset['vuexySelect2Init'] !== 'true') {
                  hasUnenhanced = true;
                  break;
                }
              }
              if (el.querySelector && el.querySelector('select.form-select:not([data-vuexy-select2-init="true"]), select.form-select-sm:not([data-vuexy-select2-init="true"]), select.form-select-lg:not([data-vuexy-select2-init="true"]), select.status-select-badge:not([data-vuexy-select2-init="true"]), select[data-select2]:not([data-vuexy-select2-init="true"])')) {
                hasUnenhanced = true;
                break;
              }
            }
          }
          if (hasUnenhanced) break;
        }

        if (hasUnenhanced) {
          this.enhanceAll();
        }
      });

      this.observer.observe(document.body, { childList: true, subtree: true });
    }

    document.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.vuexy-select2-container') && !target.closest('.vuexy-select2-dropdown')) {
        this.closeAll();
      }
    });

    const updateActivePos = () => {
      if (this.activeDropdownInfo) {
        this.positionDropdown(
          this.activeDropdownInfo.trigger,
          this.activeDropdownInfo.dropdown,
          this.activeDropdownInfo.container
        );
      }
    };

    window.addEventListener('scroll', updateActivePos, true);
    window.addEventListener('resize', updateActivePos);

    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeAll();
      }
    });

    setTimeout(() => this.enhanceAll(), 100);
  }

  enhanceAll(root: ParentNode = document): void {
    if (typeof document === 'undefined') return;
    const target = root || document;
    const selector = 'select.form-select, select.form-select-sm, select.form-select-lg, select.status-select-badge, select[data-select2]';
    const selects = target.querySelectorAll<HTMLSelectElement>(selector);
    selects.forEach(select => this.enhance(select));
  }

  enhance(select: HTMLSelectElement): void {
    if (!select) return;

    const existingContainer = select.nextElementSibling;
    if (existingContainer && existingContainer.classList.contains('vuexy-select2-container')) {
      this.refresh(select);
      return;
    }

    if (select.dataset['vuexySelect2Init'] === 'true') {
      this.refresh(select);
      return;
    }

    select.dataset['vuexySelect2Init'] = 'true';
    select.style.display = 'none';

    let sizeClass = 'md';
    if (select.classList.contains('form-select-sm') || select.classList.contains('sm')) sizeClass = 'sm';
    if (select.classList.contains('form-select-lg') || select.classList.contains('lg')) sizeClass = 'lg';

    const isStatusBadge = select.classList.contains('status-select-badge');

    const container = document.createElement('div');
    container.className = `vuexy-select2-container size-${sizeClass}`;
    if (isStatusBadge) container.classList.add('status-select-badge-wrap');
    if (select.style.width) container.style.width = select.style.width;

    const trigger = document.createElement('div');
    trigger.className = 'vuexy-select2-trigger';
    if (isStatusBadge) {
      const valLower = (select.value || '').toLowerCase().replace(/\s+/g, '-');
      trigger.className = `vuexy-select2-trigger status-select-badge${valLower ? ' status-badge-' + valLower : ''}`;
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'vuexy-select2-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'vuexy-select2-arrow';
    arrowSpan.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrowSpan);

    const dropdown = document.createElement('div');
    dropdown.className = 'vuexy-select2-dropdown vuexy-portal-dropdown';

    const optionsList = document.createElement('div');
    optionsList.className = 'vuexy-select2-options';

    dropdown.appendChild(optionsList);
    container.appendChild(trigger);

    if (select.parentNode) {
      select.parentNode.insertBefore(container, select.nextSibling);
    }

    const renderOptions = () => {
      optionsList.innerHTML = '';
      const options = Array.from(select.options);

      const selectedOpt = select.selectedIndex >= 0 ? select.options[select.selectedIndex] : options[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.text : (options[0]?.text || 'Select option');

      if (isStatusBadge) {
        const valLower = (select.value || selectedOpt?.value || '').toLowerCase().replace(/\s+/g, '-');
        trigger.className = `vuexy-select2-trigger status-select-badge${valLower ? ' status-badge-' + valLower : ''}`;
      }

      options.forEach(opt => {
        const item = document.createElement('div');
        item.className = 'vuexy-select2-option';
        if (isStatusBadge && opt.value) {
          item.classList.add(`status-option-${opt.value.toLowerCase().replace(/\s+/g, '-')}`);
        }
        if (opt.selected || (select.value !== undefined && select.value !== '' && opt.value === select.value)) {
          item.classList.add('selected');
        }
        if (opt.disabled) {
          item.classList.add('disabled');
        }

        item.textContent = opt.text;

        item.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation();
          if (opt.disabled) return;

          select.value = opt.value;

          select.dispatchEvent(new Event('change', { bubbles: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));

          renderOptions();
          this.closeAll();
        });

        optionsList.appendChild(item);
      });
    };

    trigger.addEventListener('click', (e: MouseEvent) => {
      e.stopPropagation();
      const isOpen = container.classList.contains('open');
      this.closeAll();
      if (!isOpen) {
        renderOptions();
        this.openDropdown(container, trigger, dropdown);
      }
    });

    renderOptions();

    select.addEventListener('change', () => {
      const selectedOpt = select.options[select.selectedIndex];
      if (selectedOpt) labelSpan.textContent = selectedOpt.text;
      renderOptions();
    });

    select.addEventListener('input', () => {
      const selectedOpt = select.options[select.selectedIndex];
      if (selectedOpt) labelSpan.textContent = selectedOpt.text;
      renderOptions();
    });

    this.instances.set(select, { container, dropdown, renderOptions });
  }

  openDropdown(container: HTMLElement, trigger: HTMLElement, dropdown: HTMLElement): void {
    if (typeof document === 'undefined') return;

    if (dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }

    container.classList.add('open');
    dropdown.style.display = 'block';
    dropdown.style.visibility = 'hidden';
    dropdown.style.opacity = '0';

    this.activeDropdownInfo = { container, trigger, dropdown };
    this.positionDropdown(trigger, dropdown, container);

    dropdown.style.visibility = 'visible';
    dropdown.style.opacity = '1';
    dropdown.classList.add('open');
  }

  positionDropdown(trigger: HTMLElement, dropdown: HTMLElement, container: HTMLElement): void {
    if (!trigger || !dropdown) return;
    const rect = trigger.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    dropdown.style.position = 'fixed';
    dropdown.style.width = `${rect.width}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.zIndex = '99999999';

    const dropdownHeight = dropdown.offsetHeight || 180;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < dropdownHeight + 10 && rect.top > dropdownHeight + 10) {
      dropdown.style.top = `${rect.top - dropdownHeight - 4}px`;
      dropdown.classList.add('open-above');
      if (container) container.classList.add('open-above');
    } else {
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.classList.remove('open-above');
      if (container) container.classList.remove('open-above');
    }
  }

  closeAll(): void {
    if (typeof document === 'undefined') return;
    this.activeDropdownInfo = null;

    document.querySelectorAll('.vuexy-select2-container.open').forEach(c => {
      c.classList.remove('open');
      c.classList.remove('open-above');
    });

    document.querySelectorAll<HTMLElement>('.vuexy-select2-dropdown.open, .vuexy-portal-dropdown').forEach(d => {
      d.classList.remove('open');
      d.classList.remove('open-above');
      d.style.display = 'none';
      d.style.opacity = '0';
      d.style.visibility = 'hidden';
    });
  }

  refresh(select: HTMLSelectElement): void {
    if (this.instances.has(select)) {
      this.instances.get(select)!.renderOptions();
    }
  }
}

declare global {
  interface Window {
    RaigonSelect2?: VuexySelect2;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Select2Service {
  private select2Instance: VuexySelect2;

  constructor() {
    this.select2Instance = (typeof window !== 'undefined' && window.RaigonSelect2)
      ? window.RaigonSelect2
      : new VuexySelect2();

    if (typeof window !== 'undefined') {
      window.RaigonSelect2 = this.select2Instance;
    }
  }

  getInstance(): VuexySelect2 {
    return this.select2Instance;
  }

  enhanceAll(root?: ParentNode): void {
    this.select2Instance.enhanceAll(root);
  }

  closeAll(): void {
    this.select2Instance.closeAll();
  }
}

if (typeof window !== 'undefined' && !window.RaigonSelect2) {
  window.RaigonSelect2 = new VuexySelect2();
}
