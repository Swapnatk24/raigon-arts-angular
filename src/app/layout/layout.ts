// import { Component, EventEmitter, Output } from '@angular/core';

// import { Dashboard } from '../dashboard/dashboard';
// import { Customers } from '../customers/customers';
// import { Orders } from '../orders/orders';
// import { Photos } from '../photos/photos';
// import { Frames } from '../frames/frames';
// import { Reports } from '../reports/reports';
// import { Settings } from '../settings/settings';

// import { CustomerService } from '../services/customer.service';
// import { ModalComponent } from '../components/modal/modal';
// import { ToastComponent } from '../components/toast/toast';

// @Component({
//   selector: 'app-layout',
//   standalone: true,

//   imports: [
//     Dashboard,
//     Customers,
//     Orders,
//     Photos,
//     Frames,
//     Reports,
//     Settings,
//     ModalComponent,
//     ToastComponent
//   ],

//   templateUrl: './layout.html'
// })
// export class Layout {

//   @Output() logoutEvent =
//     new EventEmitter<void>();

//   currentView = 'dashboard';

//   sidebarCollapsed = false;

//   constructor(
//     private customerService: CustomerService
//   ) {}

//   navigate(view: string): void {
//     this.currentView = view;
//   }

//   openAddCustomer(): void {
//     this.customerService.openAddCustomerModal();
//   }

//   toggleSidebar(): void {
//     this.sidebarCollapsed =
//       !this.sidebarCollapsed;
//   }

//   logout(): void {
//     this.logoutEvent.emit();
//   }
// }



import { Component, EventEmitter, Output } from '@angular/core';

import { Dashboard } from '../dashboard/dashboard';
import { Customers } from '../customers/customers';
import { Orders } from '../orders/orders';
import { Photos } from '../photos/photos';
import { Frames } from '../frames/frames';
import { Reports } from '../reports/reports';
import { Settings } from '../settings/settings';

import { CustomerService } from '../services/customer.service';
import { ModalComponent } from '../components/modal/modal';
import { ToastComponent } from '../components/toast/toast';

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [
    Dashboard,
    Customers,
    Orders,
    Photos,
    Frames,
    Reports,
    Settings,
    ModalComponent,
    ToastComponent
  ],

  templateUrl: './layout.html'
})
export class Layout {

  @Output() logoutEvent = new EventEmitter<void>();

  currentView = 'dashboard';

  sidebarCollapsed = false;

  constructor(
    private customerService: CustomerService
  ) {}

  // =========================================
  // SIDEBAR NAVIGATION
  // =========================================

  navigate(view: string): void {
    this.currentView = view;
  }

  // =========================================
  // ADD NEW CUSTOMER
  // =========================================

  openAddCustomer(): void {
    this.customerService.openAddCustomerModal();
  }

  // =========================================
  // SIDEBAR COLLAPSE
  // =========================================

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  // =========================================
  // THEME
  // =========================================

  toggleThemeMode(): void {
    document.body.classList.toggle('dark-mode');
  }

  // =========================================
  // NOTIFICATIONS
  // =========================================

  toggleNotifications(event: Event): void {
    event.stopPropagation();
  }

  // =========================================
  // USER / SETTINGS
  // =========================================

  goToSettings(): void {
    this.currentView = 'settings';
  }

  // =========================================
  // LOGOUT
  // =========================================

  logout(): void {
    this.logoutEvent.emit();
  }
}