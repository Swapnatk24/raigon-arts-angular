// // import { Component, OnInit } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import { FormsModule } from '@angular/forms';
// // import { CustomerService } from '../services/customer.service';
// // @Component({
// //   selector: 'app-dashboard',
// //   standalone: true,
// //   imports: [
// //     CommonModule,
// //     FormsModule
// //   ],
// //   templateUrl: './dashboard.html'
// // })
// // export class Dashboard implements OnInit {

// //   showCustomerModal = false;

// //   stats = {
// //     totalOrders: 0,
// //     inProgress: 0,
// //     completed: 0,
// //     pending: 0,
// //     totalRevenue: 0
// //   };

// //   customers: any[] = [];

// //   recentCustomers: any[] = [];

// //   newCustomer = {
// //     name: '',
// //     phone: '',
// //     city: '',
// //     frameSize: '',
// //     frameType: '',
// //     quantity: 1,
// //     totalAmount: 0,
// //     orderStatus: 'Pending'
// //   };


// //   ngOnInit(): void {
// //     this.loadDashboard();
// //   }


// //   loadDashboard(): void {

// //     /*
// //      * For now this is sample data.
// //      * Later we can connect this to your
// //      * RaigonStorage/service.
// //      */

// //     this.customers = [
// //       {
// //         id: 'RA-1001',
// //         name: 'Arun Kumar',
// //         city: 'Adoor',
// //         phone: '9876543210',
// //         frameSize: '12 × 18',
// //         frameType: 'Wooden',
// //         quantity: 1,
// //         totalAmount: 2500,
// //         orderStatus: 'In Progress'
// //       },
// //       {
// //         id: 'RA-1002',
// //         name: 'Anu Thomas',
// //         city: 'Pathanamthitta',
// //         phone: '9876543211',
// //         frameSize: '10 × 15',
// //         frameType: 'Classic',
// //         quantity: 2,
// //         totalAmount: 3200,
// //         orderStatus: 'Completed'
// //       }
// //     ];

// //     this.recentCustomers =
// //       this.customers.slice(0, 5);


// //     this.stats = {
// //       totalOrders: this.customers.length,
// //       inProgress: this.customers.filter(
// //         c => c.orderStatus === 'In Progress'
// //       ).length,

// //       completed: this.customers.filter(
// //         c => c.orderStatus === 'Completed'
// //       ).length,

// //       pending: this.customers.filter(
// //         c => c.orderStatus === 'Pending'
// //       ).length,

// //       totalRevenue: this.customers.reduce(
// //         (total, c) =>
// //           total + Number(c.totalAmount || 0),
// //         0
// //       )
// //     };
// //   }


// //   // ==============================
// //   // ADD CUSTOMER MODAL
// //   // ==============================

// //   openCustomerModal(): void {
// //     this.showCustomerModal = true;
// //   }


// //   closeCustomerModal(): void {
// //     this.showCustomerModal = false;
// //   }


// //   saveCustomer(): void {

// //     if (!this.newCustomer.name.trim()) {
// //       alert('Please enter customer name');
// //       return;
// //     }

// //     if (!this.newCustomer.phone.trim()) {
// //       alert('Please enter phone number');
// //       return;
// //     }


// //     const customer = {
// //       id: 'CUS' +
// //         String(this.customers.length + 1)
// //           .padStart(3, '0'),

// //       name: this.newCustomer.name,
// //       phone: this.newCustomer.phone,
// //       city: this.newCustomer.city,
// //       frameSize: this.newCustomer.frameSize,
// //       frameType: this.newCustomer.frameType,
// //       quantity: this.newCustomer.quantity,
// //       totalAmount: this.newCustomer.totalAmount,
// //       orderStatus: 'Pending'
// //     };


// //     this.customers.unshift(customer);

// //     this.recentCustomers =
// //       this.customers.slice(0, 5);


// //     this.loadStats();


// //     this.resetCustomerForm();

