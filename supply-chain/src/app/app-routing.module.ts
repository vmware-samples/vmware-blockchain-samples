/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OrderComponent } from './order/order.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './auth/auth.guard';
import { OrderResolver } from './order/shared/order-resolve.service';

const routes: Routes = [
  {
    path: 'orders',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':order_id',
        component: OrderComponent,
        resolve: {order: OrderResolver}
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    redirectTo: '/orders/none',
    pathMatch: 'prefix'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

