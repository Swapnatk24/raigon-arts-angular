import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Customer, CustomerService } from '../services/customer.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html'
})
export class Orders implements OnInit, OnDestroy {

  tabs = [
    'All',
    'Pending',
    'In Progress',
    'Completed',
    'Cancelled'
  ];

  statuses = [
    'Pending',
    'In Progress',
    'Completed',
    'Cancelled'
  ];

  currentTab = 'All';
  searchQuery = '';
  customers: Customer[] = [];

  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.customerService.customers$.subscribe(customers => {
        this.customers = customers;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get filtered(): Customer[] {
    const search = this.searchQuery.trim().toLowerCase();

    return this.customers.filter(order => {
      const matchTab =
        this.currentTab === 'All' ||
        order.orderStatus === this.currentTab;

      const matchSearch =
        !search ||
        order.id.toLowerCase().includes(search) ||
        order.name.toLowerCase().includes(search) ||
        order.phone.includes(search);

      return matchTab && matchSearch;
    });
  }

  openCustomerModal(): void {
    this.customerService.openAddCustomerModal();
  }

  setTab(tab: string): void {
    this.currentTab = tab;
  }

  getTabCount(tab: string): number {
    if (tab === 'All') {
      return this.customers.length;
    }

    return this.customers.filter(
      customer => customer.orderStatus === tab
    ).length;
  }

  handleSearch(value: string): void {
    this.searchQuery = value;
  }

  formatAmount(amount: number): string {
    return Number(amount || 0).toLocaleString('en-IN');
  }

  formatDate(val: string | undefined): string {
    if (!val || val === 'N/A' || val === 'TBD') return val || '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (/^[A-Za-z]{3}\s+\d{1,2},?\s+\d{4}$/.test(val.trim())) {
      return val.trim();
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return val;
  }

  updateOrderStatus(id: string, newStatus: string): void {
    const order = this.customers.find(c => c.id === id);
    if (order) {
      this.customerService.updateCustomer({ ...order, orderStatus: newStatus });
      this.toastService.success(`Order ${id} status updated to "${newStatus}"`);
    }
  }

  viewCustomer(id: string): void {
    const order = this.customers.find(c => c.id === id);
    if (order) {
      this.customerService.openViewCustomerModal(order);
    }
  }

  editCustomer(id: string): void {
    const order = this.customers.find(c => c.id === id);
    if (order) {
      this.customerService.openEditCustomerModal(order);
    }
  }

  sendWhatsAppReceipt(id: string): void {
    this.customerService.sendWhatsAppReceipt(id);
  }
}
