import { Modules } from '../ui.modules';
import { NgModule } from '@angular/core';
import { GanymedeCoreModule } from '../ganymede/components/ganymede.core.module';
import { BrowserModule } from '@angular/platform-browser';
import { LandingComponent } from './landing/landing.component';
import { DigitalArtsComponent } from './digital-arts/digital-arts.component';
import { ClarityModule } from '@clr/angular';
import { DigitalArtsGridComponent } from './digital-arts/digital-arts-grid/digital-arts-grid.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MockSettingsComponent } from './mock-settings/mock-settings.component';
import { DigitalArtsDetailsComponent } from './digital-arts/digital-arts-details/digital-arts-details.component';
import { UtilsComponent } from './utils/utils.component';
import { AccountGenComponent } from './utils/account-gen/account-gen.component';
import { GodAccountComponent } from './utils/god-account/god-account.component';


@NgModule({
  imports: [
    BrowserModule,
    ClarityModule,
    GanymedeCoreModule,
    ReactiveFormsModule,
  ],
  declarations: [
    // USER CUSTOM ROUTE COMPONENTS DECLARATIONS START

    // USER CUSTOM ROUTE COMPONENTS DECLARATIONS END
    LandingComponent,
    DigitalArtsComponent,
    DigitalArtsGridComponent,
    DigitalArtsDetailsComponent,
    MockSettingsComponent,
    UtilsComponent,
    AccountGenComponent,
    GodAccountComponent,
  ],
  exports: [
    // USER CUSTOM ROUTE COMPONENTS EXPORT START

    // USER CUSTOM ROUTE COMPONENTS EXPORT END
  ],
})
export class UserRoutesModule {
  static registration = Modules.register(UserRoutesModule, () => require('./routes.module.json'));
}
