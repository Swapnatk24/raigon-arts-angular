import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';

import {
  Customer,
  CustomerPhoto,
  CustomerService
} from '../services/customer.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DecimalPipe
  ],
  templateUrl: './customers.html'
})
export class Customers implements OnInit, OnDestroy {

  searchQuery = '';

  showModal = false;

  customers: Customer[] = [];

  selectedPhotos: CustomerPhoto[] = [];

  private subscription = new Subscription();

  customer = {
    name: '',
    phone: '',
    alternativePhone: '',
    city: '',
    address: '',
    pincode: '',

    frameSize: '12 × 18 inch',
    unit: 'inch',

    frameType: 'Wooden Frame',
    frameMaterial: 'Teak Wood Moulding',
    frameColor: 'Walnut Brown',

    orientation: 'Landscape',

    quantity: 1,

    notes: '',

    orderDate: this.getToday(),

    deliveryDate: '',

    totalAmount: 2500,

    advancePaid: 1000,

    paymentStatus: 'Partial',

    orderStatus: 'In Progress'
  };

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {}

  // ============================================================
  // INIT
  // ============================================================

  // ngOnInit(): void {

  //   this.subscription.add(
  //     this.customerService.customers$.subscribe(
  //       customers => {
  //         this.customers = customers;
  //       }
  //     )
  //   );

  //   this.subscription.add(
  //     this.customerService.openCustomerModal$.subscribe(() => {
  //       this.openCustomerModal();
  //     })
  //   );

  // }


  ngOnInit(): void {

  this.subscription.add(
    this.customerService.customers$.subscribe(
      customers => {
        this.customers = customers;
      }
    )
  );

}

  // ============================================================
  // DESTROY
  // ============================================================

  ngOnDestroy(): void {

    this.subscription.unsubscribe();

  }

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  get filteredCustomers(): Customer[] {

    if (!this.searchQuery.trim()) {
      return this.customers;
    }

    const search =
      this.searchQuery.toLowerCase().trim();

    return this.customers.filter(customer =>
      customer.id.toLowerCase().includes(search) ||
      customer.name.toLowerCase().includes(search) ||
      customer.phone.includes(search)
    );

  }

  // ============================================================
  // OPEN CUSTOMER MODAL
  // ============================================================

  openCustomerModal(): void {

    this.customerService.openAddCustomerModal();

  }

  openAddCustomer(): void {

    this.customerService.openAddCustomerModal();

  }

  // ============================================================
  // CLOSE CUSTOMER MODAL
  // ============================================================

  closeCustomerModal(): void {

    this.showModal = false;

  }

  // ============================================================
  // SAVE CUSTOMER
  // ============================================================

  saveCustomer(): void {

    // ----------------------------------------------------------
    // Customer name validation
    // ----------------------------------------------------------

    if (!this.customer.name.trim()) {

      this.toastService.warning(
        'Please enter customer name.'
      );

      return;
    }

    // ----------------------------------------------------------
    // Customer name validation
    // Allows letters and spaces only
    // ----------------------------------------------------------

    if (!/^[A-Za-z\s]+$/.test(this.customer.name.trim())) {

      this.toastService.warning(
        'Customer name can contain letters and spaces only.'
      );

      return;
    }

    // ----------------------------------------------------------
    // Phone validation
    // ----------------------------------------------------------

    if (!/^\d{10}$/.test(this.customer.phone)) {

      this.toastService.warning(
        'Phone number must contain 10 digits.'
      );

      return;
    }

    // ----------------------------------------------------------
    // Total amount
    // ----------------------------------------------------------

    const total =
      Number(this.customer.totalAmount) || 0;

    // ----------------------------------------------------------
    // Advance amount
    // ----------------------------------------------------------

    const advance =
      Number(this.customer.advancePaid) || 0;

    // ----------------------------------------------------------
    // Balance amount
    // ----------------------------------------------------------

    const balance =
      Math.max(total - advance, 0);

    // ----------------------------------------------------------
    // Create customer object
    // ----------------------------------------------------------

    const newCustomer: Customer = {

      id: this.generateOrderId(),

      name: this.customer.name.trim(),

      phone: this.customer.phone,

      alternativePhone:
        this.customer.alternativePhone,

      city:
        this.customer.city,

      address:
        this.customer.address,

      pincode:
        this.customer.pincode,

      frameSize:
        this.customer.frameSize,

      frameType:
        this.customer.frameType,

      frameMaterial:
        this.customer.frameMaterial,

      frameColor:
        this.customer.frameColor,

      unit:
        this.customer.unit,

      orientation:
        this.customer.orientation,

      quantity:
        Number(this.customer.quantity) || 1,

      totalAmount:
        total,

      advancePaid:
        advance,

      balanceAmount:
        balance,

      paymentStatus:
        this.customer.paymentStatus,

      orderStatus:
        this.customer.orderStatus,

      orderDate:
        this.customer.orderDate,

      deliveryDate:
        this.customer.deliveryDate,

      notes:
        this.customer.notes,

      photos:
        [...this.selectedPhotos]

    };

    // ----------------------------------------------------------
    // Add customer
    // ----------------------------------------------------------

    this.customerService.addCustomer(newCustomer);

    // ----------------------------------------------------------
    // Close modal
    // ----------------------------------------------------------

    this.showModal = false;

    // ----------------------------------------------------------
    // Reset form
    // ----------------------------------------------------------

    this.resetForm();

    // ----------------------------------------------------------
    // Success toast
    // ----------------------------------------------------------

    this.toastService.success(
      'Customer added successfully.'
    );

  }