// //     this.closeCustomerModal();
// //   }


// //   resetCustomerForm(): void {

// //     this.newCustomer = {
// //       name: '',
// //       phone: '',
// //       city: '',
// //       frameSize: '',
// //       frameType: '',
// //       quantity: 1,
// //       totalAmount: 0,
// //       orderStatus: 'Pending'
// //     };

// //   }


// //   loadStats(): void {

// //     this.stats = {
// //       totalOrders: this.customers.length,

// //       inProgress: this.customers.filter(
// //         c => c.orderStatus === 'In Progress'
// //       ).length,

// //       completed: this.customers.filter(
// //         c => c.orderStatus === 'Completed'
// //       ).length,

// //       pending: this.customers.filter(
// //         c => c.orderStatus === 'Pending'
// //       ).length,

// //       totalRevenue: this.customers.reduce(
// //         (total, c) =>
// //           total + Number(c.totalAmount || 0),
// //         0
// //       )
// //     };

// //   }


// //   // ==============================
// //   // STATUS BADGE
// //   // ==============================

// //   getStatusBadgeClass(status: string): string {

// //     switch (status) {

// //       case 'In Progress':
// //         return 'badge-in-progress';

// //       case 'Completed':
// //         return 'badge-completed';

// //       case 'Delivered':
// //         return 'badge-delivered';

// //       case 'Cancelled':
// //         return 'badge-cancelled';

// //       default:
// //         return 'badge-pending';

// //     }

// //   }


// //   // ==============================
// //   // CUSTOMER ACTIONS
// //   // ==============================

// //   viewCustomer(id: string): void {
// //     console.log('View customer:', id);
// //   }


// //   editCustomer(id: string): void {
// //     console.log('Edit customer:', id);
// //   }


// //   viewAllCustomers(): void {
// //     console.log('Navigate to customers');
// //   }
// // toggleThemeMode(): void {
// //   document.body.classList.toggle('dark-mode');
// // }

// // toggleNotifications(event: Event): void {
// //   event.stopPropagation();

// //   // Add your existing notification logic here
// // }

// // goToSettings(): void {
// //   // Dashboard cannot directly change Layout.currentView.
// //   // We will connect this through an EventEmitter if needed.
// // }
// // }


// import { Component, OnDestroy, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { Subscription } from 'rxjs';

// import {
//   Customer,
//   CustomerService
// } from '../services/customer.service';

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule
//   ],
//   templateUrl: './dashboard.html'
// })
// export class Dashboard implements OnInit, OnDestroy {

//   stats = {
//     totalOrders: 0,
//     inProgress: 0,
//     completed: 0,
//     pending: 0,
//     totalRevenue: 0
//   };

//   customers: Customer[] = [];

//   recentCustomers: Customer[] = [];

//   private subscription =
//     new Subscription();

//   constructor(
//     private customerService: CustomerService
//   ) {}

//   ngOnInit(): void {

//     this.subscription.add(

//       this.customerService.customers$
//         .subscribe(customers => {

//           this.customers = customers;

//           this.recentCustomers =
//             customers.slice(-5).reverse();

//           this.loadStats();

//         })

//     );

//   }

//   // =========================================
//   // OPEN SHARED ADD CUSTOMER MODAL
//   // =========================================

//   openCustomerModal(): void {

//     this.customerService
//       .openAddCustomerModal();

//   }

//   // =========================================
//   // DASHBOARD STATS
//   // =========================================

//   loadStats(): void {

//     this.stats = {

//       totalOrders:
//         this.customers.length,

//       inProgress:
//         this.customers.filter(
//           c => c.orderStatus === 'In Progress'
//         ).length,

//       completed:
//         this.customers.filter(
//           c => c.orderStatus === 'Completed'
//         ).length,

//       pending:
//         this.customers.filter(
//           c => c.orderStatus === 'Pending'
//         ).length,

//       totalRevenue:
//         this.customers.reduce(
//           (total, c) =>
//             total + Number(c.totalAmount || 0),
//           0
//         )

