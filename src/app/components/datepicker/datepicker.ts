import { Component, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() name = '';
  @Input() placeholder = 'Select date';
  @Input() disabled = false;

  isOpen = false;
  value = '';
  currentDate = new Date();
  selectedDate: Date | null = null;

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  private onChange = (_: any) => { };
  private onTouched = () => { };

  constructor(private el: ElementRef) { }

  get year(): number {
    return this.currentDate.getFullYear();
  }

  get month(): number {
    return this.currentDate.getMonth();
  }

  get daysInMonth(): number[] {
    const count = new Date(this.year, this.month + 1, 0).getDate();
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  get prevDays(): number[] {
    const firstDay = new Date(this.year, this.month, 1).getDay();
    const prevCount = new Date(this.year, this.month, 0).getDate();
    return Array.from({ length: firstDay }, (_, i) => prevCount - firstDay + 1 + i);
  }

  get nextDays(): number[] {
    const total = this.prevDays.length + this.daysInMonth.length;
    const rem = 42 - total;
    const count = rem < 7 ? rem : rem - 7;
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  // Value Accessor
  writeValue(val: string): void {
    if (!val) {
      this.value = '';
      this.selectedDate = null;
      return;
    }
    const parsed = this.parseDate(val);
    if (parsed) {
      this.selectedDate = parsed;
      this.currentDate = new Date(parsed.getFullYear(), parsed.getMonth(), 1);
      this.value = this.formatDateDDMMYYYY(parsed);
    } else {
      this.value = val;
      this.selectedDate = null;
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  // Navigation
  prevMonth(e: Event): void {
    e.stopPropagation();
    this.currentDate = new Date(this.year, this.month - 1, 1);
  }

  nextMonth(e: Event): void {
    e.stopPropagation();
    this.currentDate = new Date(this.year, this.month + 1, 1);
  }

  // Selection
  selectDay(day: number, e: Event): void {
    e.stopPropagation();
    this.setDate(new Date(this.year, this.month, day));
  }

  selectPreset(days: number, e: Event): void {
    e.stopPropagation();
    const d = new Date();
    d.setDate(d.getDate() + days);
    this.setDate(d);
  }

  private setDate(d: Date): void {
    this.selectedDate = d;
    this.currentDate = new Date(d.getFullYear(), d.getMonth(), 1);
    this.value = this.formatDateDDMMYYYY(d);
    this.onChange(this.value);
    this.onTouched();
    this.isOpen = false;
  }

  formatDateDDMMYYYY(d: Date | string | null): string {
    if (!d) return '';
    const dateObj = typeof d === 'string' ? this.parseDate(d) : d;
    if (!dateObj || isNaN(dateObj.getTime())) return typeof d === 'string' ? d : '';
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }

  // Helpers
  isToday(day: number): boolean {
    const today = new Date();
    return today.getFullYear() === this.year && today.getMonth() === this.month && today.getDate() === day;
  }

  isSelected(day: number): boolean {
    return !!this.selectedDate &&
      this.selectedDate.getFullYear() === this.year &&
      this.selectedDate.getMonth() === this.month &&
      this.selectedDate.getDate() === day;
  }

  private parseDate(val: string): Date | null {
    if (!val) return null;
    const trimmed = val.trim();
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d;
    }
    const parts = trimmed.split(/[-/]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return new Date(+parts[0], +parts[1] - 1, +parts[2]);
      if (parts[2].length === 4) return new Date(+parts[2], +parts[1] - 1, +parts[0]);
    }
    return null;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.isOpen = false;
    }
  }
}
