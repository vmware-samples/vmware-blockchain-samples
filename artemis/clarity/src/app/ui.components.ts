/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Class } from '@jovian/type-tools';

export interface ComponentRegistrationData {
  name: string;
  folder: string;
  file: string;
  namespace: string;
  mounted: string;
  group: string;
  selector: string;
  attributes: string[];
}

export class Components {
  static byName: {[typename: string]: { type: Class<any>; getData?: () => ComponentRegistrationData }} = {};
  static register<T>(type: Class<T>, getData?: () => ComponentRegistrationData) {
    if (Components.byName[type.name]) { return; }
    const registration = Components.byName[type.name] = { type, getData };
    return registration;
  }
}
