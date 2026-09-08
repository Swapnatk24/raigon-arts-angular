import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface CustomerPhoto {
  name: string;
  url: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  alternativePhone: string;
  city: string;
  address: string;
  pincode: string;

  frameSize: string;
  frameType: string;
  frameMaterial: string;
  frameColor: string;
  unit: string;
  orientation: string;

  quantity: number;
  totalAmount: number;
  advancePaid: number;
  balanceAmount: number;

  paymentStatus: string;
  orderStatus: string;
  orderDate: string;
  deliveryDate: string;
  notes: string;

  photos: CustomerPhoto[];
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private customersSubject =
    new BehaviorSubject<Customer[]>([
      {
        id: 'ORD-001',
        name: 'Arun Kumar',
        phone: '7902261255',
        alternativePhone: '',
        city: 'Kochi',
        address: '',
        pincode: '',
        frameSize: '12 × 18 inch',
        frameType: 'Wooden Frame',
        frameMaterial: 'Teak Wood Moulding',
        frameColor: 'Walnut Brown',
        unit: 'inch',
        orientation: 'Landscape',
        quantity: 2,
        totalAmount: 4500,
        advancePaid: 4500,
        balanceAmount: 0,
        paymentStatus: 'Paid',
        orderStatus: 'Completed',
        orderDate: '2026-09-07',
        deliveryDate: '2026-09-10',
        notes: '',
        photos: []
      },
      {
        id: 'ORD-002',
        name: 'Anjali S',
        phone: '9447000000',
        alternativePhone: '',
        city: 'Trivandrum',
        address: '',
        pincode: '',
        frameSize: '8 × 10 inch',
        frameType: 'Wooden Frame',
        frameMaterial: 'Teak Wood Moulding',
        frameColor: 'Walnut Brown',
        unit: 'inch',
        orientation: 'Portrait',
        quantity: 1,
        totalAmount: 2200,
        advancePaid: 1000,
        balanceAmount: 1200,
        paymentStatus: 'Partial',
        orderStatus: 'Pending',
        orderDate: '2026-09-07',
        deliveryDate: '2026-09-15',
        notes: '',
        photos: []
      }
    ]);

  customers$ =
    this.customersSubject.asObservable();


  // ================================
// CUSTOMER / FRAME SIZE MODALS
// ================================

private openCustomerModalSubject =
  new Subject<void>();

private openFrameSizeModalSubject =
  new Subject<void>();


openCustomerModal$ =
  this.openCustomerModalSubject.asObservable();

openFrameSizeModal$ =
  this.openFrameSizeModalSubject.asObservable();


// Open Add Customer Modal
openAddCustomerModal(): void {

  this.openCustomerModalSubject.next();

}


// Open Frame Size Modal
openFrameSizeModal(): void {

  this.openFrameSizeModalSubject.next();

}
  // ================================
  // CUSTOMER FUNCTIONS
  // ================================

  getCustomers(): Customer[] {
    return this.customersSubject.value;
  }


  addCustomer(customer: Customer): void {

    const customers =
      this.customersSubject.value;

    this.customersSubject.next([
      ...customers,
      customer
    ]);
  }


  deleteCustomer(id: string): void {

    const customers =
      this.customersSubject.value.filter(
        customer => customer.id !== id
      );

    this.customersSubject.next(customers);
  }


  // ================================
  // PHOTO FUNCTIONS
  // ================================

  addPhotos(
    customerId: string,
    photos: CustomerPhoto[]
  ): void {

    const customers =
      this.customersSubject.value.map(
        customer => {

          if (customer.id === customerId) {

            return {
              ...customer,
              photos: [
                ...customer.photos,
                ...photos
              ]
            };

          }

          return customer;

        }
      );

    this.customersSubject.next(customers);
  }


  removePhoto(
    customerId: string,
    photoName: string
  ): void {

    const customers =
      this.customersSubject.value.map(
        customer => {

          if (customer.id === customerId) {

            return {
              ...customer,
              photos:
                customer.photos.filter(
                  photo =>
                    photo.name !== photoName
                )
            };

          }

          return customer;

        }
      );

    this.customersSubject.next(customers);
  }

}

