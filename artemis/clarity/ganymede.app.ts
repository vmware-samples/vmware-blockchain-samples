import { GanymedeAppData } from './src/app/ganymede/components/ganymede.app.interface';
const ganymedeConfJson = require('./ganymede.conf.json');

export const ganymedeAppData = new GanymedeAppData({
  name: 'Digital Art NFT',

  lang: 'en',
  langList: ['en'],

  template: {
    header: {
      nav: [
        // { path: 'dashboard', name: 'Dashboard' },
        { path: 'explorer', name: 'Network Explorer' },
        { path: 'digital-arts', name: 'Digital Arts' },
        { path: 'mockups', name: 'Tests & Mockups' },
        { path: 'utils', name: 'Utils' },
        { path: 'docs', name: 'Documentation' },
      ],
      alwaysOn: false,
    }
  },

  features: {

  },

  conf: ganymedeConfJson,
});

const isNodeJs = (typeof process !== 'undefined') && (process?.release?.name === 'node');
if (!isNodeJs) {
  Object.defineProperty(window, 'ganymedeAppData', { get: () => ganymedeAppData });
}
