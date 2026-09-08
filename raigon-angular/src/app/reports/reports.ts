import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Customer {
    id: string;
  name: string;
  phone: string;
  city?: string;
  frameSize?: string;
  material?: string;
  totalAmount?: number;
  advancePaid?: number;
  dueBalance?: number;
  deliveryDate?: string;
  paymentStatus?: string;
  orderStatus?: string;
  isArchived7Days?: boolean;
  totalBilled?: number;

}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  //styleUrl: './reports.css'
})
export class Reports {

  timeframe = '1_month';

  timeframeLabel = 'Last 30 Days (Sep - Oct 2026)';

  activeReportTab = 'active_ledger';

  filteredRevenue = 0;

  filteredAdvance = 0;

  filteredPending = 0;

  averageOrderValue = 0;

  analyzedOrders = 0;

  customerLedger: Customer[] = [];

  archived7DaysCustomers: Customer[] = [];

  customers: Customer[] = [];

  get avgOrderValue(): number {
    return this.averageOrderValue;
  }

  constructor() {
    this.loadData();
  }

  loadData(): void {

    this.customers = [];
    const activeCustomers =
      this.customers.filter(
        customer => !customer.isArchived7Days
      );

    this.archived7DaysCustomers =
      this.customers.filter(
        customer =>
          customer.isArchived7Days ||
          (
            customer.orderStatus === 'Completed' &&
            customer.paymentStatus === 'Paid'
          )
      );

    this.customerLedger =
      activeCustomers
        .map(customer => {

          const totalBilled =
            Number(customer.totalAmount) || 0;

          const advancePaid =
            Number(customer.advancePaid) || 0;

          return {
            ...customer,
            totalAmount: totalBilled,
            advancePaid,
            dueBalance: totalBilled - advancePaid
          } as Customer;
        })
        .sort(
          (a, b) =>
            (Number(b.totalAmount) || 0) -
            (Number(a.totalAmount) || 0)
        );

    this.filteredRevenue = 0;
    this.filteredAdvance = 0;
    this.filteredPending = 0;

    this.analyzedOrders = activeCustomers.length;

    this.averageOrderValue =
      this.analyzedOrders > 0
        ? Math.round(
            this.filteredRevenue / this.analyzedOrders
          )
        : 0;
  }

  setTimeframe(value: string): void {

    this.timeframe = value;

    if (value === '2_months') {

      this.timeframeLabel =
        'Last 60 Days (Aug - Oct 2026)';

    } else if (value === 'all') {

      this.timeframeLabel =
        'All-Time Historical (Includes Archived)';

    } else {

      this.timeframeLabel =
        'Last 30 Days (Sep - Oct 2026)';
    }
  }

  setTab(tab: string): void {
    this.activeReportTab = tab;
  }

  sendReminder(name: string): void {

    console.log(
      'Send payment reminder to:',
      name
    );
  }

  showSettledMessage(): void {

    console.log(
      'Customer payment is already settled.'
    );
  }

  viewHistoricalRecord(name: string): void {

    console.log(
      'View historical record:',
      name
    );
  }

  getInitials(name: string): string {

    if (!name) {
      return '';
    }

    return name
      .split(' ')
      .filter(value => value.length > 0)
      .map(value => value.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  exportPdf(): void {

    console.log(
      `Generating Executive PDF Report for ${this.timeframeLabel}`
    );
  }
}
