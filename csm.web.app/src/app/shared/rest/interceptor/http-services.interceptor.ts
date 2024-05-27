/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpHeaders,
    HttpInterceptor,
    HttpRequest,
} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    Observable,
    of,
    throwError
} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import {
    catchError,
    first,
    map,
    switchMap,
    take,
    tap
} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {MAINTENANCE_ROUTE} from '../../../app.routes';
import {AUTH_ROUTE_PATHS} from '../../../auth/auth-routing/auth-routes.paths';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AlertActions} from '../../alert/store/alert.actions';
import {AuthService} from '../../authentication/services/auth.service';
import {
    API_VERSION_REGEX,
    UUID_REGEX
} from '../../misc/constants/regular-expression.constant';
import {ApiUrlHelper} from '../helpers/api-url.helper';

export enum StatusCodeEnum {
    NotDefined = 0,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    RequestTimeout = 408,
    InternalServerError = 500,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

enum EndpointsRegexEnum {
    Announcements = '^announcements$',
    CurrentUser = '^users/current$',
    Jobs = '^jobs$',
    Projects = '^projects$',
    Milestones = `^projects/milestones/${UUID_REGEX}$`,
    Notifications = '^projects/notifications$',
    MessageAttachment = `^projects/tasks/topics/messages/attachments/${UUID_REGEX}/`,
    ProjectPicture = `^projects/${UUID_REGEX}/picture/${UUID_REGEX}/`,
    TaskAttachment = `^projects/tasks/attachments/${UUID_REGEX}/`,
    TaskSchedule = `^projects/tasks/${UUID_REGEX}/schedule$`,
    TopicAttachment = `^projects/tasks/topics/attachments/${UUID_REGEX}/`,
    UserPicture = `^users/${UUID_REGEX}/picture/${UUID_REGEX}/`,
}

class BlackListEntry {
    constructor(private statusCode: number, private endpoints: string[] = []) {
    }

    public match(status: number, url: string, baseUrl: string): boolean {
        const apiBaseUrl = new RegExp(`${baseUrl}/${API_VERSION_REGEX}/`);
        const path = url.split('?')[0].replace(apiBaseUrl, '');

        return status === this.statusCode && (this.endpoints.length === 0 || this.endpoints.some(regex => !!path.match(regex)));
    }
}

const ALERT_BLACKLISTED_STATUSES: BlackListEntry[] = [
    new BlackListEntry(StatusCodeEnum.NotDefined),
    new BlackListEntry(StatusCodeEnum.Unauthorized),
    new BlackListEntry(StatusCodeEnum.BadGateway),
    new BlackListEntry(StatusCodeEnum.NotFound, [
        EndpointsRegexEnum.CurrentUser,
        EndpointsRegexEnum.Announcements,
        EndpointsRegexEnum.MessageAttachment,
        EndpointsRegexEnum.ProjectPicture,
        EndpointsRegexEnum.TaskAttachment,
        EndpointsRegexEnum.TopicAttachment,
        EndpointsRegexEnum.UserPicture,
    ]),
    new BlackListEntry(StatusCodeEnum.Forbidden, [
        EndpointsRegexEnum.Jobs,
        EndpointsRegexEnum.Projects,
        EndpointsRegexEnum.Milestones,
        EndpointsRegexEnum.Notifications,
        EndpointsRegexEnum.TaskSchedule,
    ]),
];

const DOWN_SERVICE_ENDPOINTS: BlackListEntry[] = [
    new BlackListEntry(StatusCodeEnum.BadGateway, [EndpointsRegexEnum.CurrentUser]),
];

export const GENERIC_ERROR_STATUS_CODES: StatusCodeEnum[] = [
    StatusCodeEnum.RequestTimeout,
    StatusCodeEnum.InternalServerError,
    StatusCodeEnum.ServiceUnavailable,
    StatusCodeEnum.GatewayTimeout,
];

@Injectable({
    providedIn: 'root',
})
export class HttpServices implements HttpInterceptor {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper();

    private _baseApiUrl: string = this._apiUrlHelper.getApiUrl();

    constructor(private _authService: AuthService,
                private _router: Router,
                private _store: Store<State>,
                private _translationService: TranslateService) {
    }

