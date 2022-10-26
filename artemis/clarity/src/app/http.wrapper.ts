/*
 * Copyright 2018-2019 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent,
        HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpWrap } from './ganymede/components/util/common/http.wrapper';

declare var window: any;

// See more info on
// https://www.digitalocean.com/community/tutorials/how-to-use-angular-interceptors-to-manage-http-requests-and-error-handling
@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {

    if (window.baseHref && window.baseHref !== '/') {
      if (!req.url.startsWith('http://') && !req.url.startsWith('https://')) {
        const trimmedUrl = req.url.startsWith('/') ? req.url.slice(1) : req.url;
        const trimmedBaseHref = window.baseHref.endsWith('/') ? window.baseHref.slice(0, -1) : window.baseHref;
        const newUrl = `${trimmedBaseHref}/${trimmedUrl}`;
        req = req.clone({ url: newUrl });
      }
    }
    
    if (HttpWrap.verbose) {
      console.log(`checking request should be intercepted: ${req.url}`);
    }
    const interceptor = HttpWrap.match(req);
    if (interceptor) {
      if (HttpWrap.verbose) {
        console.log(`request is eligible: ${req.url}`);
      }
      if (!interceptor.requestIntercept) { interceptor.requestIntercept = async () => null; }
      if (!interceptor.responseIntercept) { interceptor.responseIntercept = async () => null; }
      return new Observable<HttpEvent<any>>(observer => {
        Promise.resolve(interceptor.requestIntercept(req, HttpWrap) as any).then(async newReq => {
          if (newReq?.directResponse) {
            const res = await Promise.resolve(newReq?.directResponse);
            if (HttpWrap.verbose) {
              console.log(`intercepted request: ${req.url}`, res);
            }
            return observer.next(res);
          }
          req = newReq ? newReq : req;
          httpHandler.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
              return of(new HttpResponse({
                headers: error.headers,
                url: error.url,
                status: error.status,
                statusText: error.statusText,
                body: error.message,
              }));
            }),
            map((res: HttpResponse<any>, type: number) => {
              if (type === 0) {
                observer.next(res);
              } else {
                Promise.resolve(interceptor.responseIntercept(res, HttpWrap) as any).then(async newRes => {
                  res = newRes ? newRes : res;
                  observer.next(res);
                  HttpWrap.release(interceptor);
                });
              }
            })
          ).toPromise();
        });
      });
    } else {
      return httpHandler.handle(req);
    }
  }
}

// HttpRequest example
// new HttpRequest<any>(req.method, newUrl, req.body, {
//   headers: req.headers,
//   context: req.context,
//   params: req.params,
//   withCredentials: req.withCredentials,
//   reportProgress: req.reportProgress,
//   responseType: req.responseType,
// })
