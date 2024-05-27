/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../configurations/configuration.local-with-dev-backend';
import {LocationStub} from '../../../../test/stubs/location.stub';
import {RouterStub} from '../../../../test/stubs/router.stub';
import {AUTH_ROUTE_PATHS} from '../../../auth/auth-routing/auth-routes.paths';
import {Base64Helper} from '../../misc/helpers/base64.helper';
import {EnvironmentHelper} from '../../misc/helpers/environment.helper';
import {LOCATION_TOKEN} from '../../misc/injection-tokens/location';
import {AuthService} from './auth.service';

describe('Auth Service', () => {
    let authService: AuthService;
    let router: Router;
    let location: Location;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const environmentHelperMock: EnvironmentHelper = mock(EnvironmentHelper);
    const base64HelperMock: Base64Helper = mock(Base64Helper);

    const requestedPath = 'foo/bar/123';
    const authUrl = `/${AUTH_ROUTE_PATHS.authentication}`;
    const baseUrl = `${configuration.apiAuth}`;
    const loginUrl = `${baseUrl}/login`;
    const logoutUrl = `${baseUrl}/logout`;
    const signupUrl = `${baseUrl}/signup`;
    const changePasswordUrl = `${baseUrl}/change-password`;
    const verifyUrl = `${baseUrl}/login/verify`;

    const moduleDef: TestModuleMetadata = {
        imports: [
            HttpClientTestingModule,
            RouterTestingModule,
        ],
        providers: [
            {
                provide: Base64Helper,
                useFactory: () => instance(base64HelperMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: LOCATION_TOKEN,
                useClass: LocationStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(environmentHelperMock.isProduction()).thenReturn(true);

        authService = TestBed.inject(AuthService);
        router = TestBed.inject(Router);
        location = TestBed.inject(LOCATION_TOKEN);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should redirect to login endpoint', () => {
        const base64RedirectUrl = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwZm9vL2Jhci8xMjM';
        const expectedLoginUrl = loginUrl + `?redirect_url=${base64RedirectUrl}`;

        when(base64HelperMock.encodeBase64Url(location.origin + requestedPath)).thenReturn(base64RedirectUrl);

        authService.saveRequestedPathAndRedirect(requestedPath);
        authService.login();

        expect(location.href).toBe(expectedLoginUrl);
    });

    it('should redirect to logout endpoint', () => {
        const base64RedirectUrl = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwZm9vL2Jhci8xMjM';
        const expectedLogoutUrl = logoutUrl + `?redirect_url=${base64RedirectUrl}`;

        when(base64HelperMock.encodeBase64Url(location.origin)).thenReturn(base64RedirectUrl);

        authService.logout();

        expect(location.href).toBe(expectedLogoutUrl);
    });

    it('should redirect to signup endpoint', () => {
        const base64RedirectUrl = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwZm9vL2Jhci8xMjM';
        const expectedSignupUrl = signupUrl + `?redirect_url=${base64RedirectUrl}`;

        when(base64HelperMock.encodeBase64Url(location.origin + '/auth/signup')).thenReturn(base64RedirectUrl);

        authService.signup();

        expect(location.href).toBe(expectedSignupUrl);
    });

    it('should redirect to change password endpoint', () => {
        const base64RedirectUrl = 'aHR0cDovL2xvY2FsaG9zdDo4MDAwZm9vL2Jhci8xMjM';
        const expectedChangePasswordUrl = changePasswordUrl + `?redirect_url=${base64RedirectUrl}`;

        when(base64HelperMock.encodeBase64Url(location.href)).thenReturn(base64RedirectUrl);

        authService.changePassword();

        expect(location.href).toBe(expectedChangePasswordUrl);
    });

    it('should return TRUE when isAuthenticated is called with a valid session', waitForAsync(() => {
        authService.isAuthenticated().subscribe(isAuthenticated => expect(isAuthenticated).toBeTruthy());

        request = httpMock.expectOne(verifyUrl);
        request.flush(true);
    }));

    it('should return FALSE when isAuthenticated is called without a valid session', waitForAsync(() => {
        authService.isAuthenticated().subscribe(isAuthenticated => expect(isAuthenticated).toBeFalsy());

        request = httpMock.expectOne(verifyUrl);
        request.flush(false);
    }));

    it('should return FALSE when isAuthenticated is called and request fails', waitForAsync(() => {
        authService.isAuthenticated().subscribe(isAuthenticated => expect(isAuthenticated).toBeFalsy());

        request = httpMock.expectOne(verifyUrl);
        request.error(new ErrorEvent('error'));
    }));

    it('should navigate to auth page', () => {
        spyOn(router, 'navigate');

        authService.saveRequestedPathAndRedirect(requestedPath);

        expect(router.navigate).toHaveBeenCalledWith([authUrl]);
    });
});
