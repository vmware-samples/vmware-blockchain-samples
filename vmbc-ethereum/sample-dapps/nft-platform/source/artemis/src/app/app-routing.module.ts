import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DigitalArtsDetailsComponent } from './routes/digital-arts/digital-arts-details/digital-arts-details.component';
import { DigitalArtsComponent } from './routes/digital-arts/digital-arts.component';

const routes: Routes = [
  {
    path: "digital-arts",
    component: DigitalArtsComponent
  },
  {
    path: "digital-arts/:nftId",
    component: DigitalArtsDetailsComponent
  },
  { path: '', redirectTo: '/digital-arts', pathMatch: 'full' },
  { path: '*', redirectTo: '/digital-arts', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
