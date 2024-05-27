/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {of} from 'rxjs';

import {configuration} from '../../../../configurations/configuration.local-with-dev-backend';
import {MockStore} from '../../../../test/mocks/store';
import {RouterStub} from '../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {State} from '../../../app.reducers';
import {MAINTENANCE_ROUTE} from '../../../app.routes';
import {AUTH_ROUTE_PATHS} from '../../../auth/auth-routing/auth-routes.paths';
import {AlertMessageResource} from '../../alert/api/resources/alert-message.resource';
import {AuthService} from '../../authentication/services/auth.service';
import {ApiUrlHelper} from '../helpers/api-url.helper';
import {RestModule} from '../rest.module';
import {GENERIC_ERROR_STATUS_CODES} from './http-services.interceptor';

describe('Http Services', () => {
    let httpClient: HttpClient;
    let httpMock: HttpTestingController;
    let request: TestRequest;
    let store: Store<State>;
    let router: Router;
    let translateService: TranslateService;
    let authService: jasmine.SpyObj<AuthService>;

    const baseUrl = configuration.api;
    const errorEvent = {message: 'message'} as ErrorEvent;

    const moduleDef: TestModuleMetadata = {
        imports: [
            HttpClientTestingModule,
            RestModule,
        ],
        providers: [
            HttpClient,
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: AuthService,
                useValue: jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        translateService = TestBed.inject(TranslateService);
        authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

        spyOn(ApiUrlHelper.prototype, 'getApiUrl').and.returnValue(baseUrl);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should intercept http request and set request body', () => {
        const url = 'foo';
        const payload = {};
        const body = {};

        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.body).toEqual(body);
        request.flush(payload);
    });

    it('should intercept http request and set Content-Type application/json header when submitting FormData', () => {
        const url = 'foo';
        const payload = {};
        const body = new FormData();

        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.headers.get('Content-Type')).not.toBe('application/json');
        request.flush(payload);
    });

    GENERIC_ERROR_STATUS_CODES.forEach(status => {
        it(`should intercept http request and return generic error alert when status code is ${status}`, fakeAsync(() => {
            spyOn(store, 'dispatch').and.callThrough();
            const url = 'foo';
            const genericErrorAlert: AlertMessageResource = new AlertMessageResource('Generic_ErrorServerProblem', null, null);

            httpClient.get<unknown>(url)
                .subscribe(() => {
                },
                (response: unknown) => {
                    expect(response).toEqual(response);
                });

            request = httpMock.expectOne(url);
            request.error(new ErrorEvent('error'), {status});
            tick(100);
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: genericErrorAlert}}));
        }));
    });

    it('should intercept http request and return custom error alert when backend provided error message', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = 'foo';
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request and return generic error when backend doesn\'t provide error message', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = 'foo';
        const errorEventWithoutMessage = {message: null} as ErrorEvent;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource('Generic_ErrorServerProblem', null, null);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEventWithoutMessage, {status: 404});
        tick(100);
        expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request with 401 status and navigate to login page when user is unauthenticated', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(router, 'navigate');
        authService.isAuthenticated.and.returnValue(of(false));
        const url = 'foo';

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 401});
        tick(100);
        expect(router.navigate).toHaveBeenCalledWith([AUTH_ROUTE_PATHS.authentication]);
    }));

    it('should intercept http request with 401 status and logout when user is authenticated', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        authService.isAuthenticated.and.returnValue(of(true));
        const url = 'foo';

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 401});
        tick(100);
        expect(authService.logout).toHaveBeenCalled();
    }));

    it('should intercept http request with 502 status, not show alert, and not navigate to maintenance page', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(router, 'navigate');
        const url = 'foo';
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 502});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
        expect(router.navigate).not.toHaveBeenCalledWith([MAINTENANCE_ROUTE]);
    }));

    it('should intercept http request with 502 status, and navigate to maintenance page', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(router, 'navigate');
        const url = `${baseUrl}/v1/users/current`;

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 502});
        tick(100);
        expect(router.navigate).toHaveBeenCalledWith([MAINTENANCE_ROUTE]);
    }));

    it('should intercept http request with 401 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = 'foo';
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 401});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request announcements with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/announcements`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request users/current with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/users/current`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request message attachment with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/projects/tasks/topics/messages/attachments/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request project picture with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/projects/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/picture/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request task attachment with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/projects/tasks/attachments/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request topic attachment with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/projects/tasks/topics/attachments/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request user picture with 404 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/users/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/picture/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 404});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request jobs with 403 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v1/jobs?page=0&size=100`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request projects with 403 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v2/projects`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request projects/foo with 403 status and show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v2/projects/foo`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http task schedule with 403 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v2/projects/tasks/f81d4fae-7dec-11d0-a765-00a0c91e6bf6/schedule`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request notifications with 403 status and not show alert', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = `${baseUrl}/v2/projects/notifications?limit=30`;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        httpClient.get<unknown>(url)
            .subscribe(() => {
            },
            (response: unknown) => {
                expect(response).toEqual(response);
            });

        request = httpMock.expectOne(url);
        request.error(errorEvent, {status: 403});
        tick(100);
        expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
    }));

    it('should intercept http request error and parse successfully Blob response to JSON if response type is application/json', (done) => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = 'foo';
        const message = 'foo';
        const error = new Blob([`{"message": "${message}"}` as BlobPart], {type: 'application/json'}) as unknown;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, message);

        httpClient.get(url, {responseType: 'blob', observe: 'response'})
            .subscribe(() => {
            },
            (response: unknown) => expect(response).toEqual(response));

        request = httpMock.expectOne(url);
        request.error(error as ErrorEvent, {status: 404});
        setTimeout(() => {
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
            done();
        }, 100);
    });

    it('should intercept http request error and parse unsuccessfully Blob response to JSON ' +
        'if response type is application/json', (done) => {
        spyOn(store, 'dispatch').and.callThrough();
        const url = 'foo';
        const error = new Blob([`{"message": 'error'}` as BlobPart], {type: 'application/json'}) as unknown;
        const customErrorAlert: AlertMessageResource = new AlertMessageResource('Generic_ErrorServerProblem', null, null);

        httpClient.get(url, {responseType: 'blob', observe: 'response'})
            .subscribe(() => {
            },
            (response: unknown) => expect(response).toEqual(response));

        request = httpMock.expectOne(url);
        request.error(error as ErrorEvent, {status: 500});
        setTimeout(() => {
            expect(store.dispatch).toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
            done();
        }, 100);
    });

    it('should set Credentials for api calls', () => {
        const url = `${baseUrl}/v2/projects`;
        const payload = {};
        const body = {};

        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.body).toEqual(body);
        expect(request.request.withCredentials).toBeTruthy();
        request.flush(payload);
    });

    it('should not set Credentials for non api calls', () => {
        const url = 'https://mybeautifulcdn.com/allthegoodstuff';
        const payload = {};
        const body = {};

        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.body).toEqual(body);
        expect(request.request.withCredentials).toBeFalsy();
        request.flush(payload);
    });

    it('should set Accept-Language header with the language of the app when it is available', () => {
        const url = 'foo';
        const payload = {};
        const body = {};
        const expectedLanguage = 'de';

        translateService.defaultLang = expectedLanguage;
        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.headers.get('Accept-Language')).toBe(expectedLanguage);
        request.flush(payload);
    });

    it('should set Accept-Language header with "en" when the language of the app is not available', () => {
        const url = 'foo';
        const payload = {};
        const body = {};
        const expectedLanguage = 'en';

        translateService.defaultLang = undefined;
        httpClient.post<unknown>(url, body)
            .subscribe((response: unknown) =>
                expect(response).toEqual(payload));

        request = httpMock.expectOne(url);
        expect(request.request.headers.get('Accept-Language')).toBe(expectedLanguage);
        request.flush(payload);
    });

    it('should intercept a back-listed http request and not show alert regardless of the api version', fakeAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        const urls = [
            `${baseUrl}/v1/projects/notifications?limit=30`,
            `${baseUrl}/v2/projects/notifications?limit=30`,
        ];
        const customErrorAlert: AlertMessageResource = new AlertMessageResource(null, null, errorEvent.message);

        urls.forEach(url => {
            httpClient.get<unknown>(url)
                .subscribe(() => {
                },
                (response: unknown) => {
                    expect(response).toEqual(response);
                });

            request = httpMock.expectOne(url);
            request.error(errorEvent, {status: 403});
            tick(100);
            expect(store.dispatch).not.toHaveBeenCalledWith(jasmine.objectContaining({payloadPart: {message: customErrorAlert}}));
        });
    }));
});
