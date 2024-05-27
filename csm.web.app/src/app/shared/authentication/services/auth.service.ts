/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    Inject,
    Injectable
} from '@angular/core';
import {Router} from '@angular/router';
import {
    Observable,
    of
} from 'rxjs';
import {
    catchError,
    map
} from 'rxjs/operators';

import {AUTH_ROUTE_PATHS} from '../../../auth/auth-routing/auth-routes.paths';
import {Base64Helper} from '../../misc/helpers/base64.helper';
import {LOCATION_TOKEN} from '../../misc/injection-tokens/location';
import {ApiUrlBuilder} from '../../rest/helpers/api-url.builder';
import {ApiUrlHelper} from '../../rest/helpers/api-url.helper';

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    private _apiUrlHelper: ApiUrlHelper = new ApiUrlHelper();

    private _requestedPath = '';

    constructor(private _base64Helper: Base64Helper,
                private _httpClient: HttpClient,
                @Inject(LOCATION_TOKEN) private _location: Location,
                private _router: Router) {
    }

    /**
     * @description Redirects user to CIAM Login page
     */
    public login(): void {
        this._location.href = ApiUrlBuilder
            .withBasePath(this._apiUrlHelper.getAuthenticationUrl())
            .withPath('login')
            .withQueryParam('redirect_url', this._base64Helper.encodeBase64Url(this._location.origin + this._requestedPath))
            .build();
    }

    /**
     * @description Terminates current session
     */
    public logout(): void {
        this._location.href = ApiUrlBuilder
            .withBasePath(this._apiUrlHelper.getAuthenticationUrl())
            .withPath('logout')
            .withQueryParam('redirect_url', this._base64Helper.encodeBase64Url(this._location.origin))
            .build();
    }

    /**
     * @description Redirects user to CIAM Signup page
     */
    public signup(): void {
        const {authentication, signup} = AUTH_ROUTE_PATHS;

        this._location.href = ApiUrlBuilder
            .withBasePath(this._apiUrlHelper.getAuthenticationUrl())
            .withPath('signup')
            .withQueryParam('redirect_url', this._base64Helper.encodeBase64Url(`${this._location.origin}/${authentication}/${signup}`))
            .build();
    }

    /**
     * @description Redirects user to CIAM Change Password page
     */
    public changePassword(): void {
        this._location.href = ApiUrlBuilder
            .withBasePath(this._apiUrlHelper.getAuthenticationUrl())
            .withPath('change-password')
            .withQueryParam('redirect_url', this._base64Helper.encodeBase64Url(this._location.href))
            .build();
    }

    /**
     * @description Retrieves the status of authentication
     * @description Useful to make validations in guards or after unauthorized requests
     * @return Observable<boolean>
     */
    public isAuthenticated(): Observable<boolean> {
        const url = ApiUrlBuilder
            .withBasePath(this._apiUrlHelper.getAuthenticationUrl())
            .withPath('login/verify')
            .build();

        return this._httpClient.get<boolean>(url)
            .pipe(
                map(isAuthenticated => isAuthenticated),
                catchError(() => of(false)),
            );
    }

    /**
     * @description Saves the originally requested url and redirects to authentication page
     * @description Eg: To be used to save the initial requested url when user is not authenticated
     * @param url
     */
    public saveRequestedPathAndRedirect(url: string): void {
        this._requestedPath = url;
        this._router.navigate([`/${AUTH_ROUTE_PATHS.authentication}`]);
    }
}
