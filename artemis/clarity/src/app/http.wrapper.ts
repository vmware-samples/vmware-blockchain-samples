/*
 * Copyright 2018-2019 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent,
        HttpInterceptor, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpWrap } from './ganymede/components/util/http.wrapper';

// See more info on
// https://www.digitalocean.com/community/tutorials/how-to-use-angular-interceptors-to-manage-http-requests-and-error-handling
@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(req: HttpRequest<any>, httpHandler: HttpHandler): Observable<HttpEvent<any>> {
    const interceptor = HttpWrap.match(req);
    if (interceptor) {
      if (!interceptor.requestIntercept) { interceptor.requestIntercept = async () => null; }
      if (!interceptor.responseIntercept) { interceptor.responseIntercept = async () => null; }
      return new Observable<HttpEvent<any>>(observer => {
        Promise.resolve(interceptor.requestIntercept(req, HttpWrap) as any).then(newReq => {
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
                Promise.resolve(interceptor.responseIntercept(res, HttpWrap) as any).then(newRes => {
                  res = newRes ? newRes : res;
                  observer.next(res);
                  HttpWrap
                  .release(interceptor);
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


