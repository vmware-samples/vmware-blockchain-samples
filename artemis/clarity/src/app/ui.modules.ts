/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Class } from '@jovian/type-tools';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CdsModule } from '@cds/angular';
import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSplitModule } from 'angular-split';
import { GanymedeDefaultDirectivesModule } from './ganymede/components/directives/default.directives.module';

export const ganyBaseModulesImport: any[] = [
  CommonModule,
  FormsModule,
  RouterModule,
  CdsModule,
  ClarityModule,
  AngularSplitModule,
  TranslateModule.forChild(),
  GanymedeDefaultDirectivesModule,
];

export interface ModulesRegistrationData {
  name: string;
  folder: string;
  file: string;
  namespace: string;
  mounted: string;
  group: string;
  attributes: string[];
}

export class Modules {
  static byName: {[typename: string]: { type: Class<any>; getData?: () => ModulesRegistrationData }} = {};
  static register<T>(type: Class<T>, getData?: () => ModulesRegistrationData) {
    if (Modules.byName[type.name]) { return; }
    const registration = Modules.byName[type.name] = { type, getData };
    return registration;
  }
}
