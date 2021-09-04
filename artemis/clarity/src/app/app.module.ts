import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy } from '@angular/router';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { AppRoutingModule } from './app-routing.module';
import { RequestInterceptor } from './http.wrapper';

import { ClarityModule } from '@clr/angular';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { miscWarningsSuppression } from './ganymede/misc/warning.suppress';
import { GanymedeCoreModule } from './ganymede/components/ganymede.core.module';

import { ganymedeLicenseCallbacks } from './ganymede/ganymede.license';
import { PreInitUtils } from './ganymede/components/util/preinit.util';
import { RouteReuser } from './ganymede/components/services/route-reuser';
import { ganymedeAppData } from '../../ganymede.app';
import { ngrxStores, ngrxEffectClasses, otherModules, otherDeclarations, otherProviders } from '../../ganymede.app.ui';

import { UserRoutesModule } from './routes/routes.module';
import { UserCustomAppModule } from './main/main.module';

import { AppComponent } from './ganymede/components/templates/default/template.module';
import { MessageCenter } from './ganymede/components/util/message.center';

const notFoundValue = Promise.resolve();
const translateBasePath = 'assets/i18n/';

export function preInitFactory() {
  return () => new Promise<any>(async resolve => {
    if (ganymedeAppData.features.preinit) {
      await PreInitUtils.entrypoint();
    }
    resolve(true);
  });
}

export function langInitFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>(resolve => {
    injector.get(LOCATION_INITIALIZED, notFoundValue).then(() => {
      try {
        const defaultLanguage = 'en';
        translate.use(defaultLanguage).subscribe(() => { resolve(true); });
      } catch (e) {
        // tslint:disable-next-line: no-console
        console.error(e);
      }
    });
  });
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    StoreModule.forRoot(ngrxStores),
    EffectsModule.forRoot(ngrxEffectClasses),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: http => new TranslateHttpLoader(http, translateBasePath, '.json'),
        deps: [HttpClient]
      }
    }),
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
          provide: MarkedOptions,
          useValue: {
                  gfm: true,
                  tables: true,
                  breaks: false,
                  pedantic: false,
                  sanitize: false,
                  smartLists: true,
                  smartypants: false,
                  highlight: true
              },
          },
    }),
    GanymedeCoreModule,

    UserRoutesModule,
    UserCustomAppModule,

  ].concat(otherModules),
  declarations: [

  ].concat(otherDeclarations),
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: preInitFactory,
      deps: [],
      multi: true
    }, {
      provide: APP_INITIALIZER,
      useFactory: langInitFactory,
      deps: [TranslateService, Injector],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    }, {
      provide: RouteReuseStrategy,
      useClass: RouteReuser
    },
    TranslateService,
    MarkedOptions,
  ].concat(otherProviders),
  bootstrap: [AppComponent]
})
export class AppModule { }

ganymedeLicenseCallbacks.push((valid, license) => {
  if (!valid) {
    const msg = `Ganymede license is not valid; registration="${license.org}|${license.user}|${license.domain}|${license.scope}"\n`
                + `Registration License Signature: ${license.key}`;
    MessageCenter.addWarning(msg);
  }
});
