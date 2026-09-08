import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import {
  ToastService,
  Toast as ToastMessage
} from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html'
})
export class ToastComponent implements OnInit, OnDestroy {

  toasts: ToastMessage[] = [];

  private subscription?: Subscription;

  constructor(
    private toastService: ToastService
  ) {}

  ngOnInit(): void {

    this.subscription =
      this.toastService.toast$.subscribe(
        (toast: ToastMessage) => {

          this.toasts.push(toast);

          setTimeout(() => {

            const index =
              this.toasts.indexOf(toast);

            if (index !== -1) {
              this.toasts.splice(index, 1);
            }

          }, toast.duration);

        }
      );

  }

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

  }

  getIcon(type: string): string {

    if (type === 'warning') {
      return 'fa-triangle-exclamation';
    }

    if (type === 'error') {
      return 'fa-circle-xmark';
    }

    return 'fa-circle-check';

  }

}