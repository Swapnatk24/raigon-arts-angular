import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  duration: number;
}

/* ==========================================================================
   Raigon Arts Management System - Toast Notification System (TS Version)
   Converted directly from js/components/toast.js
   ========================================================================== */

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private container: HTMLElement | null = null;
  private toastSubject = new Subject<Toast>();
  toast$ = this.toastSubject.asObservable();

  constructor() {
    this.init();
    if (typeof window !== 'undefined') {
      (window as any).RaigonToast = this;
      (window as any).ToastManager = ToastService;
    }
  }

  init(): void {
    if (typeof document === 'undefined') return;

    let existing = document.getElementById('toastContainer');
    if (existing) {
      this.container = existing;
    } else if (document.body) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(
    message: string,
    type: ToastType = 'success',
    duration: number = 3500
  ): void {
    if (typeof document === 'undefined') return;

    if (!this.container || !document.body.contains(this.container)) {
      this.init();
    }

    if (!this.container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-circle-check';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';
    if (type === 'error') iconClass = 'fa-circle-xmark';
    if (type === 'info') iconClass = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${iconClass} toast-icon"></i>
      <div class="toast-message font-medium">${message}</div>
    `;

    this.container.appendChild(toast);

    // Also notify Subject for reactive consumers if any
    this.toastSubject.next({
      message,
      type,
      duration
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, duration);
  }

  success(message: string, duration: number = 3500): void {
    this.show(message, 'success', duration);
  }

  warning(message: string, duration: number = 3500): void {
    this.show(message, 'warning', duration);
  }

  error(message: string, duration: number = 3500): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3500): void {
    this.show(message, 'info', duration);
  }
}