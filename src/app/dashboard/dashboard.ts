import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  Customer,
  CustomerService
} from '../services/customer.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {

  @Output() navigate = new EventEmitter<string>();

  stats = {
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
    totalRevenue: 0
  };

  customers: Customer[] = [];
  recentCustomers: Customer[] = [];

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      (window as any).RaigonDashboardView = this;
    }

    this.subscription.add(
      this.customerService.customers$.subscribe(customers => {
        this.customers = (customers || []).filter(c => !c.isArchived7Days);
        this.recentCustomers = this.customers.slice(0, 5);
        this.loadStats();
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (typeof window !== 'undefined' && (window as any).RaigonDashboardView === this) {
      (window as any).RaigonDashboardView = null;
    }
  }

  render(): void {
    const customers = this.customerService.getCustomers();
    this.customers = (customers || []).filter(c => !c.isArchived7Days);
    this.recentCustomers = this.customers.slice(0, 5);
    this.loadStats();
    this.cdr.detectChanges();
  }

  // =========================================
  // OPEN ADD CUSTOMER MODAL
  // =========================================
  openCustomerModal(): void {
    this.customerService.openAddCustomerModal();
  }

  loadStats(): void {
    this.stats = {
      totalOrders: this.customers.length,
      inProgress: this.customers.filter(c => c.orderStatus === 'In Progress').length,
      completed: this.customers.filter(c => c.orderStatus === 'Completed').length,
      pending: this.customers.filter(c => c.orderStatus === 'Pending').length,
      totalRevenue: this.customers.reduce((total, c) => total + Number(c.totalAmount || 0), 0)
    };
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'In Progress':
        return 'badge-in-progress';
      case 'Completed':
        return 'badge-completed';
      case 'Delivered':
        return 'badge-delivered';
      case 'Cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-pending';
    }
  }

  viewCustomer(id: string): void {
    const cust = this.customers.find(c => c.id === id) || this.customerService.getCustomer(id);
    if (cust) {
      this.customerService.openViewCustomerModal(cust);
    }
  }

  editCustomer(id: string): void {
    const cust = this.customers.find(c => c.id === id) || this.customerService.getCustomer(id);
    if (cust) {
      this.customerService.openEditCustomerModal(cust);
    }
  }

  viewAllCustomers(): void {
    this.navigate.emit('customers');
    this.router.navigate(['/customers']);
  }
}