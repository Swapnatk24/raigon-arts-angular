import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Customer, CustomerService } from '../../services/customer.service';

export interface NotificationActionItem {
  type: 'completed' | 'pending_payment';
  id: string;
  title: string;
  desc: string;
  meta: string;
  time: string;
  customer: Customer;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class NotificationComponent implements OnInit, OnDestroy {
  isOpen = false;
  activeFilter: 'all' | 'completed' | 'pending' = 'all';

  completedOrders: Customer[] = [];
  pendingPayments: Customer[] = [];
  items: NotificationActionItem[] = [];
  totalCount = 0;

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      (window as any).RaigonNotifications = this;
    }

    this.subscription.add(
      this.customerService.customers$.subscribe(customers => {
        this.updateNotifications(customers);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (typeof window !== 'undefined' && (window as any).RaigonNotifications === this) {
      (window as any).RaigonNotifications = null;
    }
  }

  getNotificationsData(): { completedOrders: Customer[]; pendingPayments: Customer[] } {
    const customers = this.customerService.getCustomers() || [];
    const completedOrders = customers.filter(
      c => c.orderStatus === 'Completed' || c.orderStatus === 'Ready'
    );
    const pendingPayments = customers.filter(
      c =>
        c.paymentStatus === 'Unpaid' ||
        c.paymentStatus === 'Partial' ||
        (c.balanceAmount !== undefined && c.balanceAmount > 0)
    );
    return { completedOrders, pendingPayments };
  }

  updateNotifications(customers?: Customer[]): void {
    const data = this.getNotificationsData();
    this.completedOrders = data.completedOrders;
    this.pendingPayments = data.pendingPayments;
    this.totalCount = this.completedOrders.length + this.pendingPayments.length;

    const allItems: NotificationActionItem[] = [];

    this.completedOrders.forEach(c => {
      allItems.push({
        type: 'completed',
        id: c.id,
        title: `Work Completed: #${c.id} 🖼️`,
        desc: `Framing job for ${c.name} (${c.frameSize || '12×18 inch'}) is completed & ready!`,
        meta: `Status: Completed • Phone: ${c.phone}`,
        time: 'Ready',
        customer: c
      });
    });

    this.pendingPayments.forEach(c => {
      const balance = c.balanceAmount !== undefined
        ? c.balanceAmount
        : (c.totalAmount - (c.advancePaid || 0));
      allItems.push({
        type: 'pending_payment',
        id: c.id,
        title: `Payment Pending: ₹${balance.toLocaleString('en-IN')} ⚠️`,
        desc: `${c.name} has ₹${balance.toLocaleString('en-IN')} unpaid balance due.`,
        meta: `Payment Status: ${c.paymentStatus || 'Unpaid'} • ${c.phone}`,
        time: 'Pending Dues',
        customer: c
      });
    });

    if (this.activeFilter === 'completed') {
      this.items = allItems.filter(i => i.type === 'completed');
    } else if (this.activeFilter === 'pending') {
      this.items = allItems.filter(i => i.type === 'pending_payment');
    } else {
      this.items = allItems;
    }

    this.cdr.detectChanges();
  }

  toggle(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open(): void {
    this.updateNotifications();
    this.isOpen = true;
    this.cdr.detectChanges();
  }

  close(): void {
    this.isOpen = false;
    this.cdr.detectChanges();
  }

  setFilter(filter: 'all' | 'completed' | 'pending'): void {
    this.activeFilter = filter;
    this.updateNotifications();
  }

  openOrder(id: string): void {
    this.close();
    if ((window as any).RaigonApp) {
      (window as any).RaigonApp.navigateTo('customers');
    }
    const cust = this.customerService.getCustomer(id);
    if (cust) {
      this.customerService.openViewCustomerModal(cust);
    }
    if ((window as any).RaigonCustomersView) {
      (window as any).RaigonCustomersView.viewCustomer(id);
    }
  }

  sendWhatsAppAlert(id: string): void {
    const cust = this.customerService.getCustomer(id);
    if (!cust) return;
    const phoneClean = (cust.phone || '').replace(/[^0-9]/g, '');
    const formatPhone = phoneClean.length === 10 ? `91${phoneClean}` : phoneClean;
    const balance = cust.balanceAmount !== undefined
      ? cust.balanceAmount
      : (cust.totalAmount - (cust.advancePaid || 0));

    let msgText = `Hello ${cust.name},\nThis is Raigon Arts Workshop regarding your order #${cust.id}.\n`;
    if (cust.orderStatus === 'Completed') {
      msgText += `🎉 Good news! Your framing job is completed and ready for pickup.\nBalance Due: ₹${balance.toLocaleString('en-IN')}\nThank you!`;
    } else {
      msgText += `⚠️ Order Status: ${cust.orderStatus}\nPending Balance Due: ₹${balance.toLocaleString('en-IN')}\nPlease complete the payment at your earliest convenience.\nThank you!`;
    }
    const msg = encodeURIComponent(msgText);
    window.open(`https://wa.me/${formatPhone}?text=${msg}`, '_blank');
  }

  viewAllOrders(): void {
    this.close();
    if ((window as any).RaigonApp) {
      (window as any).RaigonApp.navigateTo('orders');
    } else {
      this.router.navigate(['/orders'], { replaceUrl: true });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }
}

// Backward-compatibility export
export { NotificationComponent as Notification };