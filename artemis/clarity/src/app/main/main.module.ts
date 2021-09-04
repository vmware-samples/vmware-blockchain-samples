import { Modules } from '../ui.modules';
import { NgModule } from '@angular/core';
import { GanymedeCoreModule } from '../ganymede/components/ganymede.core.module';

@NgModule({
  imports: [
    GanymedeCoreModule
  ],
  declarations: [
    // USER CUSTOM COMPONENTS DECLARATIONS START

    // USER CUSTOM COMPONENTS DECLARATIONS END
  ],
  exports: [
    // USER CUSTOM COMPONENTS EXPORT START

    // USER CUSTOM COMPONENTS EXPORT END
  ],
})
export class UserCustomAppModule {
  static registration = Modules.register(UserCustomAppModule, () => require('./main.module.json'));
}