    /**
     * @description Http Requests interceptor
     * @param {HttpRequest<any>} request
     * @param {HttpHandler} next
     * @returns {Observable<HttpEvent<any>>}
     */
    public intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const requestWithOptions = request.clone(this._getRequestOptions(request));

        return next
            .handle(requestWithOptions)
            .pipe(
                map((response: HttpEvent<any>) => response),
                catchError((response: HttpErrorResponse) => this._handleRequestError(request, response)),
            );
    }

    private _handleRequestError(request: HttpRequest<any>, response: HttpErrorResponse): Observable<never> {
        if (this._isUnauthorized(response)) {
            return this._authService.isAuthenticated().pipe(
                take(1),
                tap(isAuthenticated => {
                    if (isAuthenticated) {
                        this._authService.logout();
                    } else {
                        this._router.navigate([AUTH_ROUTE_PATHS.authentication]);
                    }
                }),
                switchMap(() => throwError(response)),
            );
        }

        if (this._isCriticalServiceDown(request, response)) {
            this._router.navigate([MAINTENANCE_ROUTE]);
        }

        if (this._canSendAlert(request, response)) {
            this._extractErrorMessage(response)
                .pipe(first())
                .subscribe(error => this._store.dispatch(new AlertActions.Add.ErrorAlert({message: error})));
        }

        return throwError(response);
    }

    /**
     * @description Retrieves current language
     * @returns {string}
     */
    private _getCurrentLanguage(): string {
        return this._translationService.defaultLang || 'en';
    }

    /**
     * @description Retrieves Request options headers / body / url..
     * @param {HttpRequest<any>} request
     * @returns {Object}
     */
    private _getRequestOptions(request: HttpRequest<any>): Object {
        const headers: HttpHeaders = this._setHeaders(request);
        const observe = 'response';
        const withCredentials = this._isAPIRequest(request);

        return {
            headers,
            observe,
            withCredentials,
        };
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

        if (!this._isAPIRequest(request)) {
            headers = headers
                .delete('Cache-Control', 'no-cache');
        }

        if (!(request.body instanceof FormData)) {
            headers = headers.append('Content-Type', 'application/json');
        }

        return headers;
    }

    private _extractErrorMessage(response: HttpErrorResponse): Observable<AlertMessageResource> {
        return this._processErrorResponse(response)
            .pipe(
                map(errorMessage =>
                    this._showGenericError(errorMessage)
                        ? new AlertMessageResource('Generic_ErrorServerProblem', null, null)
                        : new AlertMessageResource(null, null, errorMessage.error.message)),
                catchError(() => of(new AlertMessageResource('Generic_ErrorServerProblem', null, null)))
            );
    }

    private _showGenericError(error: HttpErrorResponse): boolean {
        return GENERIC_ERROR_STATUS_CODES.includes(error.status) || !error.error.message;
    }

    private _processErrorResponse(response: HttpErrorResponse): Observable<HttpErrorResponse> {
        const handler = (resolve, reject) => {
            if (response.error instanceof Blob && response.error.type === 'application/json') {
                const reader = new FileReader();
                const {headers, status, statusText, url} = response;
                reader.onload = (e: Event) => {
                    try {
                        const error = JSON.parse((e.target as any).result);
                        resolve(new HttpErrorResponse({error, headers, status, statusText, url}));
                    } catch (error) {
                        reject(response);
                    }
                };
                reader.onerror = () => reject(response);
                reader.readAsText(response.error);
            } else {
                resolve(response);
            }
        };
        return fromPromise(new Promise<HttpErrorResponse>(handler));
    }

    private _canSendAlert(request: HttpRequest<any>, response: HttpErrorResponse): boolean {
        return !ALERT_BLACKLISTED_STATUSES.some(entry => entry.match(response.status, request.url, this._baseApiUrl));
    }

    private _isUnauthorized(response: HttpErrorResponse): boolean {
        return response.status === StatusCodeEnum.Unauthorized;
    }

    private _isCriticalServiceDown(request: HttpRequest<any>, response: HttpErrorResponse): boolean {
        return DOWN_SERVICE_ENDPOINTS.some(entry => entry.match(response.status, request.url, this._baseApiUrl));
    }

    private _isAPIRequest(request: HttpRequest<any>): boolean {
        return this._apiUrlHelper.isApiUrl(request.url);
    }
}
