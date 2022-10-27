/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
const baseImgPath = '/assets/img';
const baseIcoPath = '/assets/ico';
const baseVidPath = '/assets/vid';

const self = new Function('return this')();
const isNodeJs = self.btoa === undefined;
const useDestor = true;
export interface GanymedeSecretsResolver {
  type: 'local-json-file' | 'source-from-destor';
  jsonFile?: string;
}

export class GanymedeAppData {
  name: string = 'Ganymede App';
  fullname = `Sample Ganymede App`;
  toptitle = ``;
  subtitle = ``;

  logo = `${baseIcoPath}/apple-icon.png`;

  icon = `${baseIcoPath}/apple-icon.png`;

  loginImage = `${baseImgPath}/s.jpg`;

  landingPath = `/`;
  landingVideo = ``;

  template;

  routes;

  lang = 'en';
  langList = ['en'];

  defaultUserContentsPath = '/assets/contents';

  features: GanymedeAppFeatures = {
    licenseFooter: { messageHTML: 'Powered by Ganymede' },
    // preinit: {},
    // serviceWorker: { enabled: true },
  };

  base: GanymedeAppBase = {};

  extensions: GanymedeAppExtensions = {};

  secretsResolution: GanymedeSecretsResolver = useDestor ? {
    type: 'source-from-destor',
  } : {
    type: 'local-json-file', jsonFile: 'ganymede.secrets.json'
  };

  logger: any = null;
  loggerSettings: GanymedeLoggerSettings;

  header = {
    alwaysOn: true, exceptRoutes: [],
    search: { enabled: false }
  };
  headerActions = [];

  footer = { alwaysOn: false, exceptRoutes: [] };
  footerActions = { left: [], middle: [], right: [] };

  requestIntercept: {
    type: string;
    initialize?: () => {};
  } = { type: 'simple' };

  conf: any; // ganymede.conf.json content

  theme = { base: 'CLARITY', type: 'LIGHT' };

  constructor(initializer?: Partial<GanymedeAppData>) {
    if (initializer) {
      const defaultFeatures = this.features;
      Object.assign(this, initializer);
      for (const featureName of Object.keys(defaultFeatures)) {
        if (!this.features[featureName]) {
          this.features[featureName] = defaultFeatures[featureName];
        }
      }
    }
  }
}

export interface GanymedeAppFeatures {
  preinit?: {
    lastIp?: string;
    versionInfo?: {
      accessIp?: string;
    }
  };
  licenseFooter?: {
    messageHTML?: string;
  };
  serviceWorker?: {
    enabled?: boolean;
  };
  geolocate?: {
    enabled?: boolean;
  };
}

export interface GanymedeAppBase {
  modules?: {
    auth?: {
      type: string;
      host?: string;
      port?: number;
    },
    mailer?: {
      type: string;
      data: any;
    },
  };
}

export interface GanymedeAppExtensions {
  native?: {
    infra?: {
      port: number;
      v8Profiling?: boolean;
      inventory: {
        aws?: { type?: string; list: any[]; };
        gcp?: { type?: string; list: any[]; };
        azure?: { type?: string; list: any[]; };
        vcenter?: { type?: string; list: any[]; };
      }
    }
  };
  external?: {

  };
}

export interface GanymedeLoggerSettings {
  formatter?: any;
}

export function getGanymedeAppData(): GanymedeAppData {
  if (!isNodeJs) { return self.ganymedeAppData as GanymedeAppData; }
}
