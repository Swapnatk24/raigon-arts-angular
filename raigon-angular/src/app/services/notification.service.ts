import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private notificationsSubject =
    new BehaviorSubject<NotificationItem[]>([]);

  notifications$ =
    this.notificationsSubject.asObservable();

  addNotification(
    title: string,
    message: string
  ): void {

    const notification: NotificationItem = {
      id: Date.now(),
      title: title,
      message: message,
      time: new Date(),
      read: false
    };

    const current =
      this.notificationsSubject.value;

    this.notificationsSubject.next([
      notification,
      ...current
    ]);
  }

  markAsRead(id: number): void {

    const notifications =
      this.notificationsSubject.value.map(notification => {

        if (notification.id === id) {
          return {
            ...notification,
            read: true
          };
        }

        return notification;
      });

    this.notificationsSubject.next(notifications);
  }

  clear(): void {
    this.notificationsSubject.next([]);
  }
}