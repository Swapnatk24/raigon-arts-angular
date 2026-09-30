import { Component, inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

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

  private customerService = inject(CustomerService);
  private authService = inject(AuthService);
  private router = inject(Router);

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
    this.authService.logout();
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}

