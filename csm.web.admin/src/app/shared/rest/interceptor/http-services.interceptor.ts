/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Router} from '@angular/router';
import {
    catchError,
    first,
    map
} from 'rxjs/operators';
import {
    Injectable,
    Injector
} from '@angular/core';
import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of,
    throwError
} from 'rxjs';

import {AUTH_ROUTE_PATHS} from '../../../auth/auth-routing/auth-routes.paths';
import {AlertActions} from '../../alert/store/alert.actions';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {State} from '../../../app.reducers';

enum StatusCodeEnum {
    Default = 0,
    Unauthorized = 401,
    InternalServerError = 500,
    GatewayTimeout = 504,
}

const GENERIC_ERROR_STATUS_CODES = [StatusCodeEnum.Default, StatusCodeEnum.InternalServerError, StatusCodeEnum.GatewayTimeout];

@Injectable({
    providedIn: 'root',
})
export class HttpServices implements HttpInterceptor {

    private _translationService: TranslateService;

    constructor(private _injector: Injector,
                private _router: Router,
                private _store: Store<State>) {
        // Workaround due to issue https://github.com/angular/angular/issues/18224
        setTimeout(() => this._translationService = this._injector.get(TranslateService));
    }

    /**
     * @description Http Requests interceptor
     * @param {HttpRequest<any>} request
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const requestWithOptions = request.clone(this._getRequestOptions(request));

        return next
            .handle(requestWithOptions)
            .pipe(
                map((response: HttpEvent<any>) => response),
                catchError((response: HttpErrorResponse) =>this._handleRequestError(response))
            );
    }

    private _handleRequestError(response: HttpErrorResponse): Observable<never> {
        if (this._isUnauthorized(response)) {
            this._router.navigate([AUTH_ROUTE_PATHS.authentication]);
        }

        this._extractErrorMessage(response)
            .pipe(first())
            .subscribe(error => this._store.dispatch(new AlertActions.Add.ErrorAlert({message: error})));

        return throwError(response);
    }

    /**
     * @description Retrieves current language
     * @returns {string}
     */
    private _getCurrentLanguage(): string {
        return this._translationService ? this._translationService.currentLang : 'en';
    }

    /**
     * @description Retrieves Request options headers / body / url..
     * @param {HttpRequest<any>} request
     * @returns {Object}
     */
    private _getRequestOptions(request: HttpRequest<any>): Object {
        const headers: HttpHeaders = this._setHeaders(request);
        const observe = 'response';
        const withCredentials = true;

        return {
            headers,
            observe,
            withCredentials,
        };
    }

    private _isUnauthorized(response: HttpErrorResponse): boolean {
        return response.status === StatusCodeEnum.Unauthorized;
    }

    /**
     * @description Set Request headers
     * @param {HttpRequest<any>} request
     * @returns {HttpHeaders}
     */
    private _setHeaders(request: HttpRequest<any>): HttpHeaders {
        let headers: HttpHeaders = Object.assign(new HttpHeaders(), request.headers)
            .append('Accept-Language', this._getCurrentLanguage())
            .append('Cache-Control', 'no-cache');

        if (!(request.body instanceof FormData)) {
            headers = headers.append('Content-Type', 'application/json');
        }

        return headers;
    }

    private _extractErrorMessage(response: HttpErrorResponse): Observable<AlertMessageResource> {
        return of(response)
            .pipe(
                map(errorMessage =>
                    (this._isGenericErrorResponse(errorMessage))
                        ? new AlertMessageResource('Generic_ErrorServerProblem', null, null)
                        : new AlertMessageResource(null, null, errorMessage.error.message)),
                catchError(() => of(new AlertMessageResource('Generic_ErrorServerProblem', null, null)))
            );
    }

    private _isGenericErrorResponse(errorMessage: HttpErrorResponse) {
        return GENERIC_ERROR_STATUS_CODES.includes(errorMessage.status) || !errorMessage?.error?.message;
    }
}
