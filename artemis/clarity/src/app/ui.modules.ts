/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Class } from '@jovian/type-tools';

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
