/*
 * Copyright 2019 VMware, all rights reserved.
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

