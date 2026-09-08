import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Order {
  id: string;
  name: string;
  phone: string;
  photos?: string[];
  frameSize: string;
  frameType: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  orderStatus: string;
  deliveryDate?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.html',
  //styleUrl: './orders.css'
})
export class Orders {

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

  customers: Order[] = [];

  get filtered(): Order[] {

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
    console.log('Open Add New Customer modal');
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

  updateOrderStatus(id: string, newStatus: string): void {

    const order = this.customers.find(
      customer => customer.id === id
    );

    if (order) {
      order.orderStatus = newStatus;
    }
  }

  viewCustomer(id: string): void {
    console.log('View customer/order:', id);
  }

  sendWhatsAppReceipt(id: string): void {

    const order = this.customers.find(
      customer => customer.id === id
    );

    if (!order) {
      return;
    }

    const message =
      `Hello ${order.name}, your Raigon Arts order ${order.id} details are ready.`;

    const phone = order.phone.replace(/\D/g, '');

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
      '_blank'
    );
  }

  editCustomer(id: string): void {
    console.log('Edit customer/order:', id);
  }
}
