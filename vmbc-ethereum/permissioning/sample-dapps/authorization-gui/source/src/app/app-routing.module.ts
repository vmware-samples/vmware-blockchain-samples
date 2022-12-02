import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConfigurationsComponent } from './configurations/configurations.component';
import { DappComponent } from './dapp/dapp.component';

const routes: Routes = [
  
  {
    path: "configurations",
    component: ConfigurationsComponent
  },
  {
    path: "dapp",
    component: DappComponent
  },
  
  { path: '',   redirectTo: '/configurations', pathMatch: 'full' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes ,{ useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
