import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import {
  Customer,
  CustomerPhoto,
  CustomerService
} from '../../services/customer.service';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css'
})
export class ModalComponent implements OnInit, OnDestroy {

  // =========================================
  // MODAL
  // =========================================

  showAddCustomerModal = false;
  showFrameSizeModal = false;

frameSizeName = '';
frameSizeWidth = '';
frameSizeHeight = '';

  private subscription = new Subscription();


  // =========================================
  // CUSTOMER INFORMATION
  // =========================================

  customerName = '';

  customerPhone = '';

  alternativePhone = '';

  customerCity = '';

  customerAddress = '';

  customerPincode = '';


  // =========================================
  // FRAME INFORMATION
  // =========================================

  frameSize = '12 × 18 inch';

  unit = 'inch';

  customWidth = '';

  customHeight = '';

  frameType = 'Wooden Frame';

  frameMaterial = 'Teak Wood Moulding';

  frameColor = 'Walnut Brown';

  orientation = 'Landscape';

  quantity = 1;

  notes = '';


  // =========================================
  // ORDER INFORMATION
  // =========================================

  orderDate = this.getToday();

  deliveryDate = '';

  totalAmount = 2500;

  advancePaid = 1000;

  paymentStatus = 'Partial';

  orderStatus = 'In Progress';


  // =========================================
  // PHOTOS
  // =========================================

 
  selectedPhotos: CustomerPhoto[] = [];


  
  selectedPhoto: CustomerPhoto | null = null;

  photo: CustomerPhoto = {
    name: '',
    url: ''
  };


  // =========================================
  // VALIDATION
  // =========================================

  nameError = '';

  phoneError = '';

  cityError = '';


  // =========================================
  // FRAME CONFIGURATION
  // =========================================

  frameConfigMode: 'same' | 'individual' = 'same';


  // =========================================
  // CONSTRUCTOR
  // =========================================

  constructor(
    private customerService: CustomerService,
    private toastService: ToastService
  ) {}


  // =========================================
  // INITIALIZE
  // =========================================

 ngOnInit(): void {

  this.subscription.add(

    this.customerService.openCustomerModal$.subscribe(() => {

      this.openAddCustomerModal();

    })

  );

  this.subscription.add(

    this.customerService.openFrameSizeModal$.subscribe(() => {

      this.openFrameSizeModal();

    })

  );

}

  // =========================================
  // OPEN MODAL
  // =========================================

  openAddCustomerModal(): void {

    this.resetForm();

    this.showAddCustomerModal = true;

    document.body.style.overflow = 'hidden';

  }


  // =========================================
  // CLOSE MODAL
  // =========================================

  closeAddCustomerModal(): void {

    this.showAddCustomerModal = false;

    document.body.style.overflow = '';

  }


  // =========================================
  // NAME VALIDATION
  // =========================================

  validateName(): void {

    const name =
      this.customerName.trim();

    if (!name) {

      this.nameError =
        'Name is required';

      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(name)) {

      this.nameError =
        'Name should contain only letters and spaces';

      return;
    }

    this.nameError = '';

  }


  // =========================================
  // PHONE VALIDATION
  // =========================================

  validatePhone(): void {

    const phone =
      this.customerPhone.trim();

    if (!phone) {

      this.phoneError =
        'Phone number is required';

      return;
    }

    if (!/^\d{10}$/.test(phone)) {

      this.phoneError =
        'Phone number must contain exactly 10 digits';

      return;
    }

    this.phoneError = '';

  }


  // =========================================
  // CITY VALIDATION
  // =========================================

  validateCity(): void {

    const city =
      this.customerCity.trim();

    if (!city) {

      this.cityError =
        'City is required';

      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(city)) {

      this.cityError =
        'City should contain only letters and spaces';

      return;
    }

    this.cityError = '';

  }


  // =========================================
  // FRAME CONFIGURATION
  // =========================================

  setFrameConfigMode(
    mode: 'same' | 'individual'
  ): void {

    this.frameConfigMode = mode;

  }


  // =========================================
  // PHOTO SELECTION
  // =========================================

  onPhotoSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    /*
     * Allow multiple photos.
     */
    Array.from(input.files).forEach(file => {

      /*
       * Ignore non-image files.
       */
      if (!file.type.startsWith('image/')) {

        return;

      }


      const reader =
        new FileReader();


      reader.onload = () => {

        const newPhoto: CustomerPhoto = {

          name: file.name,

          url: reader.result as string

        };


        /*
         * Add photo to array.
         */
        this.selectedPhotos.push(newPhoto);


        /*
         * Keep compatibility with existing
         * modal.html.
         */
        this.selectedPhoto = newPhoto;

        this.photo = newPhoto;

      };


      reader.readAsDataURL(file);

    });