//     };

//   }

//   // =========================================
//   // STATUS BADGE
//   // =========================================

//   getStatusBadgeClass(
//     status: string
//   ): string {

//     switch (status) {

//       case 'In Progress':
//         return 'badge-in-progress';

//       case 'Completed':
//         return 'badge-completed';

//       case 'Delivered':
//         return 'badge-delivered';

//       case 'Cancelled':
//         return 'badge-cancelled';

//       default:
//         return 'badge-pending';

//     }

//   }

//   // =========================================
//   // CUSTOMER ACTIONS
//   // =========================================

//   viewCustomer(id: string): void {

//     console.log(
//       'View customer:',
//       id
//     );

//   }

//   editCustomer(id: string): void {

//     console.log(
//       'Edit customer:',
//       id
//     );

//   }

//   viewAllCustomers(): void {

//     console.log(
//       'Navigate to customers'
//     );

//   }

//   toggleThemeMode(): void {

//     document.body.classList.toggle(
//       'dark-mode'
//     );

//   }

//   toggleNotifications(
//     event: Event
//   ): void {

//     event.stopPropagation();

//   }

//   goToSettings(): void {

//   }

//   ngOnDestroy(): void {

//     this.subscription.unsubscribe();

//   }

// }


import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    FormsModule
  ],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit, OnDestroy {

  // =========================================
  // CUSTOMER MODAL
  // =========================================

  showCustomerModal = false;

  newCustomer = {

    name: '',

    phone: '',

    city: '',

    frameSize: '',

    frameType: '',

    quantity: 1,

    totalAmount: 0,

    orderStatus: 'Pending'

  };

  // =========================================
  // DASHBOARD STATS
  // =========================================

  stats = {

    totalOrders: 0,

    inProgress: 0,

    completed: 0,

    pending: 0,

    totalRevenue: 0

  };

  // =========================================
  // CUSTOMERS
  // =========================================

  customers: Customer[] = [];

  recentCustomers: Customer[] = [];

  private subscription =
    new Subscription();

  constructor(
    private customerService: CustomerService
  ) {}

  // =========================================
  // INIT
  // =========================================

  ngOnInit(): void {

    this.subscription.add(

      this.customerService.customers$
        .subscribe(customers => {

          this.customers =
            customers;

          this.recentCustomers =
            customers
              .slice(-5)
              .reverse();

          this.loadStats();

        })

    );

  }

  // =========================================
  // OPEN CUSTOMER MODAL
  // =========================================

  openCustomerModal(): void {

    this.showCustomerModal = true;

  }

  // =========================================
  // CLOSE CUSTOMER MODAL
  // =========================================

  closeCustomerModal(): void {

    this.showCustomerModal = false;

  }

  // =========================================
  // SAVE CUSTOMER
  // =========================================

  saveCustomer(): void {

    // -----------------------------------------
    // Name validation
    // -----------------------------------------

    if (!this.newCustomer.name.trim()) {

      alert(
        'Please enter customer name'
      );

      return;

    }

    if (
      !/^[A-Za-z\s]+$/.test(
        this.newCustomer.name.trim()
      )
    ) {

      alert(
        'Customer name can contain letters and spaces only'
      );

      return;

    }

    // -----------------------------------------
    // Phone validation
    // -----------------------------------------

    if (
      !/^\d{10}$/.test(
        this.newCustomer.phone.trim()
      )
    ) {

      alert(
        'Phone number must contain exactly 10 digits'
      );

      return;

    }

    // -----------------------------------------
    // Generate unique ID
    // -----------------------------------------

    const customerId =
      this.generateCustomerId();

    // -----------------------------------------
    // Amount
    // -----------------------------------------

    const totalAmount =
      Number(
        this.newCustomer.totalAmount
      ) || 0;

    // -----------------------------------------
    // Create customer
    // -----------------------------------------

    const customer: Customer = {

      id:
        customerId,

      name:
        this.newCustomer.name.trim(),

      phone:
        this.newCustomer.phone.trim(),

      alternativePhone:
        '',

      city:
        this.newCustomer.city.trim(),

      address:
        '',

      pincode:
        '',

      frameSize:
        this.newCustomer.frameSize,

      frameType:
        this.newCustomer.frameType,

      frameMaterial:
        '',

      frameColor:
        '',

      unit:
        'inch',

      orientation:
        'Landscape',

      quantity:
        Number(
          this.newCustomer.quantity
        ) || 1,

      totalAmount:
        totalAmount,

      advancePaid:
        0,

      balanceAmount:
        totalAmount,

      paymentStatus:
        'Pending',

      orderStatus:
        'Pending',

      orderDate:
        this.getToday(),

      deliveryDate:
        '',

      notes:
        '',

      photos:
        []

    };

    // -----------------------------------------
    // Add to shared service
    // -----------------------------------------

    this.customerService.addCustomer(
      customer
    );

    // -----------------------------------------
    // Reset form
    // -----------------------------------------

    this.resetCustomerForm();

    // -----------------------------------------
    // Close modal
    // -----------------------------------------

    this.closeCustomerModal();

  }

  // =========================================
  // RESET CUSTOMER FORM
  // =========================================

  resetCustomerForm(): void {

    this.newCustomer = {

      name: '',

      phone: '',

      city: '',

      frameSize: '',

      frameType: '',

      quantity: 1,

      totalAmount: 0,

      orderStatus: 'Pending'

    };

  }

  // =========================================
  // GENERATE CUSTOMER ID
  // =========================================

  private generateCustomerId(): string {

    const customers =
      this.customerService.getCustomers();

    let number =
      customers.length + 1;

    let id =
      `ORD-${String(number).padStart(3, '0')}`;

    while (
      customers.some(
        customer => customer.id === id
      )
    ) {

      number++;

      id =
        `ORD-${String(number).padStart(3, '0')}`;

    }

    return id;

  }

  // =========================================
  // TODAY
  // =========================================

  private getToday(): string {

    return new Date()
      .toISOString()
      .split('T')[0];

  }

  // =========================================
  // DASHBOARD STATS
  // =========================================

  loadStats(): void {

    this.stats = {

      totalOrders:
        this.customers.length,

      inProgress:
        this.customers.filter(
          c =>
            c.orderStatus ===
            'In Progress'
        ).length,

      completed:
        this.customers.filter(
          c =>
            c.orderStatus ===
            'Completed'
        ).length,

      pending:
        this.customers.filter(
          c =>
            c.orderStatus ===
            'Pending'
        ).length,

      totalRevenue:
        this.customers.reduce(
          (total, c) =>
            total +
            Number(
              c.totalAmount || 0
            ),
          0
        )

    };

  }

  // =========================================
  // STATUS BADGE
  // =========================================

  getStatusBadgeClass(
    status: string
  ): string {

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

  // =========================================
  // CUSTOMER ACTIONS
  // =========================================

  viewCustomer(id: string): void {

    console.log(
      'View customer:',
      id
    );

  }

  editCustomer(id: string): void {

    console.log(
      'Edit customer:',
      id
    );

  }

  viewAllCustomers(): void {

    console.log(
      'Navigate to customers'
    );

  }

  // =========================================
  // THEME
  // =========================================

  toggleThemeMode(): void {

    document.body.classList.toggle(
      'dark-mode'
    );

  }

  // =========================================
  // NOTIFICATIONS
  // =========================================

  toggleNotifications(
    event: Event
  ): void {

    event.stopPropagation();

  }

  // =========================================
  // SETTINGS
  // =========================================

  goToSettings(): void {

    // Existing dashboard behavior preserved.

  }

  // =========================================
  // DESTROY
  // =========================================

  ngOnDestroy(): void {

    this.subscription.unsubscribe();

  }

}