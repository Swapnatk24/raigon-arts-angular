import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './dashboard/dashboard';
import { Customers } from './customers/customers';
import { Orders } from './orders/orders';
import { Photos } from './photos/photos';
import { Frames } from './frames/frames';
import { Reports } from './reports/reports';
import { Settings } from './settings/settings';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: Login
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
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
      },
      {
        path: 'photos',
        component: Photos
      },
      {
        path: 'frames',
        component: Frames
      },
      {
        path: 'reports',
        component: Reports
      },
      {
        path: 'settings',
        component: Settings
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];