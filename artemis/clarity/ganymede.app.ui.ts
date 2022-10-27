import { ganymedeAppData } from './ganymede.app';
import { HttpWrap } from './src/app/ganymede/components/util/common/http.wrapper';
import { rx } from './src/app/ganymede/components/util/common/ngrx.stores';
import { BasicContentsComponent } from './src/app/ganymede/components/pages/basic-contents/basic-contents.component';
import { DigitalArtsComponent } from 'src/app/routes/digital-arts/digital-arts.component';
import { LandingComponent } from 'src/app/routes/landing/landing.component';
import { MockSettingsComponent } from 'src/app/routes/mock-settings/mock-settings.component';
import { DigitalArtsDetailsComponent } from 'src/app/routes/digital-arts/digital-arts-details/digital-arts-details.component';
import { UtilsComponent } from 'src/app/routes/utils/utils.component';

ganymedeAppData.routes = [
  { path: '', component: LandingComponent, data: { templateData: { layout: 'full' } }, },
  { path: 'digital-arts', component: DigitalArtsComponent, data: { reuse: true, templateData: { layout: 'full' } }, },
  { path: 'digital-arts/:nftId', component: DigitalArtsDetailsComponent, data: { reuse: true, templateData: { layout: 'full' } }, },
  { path: 'mockups', component: MockSettingsComponent, data: { reuse: true, templateData: { layout: 'full' } }, },
  { path: 'utils', component: UtilsComponent, data: { reuse: true, templateData: { layout: 'full' } }, },
  ...BasicContentsComponent.asRoute('docs', {
    reuse: true, // save route components? (preventing from Angular component destroy at navigating away)
    pathOverwrite: [ { from: '/docs', to: '/docs/about' } ],
    templateData: { layout: 'full', scrollbar: 'hide' },
    pageData: {
      type: 'basic-contents',
      children:  [
        { name: 'About NFT Project', path: 'about' },
        { name: 'Getting Started', path: 'intro', children: [
          { name: 'Setting up ETHRPC', path: 'setup-ethrpc' },
          { name: 'Installing Metamask', path: 'setup-metamask' },
        ]},
        { name: 'Advanced', path: 'gany-cli', children: [
          { name: 'Erasing Metamask Tx Cache', path: 'meta-purge' },
        ]},
      ]
    }
  }),
  { path: '**', component: BasicContentsComponent, data: { templateData: { layout: 'full' } }, }
];


export const appRoutes = ganymedeAppData.routes;

export const ngrxStores = rx.NgrxStoreRoot.getStores({

});

export const ngrxEffectClasses = rx.NgrxStoreRoot.getEffectClasses([

]);

export const otherModules = [

];

export const otherDeclarations = [

];

export const otherProviders = [

];

export const otherClarityIcons = [

];

HttpWrap.loadInitialIntercepts(http => {

});