    /*
     * Reset file input so the same file
     * can be selected again.
     */
    input.value = '';

  }


  // =========================================
  // REMOVE PHOTO
  // =========================================

  removePhoto(index: number): void {

    if (
      index < 0 ||
      index >= this.selectedPhotos.length
    ) {

      return;

    }


    this.selectedPhotos.splice(index, 1);


    /*
     * Update compatibility properties.
     */
    if (this.selectedPhotos.length > 0) {

      const lastPhoto =
        this.selectedPhotos[
          this.selectedPhotos.length - 1
        ];

      this.selectedPhoto = lastPhoto;

      this.photo = lastPhoto;

    } else {

      this.selectedPhoto = null;

      this.photo = {
        name: '',
        url: ''
      };

    }

  }


  // =========================================
  // BALANCE AMOUNT
  // =========================================

  get balanceAmount(): number {

    const total =
      Number(this.totalAmount) || 0;

    const advance =
      Number(this.advancePaid) || 0;

    return Math.max(
      total - advance,
      0
    );

  }


  // =========================================
  // SAVE CUSTOMER
  // =========================================

  saveCustomer(): void {

    // Validate fields
    this.validateName();

    this.validatePhone();

    this.validateCity();


    // Stop if validation failed
    if (
      this.nameError ||
      this.phoneError ||
      this.cityError
    ) {

      return;

    }


    const total =
      Number(this.totalAmount) || 0;

    const advance =
      Number(this.advancePaid) || 0;

    const balance =
      Math.max(
        total - advance,
        0
      );


    // =========================================
    // CREATE CUSTOMER
    // =========================================

    const newCustomer: Customer = {

      id:
        this.generateCustomerId(),

      name:
        this.customerName.trim(),

      phone:
        this.customerPhone.trim(),

      alternativePhone:
        this.alternativePhone.trim(),

      city:
        this.customerCity.trim(),

      address:
        this.customerAddress.trim(),

      pincode:
        this.customerPincode.trim(),


      // =======================================
      // FRAME INFORMATION
      // =======================================

      frameSize:
        this.frameSize,

      frameType:
        this.frameType,

      frameMaterial:
        this.frameMaterial,

      frameColor:
        this.frameColor,

      unit:
        this.unit,

      orientation:
        this.orientation,


      // =======================================
      // AMOUNT INFORMATION
      // =======================================

      quantity:
        Number(this.quantity) || 1,

      totalAmount:
        total,

      advancePaid:
        advance,

      balanceAmount:
        balance,


      // =======================================
      // STATUS
      // =======================================

      paymentStatus:
        this.paymentStatus,

      orderStatus:
        this.orderStatus,


      // =======================================
      // DATES
      // =======================================

      orderDate:
        this.orderDate,

      deliveryDate:
        this.deliveryDate,


      // =======================================
      // NOTES
      // =======================================

      notes:
        this.notes.trim(),


      // =======================================
      // PHOTOS
      // =======================================

      photos:
        [...this.selectedPhotos]

    };


    // =========================================
    // ADD TO CUSTOMER SERVICE
    // =========================================

    this.customerService.addCustomer(
      newCustomer
    );


    // =========================================
    // SUCCESS TOAST
    // =========================================

    this.toastService.success(
      'Customer added successfully.'
    );


    // =========================================
    // CLOSE MODAL
    // =========================================

    this.closeAddCustomerModal();


    // =========================================
    // RESET FORM
    // =========================================

    this.resetForm();

  }


  // =========================================
  // GENERATE CUSTOMER / ORDER ID
  // =========================================

  private generateCustomerId(): string {

    const customers =
      this.customerService.getCustomers();


    let number =
      customers.length + 1;


    let id =
      `ORD-${String(number).padStart(3, '0')}`;


    /*
     * Make sure ID is unique.
     */
    while (
      customers.some(
        customer =>
          customer.id === id
      )
    ) {

      number++;

      id =
        `ORD-${String(number).padStart(3, '0')}`;

    }


    return id;

  }


  // =========================================
  // RESET FORM
  // =========================================

  resetForm(): void {

    // Customer information
    this.customerName = '';

    this.customerPhone = '';

    this.alternativePhone = '';

    this.customerCity = '';

    this.customerAddress = '';

    this.customerPincode = '';


    // Frame information
    this.frameSize =
      '12 × 18 inch';

    this.unit =
      'inch';

    this.customWidth =
      '';

    this.customHeight =
      '';

    this.frameType =
      'Wooden Frame';

    this.frameMaterial =
      'Teak Wood Moulding';

    this.frameColor =
      'Walnut Brown';

    this.orientation =
      'Landscape';

    this.quantity =
      1;

    this.notes =
      '';


    // Order information
    this.orderDate =
      this.getToday();

    this.deliveryDate =
      '';

    this.totalAmount =
      2500;

    this.advancePaid =
      1000;

    this.paymentStatus =
      'Partial';

    this.orderStatus =
      'In Progress';


    // =========================================
    // PHOTO RESET
    // =========================================

    this.selectedPhotos = [];

    this.selectedPhoto = null;

    this.photo = {
      name: '',
      url: ''
    };


    // Frame configuration
    this.frameConfigMode =
      'same';


    // Validation
    this.nameError =
      '';

    this.phoneError =
      '';

    this.cityError = '';

  }


  // =========================================
  // GET TODAY
  // =========================================

  private getToday(): string {

    return new Date()
      .toISOString()
      .split('T')[0];

  }
  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    this.subscription?.unsubscribe();

    document.body.style.overflow = '';

  }
  //=========================================
  //FRAME SIZE MODAL
  // =========================================

  openFrameSizeModal(): void {

    this.frameSizeName = '';
    this.frameSizeWidth = '';
    this.frameSizeHeight = '';

    this.showFrameSizeModal = true;

  }


  closeFrameSizeModal(): void {

    this.showFrameSizeModal = false;

  }


  saveFrameSize(): void {

    if (!this.frameSizeName.trim()) {
      return;
    }

    const newFrameSize = {
      name: this.frameSizeName.trim(),
      width: this.frameSizeWidth,
      height: this.frameSizeHeight
    };

    console.log('New Frame Size:', newFrameSize);

    this.closeFrameSizeModal();

  }

}
