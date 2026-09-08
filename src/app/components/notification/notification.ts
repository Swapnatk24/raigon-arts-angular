import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NotificationService,
  NotificationItem
} from '../../services/notification.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html'
})
export class Notification implements OnInit {

  notifications: NotificationItem[] = [];

  showNotifications = false;

  private subscription?: Subscription;

  constructor(
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {

    this.subscription =
      this.notificationService.notifications$
        .subscribe((notifications: NotificationItem[]) => {

          this.notifications = notifications;

        });

  }

  toggleNotifications(): void {
    this.showNotifications =
      !this.showNotifications;
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  markAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  clearNotifications(): void {
    this.notificationService.clear();
  }

  get unreadCount(): number {

    return this.notifications
      .filter(notification => !notification.read)
      .length;

  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}