  // ============================================================
  // DELETE CUSTOMER
  // ============================================================

  deleteCustomer(id: string): void {

    const confirmed =
      confirm(
        'Are you sure you want to delete this customer?'
      );

    if (!confirmed) {
      return;
    }

    this.customerService.deleteCustomer(id);

    this.toastService.success(
      'Customer deleted successfully.'
    );

  }

  // ============================================================
  // FILE / PHOTO SELECTION
  // ============================================================

  handleFileSelect(files: FileList | null): void {

    if (!files) {
      return;
    }

    Array.from(files).forEach(file => {

      // Only allow image files
      if (!file.type.startsWith('image/')) {
        return;
      }

      const photo: CustomerPhoto = {

        name: file.name,

        url: URL.createObjectURL(file)

      };

      this.selectedPhotos.push(photo);

    });

    if (files.length > 0) {

      this.toastService.success(
        `${files.length} photo${files.length > 1 ? 's' : ''} selected.`
      );

    }

  }

  // ============================================================
  // REMOVE SELECTED PHOTO
  // ============================================================

  removeSelectedPhoto(index: number): void {

    const photo =
      this.selectedPhotos[index];

    if (photo?.url) {

      URL.revokeObjectURL(photo.url);

    }

    this.selectedPhotos.splice(index, 1);

  }

  // ============================================================
  // BALANCE AMOUNT
  // ============================================================

  get balanceAmount(): number {

    const total =
      Number(this.customer.totalAmount) || 0;

    const advance =
      Number(this.customer.advancePaid) || 0;

    return Math.max(total - advance, 0);

  }

  // ============================================================
  // RESET FORM
  // ============================================================

  private resetForm(): void {

    this.customer = {

      name: '',
      phone: '',
      alternativePhone: '',
      city: '',
      address: '',
      pincode: '',

      frameSize: '12 × 18 inch',
      unit: 'inch',

      frameType: 'Wooden Frame',
      frameMaterial: 'Teak Wood Moulding',
      frameColor: 'Walnut Brown',

      orientation: 'Landscape',

      quantity: 1,

      notes: '',

      orderDate: this.getToday(),

      deliveryDate: '',

      totalAmount: 2500,

      advancePaid: 1000,

      paymentStatus: 'Partial',

      orderStatus: 'In Progress'

    };

    this.selectedPhotos = [];

  }

  // ============================================================
  // GENERATE ORDER ID
  // ============================================================

  private generateOrderId(): string {

    const customers =
      this.customerService.getCustomers();

    const nextNumber =
      customers.length + 1;

    return `ORD-${String(nextNumber).padStart(3, '0')}`;

  }

  // ============================================================
  // TODAY'S DATE
  // ============================================================

  private getToday(): string {

    return new Date()
      .toISOString()
      .split('T')[0];

  }

}