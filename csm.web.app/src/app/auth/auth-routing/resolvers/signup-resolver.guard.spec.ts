/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    ActivatedRouteSnapshot,
    Router,
    RouterStateSnapshot
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {
    of,
    ReplaySubject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../test/mocks/store';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../test/mocks/user';
import {State} from '../../../app.reducers';
import {AuthService} from '../../../shared/authentication/services/auth.service';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {UserActions} from '../../../user/store/user/user.actions';
import {UserQueries} from '../../../user/store/user/user.queries';
import {SignupResolverGuard} from './signup-resolver.guard';

describe('Signup Resolver Guard', () => {
    let guard: SignupResolverGuard;
    let router: Router;
    let authService: AuthService;
    let store: Store<State>;
    let userQueries: UserQueries;
    let actions: ReplaySubject<any>;

    const authServiceMock: AuthService = mock(AuthService);

    const activatedRouteSnapshot: ActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const routerStateSnapshot: RouterStateSnapshot = {
        url: 'auth/signup',
    } as RouterStateSnapshot;

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            provideMockActions(() => actions),
            {
                provide: AuthService,
                useFactory: () => instance(authServiceMock),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(SignupResolverGuard);
        router = TestBed.inject(Router);
        authService = TestBed.inject(AuthService);
        store = TestBed.inject(Store);
        userQueries = TestBed.inject(UserQueries);
        actions = new ReplaySubject(1);

        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
    });

    it('should cancel navigation and redirect to login when not authenticated', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(false));
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(true);
        spyOn(authService, 'saveRequestedPathAndRedirect');
        actions.next(new UserActions.Request.CurrentFulfilled(TEST_USER_RESOURCE_REGISTERED));
        guard.canActivate(activatedRouteSnapshot, routerStateSnapshot).subscribe(result => {
            expect(result).toBeFalsy();
            expect(authService.saveRequestedPathAndRedirect).toHaveBeenCalled();
        });
    }));

    it('should cancel navigation when user is registered', waitForAsync(() => {
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(true);
        spyOn(router, 'navigate').and.callThrough();

        actions.next(new UserActions.Request.CurrentRejected());
        guard.canActivate(activatedRouteSnapshot, routerStateSnapshot).subscribe(result => {
            expect(result).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/']);
        });
    }));

    it('should allow navigation when user is unregistered', waitForAsync(() => {
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(false);
        spyOn(router, 'navigate').and.callThrough();

        actions.next(new UserActions.Request.CurrentFulfilled(TEST_USER_RESOURCE_REGISTERED));
        guard.canActivate(activatedRouteSnapshot, routerStateSnapshot).subscribe(result => {
            expect(result).toBeTruthy();
            expect(router.navigate).not.toHaveBeenCalled();
        });
    }));

    it('should request current user if request is not in progress', waitForAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.empty);

        const expectedAction = new UserActions.Request.Current();

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshot).subscribe(() => {
            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    }));

    it('should not request current user if request is in progress', waitForAsync(() => {
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);

        const expectedAction = new UserActions.Request.Current();

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshot).subscribe(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
        });
    }));
});
