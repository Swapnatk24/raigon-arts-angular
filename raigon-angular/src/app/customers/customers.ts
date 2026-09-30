import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';

import {
  Customer,
  CustomerPhoto,
  CustomerService,
  parseDateTimestamp
} from '../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './customers.html'
})
export class Customers implements OnInit, OnDestroy {

  searchQuery = '';
  statusFilter = 'All';
  sortBy = 'date_desc';
  currentPage = 1;
  pageSize = 5;

  customers: Customer[] = [];
  private subscription = new Subscription();

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    (window as any).RaigonCustomersView = this;
    this.searchQuery = this.customerService.getSearchQuery();

    this.subscription.add(
      this.customerService.customers$.subscribe(customers => {
        this.customers = customers;
        this.cdr.detectChanges();
      })
    );
    this.subscription.add(
      this.customerService.searchQuery$.subscribe(query => {
        this.searchQuery = query;
        this.currentPage = 1;
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if ((window as any).RaigonCustomersView === this) {
      (window as any).RaigonCustomersView = null;
    }
  }

  get filteredAndSortedCustomers(): Customer[] {
    const query = this.searchQuery.toLowerCase().trim();

    return this.customers.filter(c => {
      // Exclude auto-archived from active list if applicable
      if (c.isArchived7Days) return false;

      const matchQuery = !query ||
        (c.name && c.name.toLowerCase().includes(query)) ||
        (c.phone && c.phone.includes(query)) ||
        (c.id && c.id.toLowerCase().includes(query)) ||
        (c.city && c.city.toLowerCase().includes(query)) ||
        (c.address && c.address.toLowerCase().includes(query)) ||
        (c.frameSize && c.frameSize.toLowerCase().includes(query)) ||
        (c.frameType && c.frameType.toLowerCase().includes(query));

      const matchStatus = this.statusFilter === 'All' || c.orderStatus === this.statusFilter;

      return matchQuery && matchStatus;
    }).sort((a, b) => {
      if (this.sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
      if (this.sortBy === 'amount_desc') return (Number(b.totalAmount) || 0) - (Number(a.totalAmount) || 0);
      if (this.sortBy === 'date_asc') return parseDateTimestamp(a.orderDate) - parseDateTimestamp(b.orderDate);
      
      // Default: Newest first (date_desc)
      const diff = parseDateTimestamp(b.orderDate) - parseDateTimestamp(a.orderDate);
      if (diff !== 0) return diff;
      return (b.id || '').localeCompare(a.id || '', undefined, { numeric: true });
    });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAndSortedCustomers.length / this.pageSize) || 1;
  }

  get startIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  get paginatedCustomers(): Customer[] {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    return this.filteredAndSortedCustomers.slice(this.startIndex, this.startIndex + this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  handleSearch(val: string): void {
    this.searchQuery = val;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  handleFilterChange(val: string): void {
    this.statusFilter = val;
    this.currentPage = 1;
  }

  handleSortChange(val: string): void {
    this.sortBy = val;
  }

  handlePageSizeChange(val: string | number): void {
    this.pageSize = Number(val) || 5;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  openCustomerModal(): void {
    this.customerService.openAddCustomerModal();
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

  viewCustomer(customerOrId: Customer | string): void {
    const cust = typeof customerOrId === 'string'
      ? this.customerService.getCustomer(customerOrId)
      : customerOrId;
    if (cust) {
      this.customerService.openViewCustomerModal(cust);
    }
  }

  editCustomer(customerOrId: Customer | string): void {
    const cust = typeof customerOrId === 'string'
      ? this.customerService.getCustomer(customerOrId)
      : customerOrId;
    if (cust) {
      this.customerService.openEditCustomerModal(cust);
    }
  }

  deleteCustomer(id: string, name: string): void {
    this.customerService.confirm({
      title: 'Delete Customer Order',
      message: `Are you sure you want to delete customer record "${name}" (${id})? This action cannot be undone.`,
      confirmText: 'Delete Order',
      confirmClass: 'btn-danger',
      onConfirm: () => {
        this.customerService.deleteCustomer(id);
        this.toastService.warning(`Customer "${name}" (${id}) deleted.`);
      }
    });
  }

  sendWhatsAppReceipt(customerOrId: Customer | string): void {
    this.customerService.sendWhatsAppReceipt(customerOrId);
  }

  exportCSV(): void {
    const list = this.filteredAndSortedCustomers;
    if (!list.length) {
      this.toastService.warning('No customer records to export.');
      return;
    }

    const headers = ['Customer ID', 'Customer Name', 'Phone', 'City', 'Address', 'Frame Size', 'Frame Type', 'Quantity', 'Total Amount', 'Advance Paid', 'Balance', 'Payment Status', 'Order Status', 'Order Date'];
    const rows = list.map(c => [
      `"${(c.id || '').replace(/"/g, '""')}"`,
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `="` + (c.phone || '').replace(/"/g, '""') + `"`,
      `"${(c.city || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.frameSize || '').replace(/"/g, '""')}"`,
      `"${(c.frameType || '').replace(/"/g, '""')}"`,
      (c.quantity !== undefined && c.quantity !== null) ? c.quantity : '',
      c.totalAmount ?? 0,
      c.advancePaid ?? 0,
      c.balanceAmount ?? 0,
      `"${(c.paymentStatus || '').replace(/"/g, '""')}"`,
      `"${(c.orderStatus || '').replace(/"/g, '""')}"`,
      `"${this.formatDateForCSV(c.orderDate).replace(/"/g, '""')}"`
    ]);

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Raigon_Customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.toastService.success(`Exported ${list.length} customer records to CSV.`);
  }

  private formatDateForCSV(val: string | undefined | null): string {
    if (!val || val === 'N/A' || val === 'TBD') return '';
    const str = String(val).trim();

    // If already in DD-MM-YYYY or DD/MM/YYYY format
    const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (dmyMatch) {
      const dd = dmyMatch[1].padStart(2, '0');
      const mm = dmyMatch[2].padStart(2, '0');
      const yyyy = dmyMatch[3];
      return `${dd}/${mm}/${yyyy}`;
    }

    // If in YYYY-MM-DD or YYYY/MM/DD format
    const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (ymdMatch) {
      const yyyy = ymdMatch[1];
      const mm = ymdMatch[2].padStart(2, '0');
      const dd = ymdMatch[3].padStart(2, '0');
      return `${dd}/${mm}/${yyyy}`;
    }

    // If text date like "Sep 17, 2026", "17 Sep 2026", etc.
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}/${mm}/${yyyy}`;
    }

    return str;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'In Progress': return 'badge-in-progress';
      case 'Completed': return 'badge-completed';
      case 'Cancelled': return 'badge-cancelled';
      case 'Pending': return 'badge-pending';
      default: return '';
    }
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }
}