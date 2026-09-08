import { Component } from '@angular/core';
import { CustomerService } from '../services/customer.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {

  sidebarCollapsed = false;
  currentView = 'dashboard';

  constructor(
    private customerService: CustomerService
  ) {}

  toggleSidebar(): void {
    this.sidebarCollapsed =
      !this.sidebarCollapsed;
  }

  navigate(view: string): void {
    this.currentView = view;
  }

  openAddCustomer(): void {
    this.customerService.openAddCustomerModal();
  }

  logout(): void {
    localStorage.removeItem('isLoggedIn');
    window.location.href = '/';
  }
}

