import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { appRoutes } from '../../ganymede.app.ui';
import { ResourceGuard } from './ganymede/components/services/resource-guard';

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
  providers: [ResourceGuard]
})
export class AppRoutingModule { }
