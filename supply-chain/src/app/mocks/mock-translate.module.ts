/*
 * Copyright 2019 VMware, all rights reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */

import { Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

@Pipe({name: 'translate'})
export class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

@Injectable()
export class MockTranslateService  {
  getBrowserLang() {}
  setDefaultLang() {}
  use() {}
  get(value) { return of(value); }
  instant(value) { return value; }
}

@NgModule({
  providers: [{provide: TranslateService, useClass: MockTranslateService}],
  declarations: [MockTranslatePipe],
  exports: [MockTranslatePipe]
})
export class MockTranslateModule {}

