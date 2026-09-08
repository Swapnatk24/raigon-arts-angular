import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { Customers } from './customers/customers';
import { Orders } from './orders/orders';

export const routes: Routes = [
  {
    path: '',
    component: Login
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'customers',
        component: Customers
      },
      {
        path: 'orders',
        component: Orders
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];