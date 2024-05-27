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
import {ActivatedRouteStub} from '../../../../test/stubs/activated-route.stub';
import {State} from '../../../app.reducers';
import {AuthService} from '../../../shared/authentication/services/auth.service';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {UserActions} from '../../../user/store/user/user.actions';
import {UserQueries} from '../../../user/store/user/user.queries';
import {AuthenticatedAndRegisteredGuard} from './authenticated-and-registered.guard';

describe('Authenticated And Registered Guard', () => {
    let guard: AuthenticatedAndRegisteredGuard;
    let store: Store<State>;
    let actions: ReplaySubject<any>;
    let userQueries: UserQueries;
    let authService: AuthService;
    let routerStateSnapshot: RouterStateSnapshot;

    const authServiceMock: AuthService = mock(AuthService);
    const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();
    const activatedRouteSnapshotMock: ActivatedRouteSnapshot = activatedRoute.snapshot as ActivatedRouteSnapshot;
    const routerStateSnapshotMock: RouterStateSnapshot = {
        url: 'url/here',
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
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(AuthenticatedAndRegisteredGuard);
        userQueries = TestBed.inject(UserQueries);
        authService = TestBed.inject(AuthService);
        actions = new ReplaySubject(1);
        store = TestBed.inject(Store);
        routerStateSnapshot = routerStateSnapshotMock;
    });

    it('should cancel navigation and redirect to login when not authenticated', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(false));
        spyOn(authService, 'saveRequestedPathAndRedirect');

        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(result => {
            expect(result).toBeFalsy();
            expect(authService.saveRequestedPathAndRedirect).toHaveBeenCalled();
        });
    }));

    it('should cancel navigation when user is unregistered', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(authService, 'saveRequestedPathAndRedirect');
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(false);

        actions.next(new UserActions.Request.CurrentRejected());
        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(result => {
            expect(result).toBeFalsy();
            expect(authService.saveRequestedPathAndRedirect).toHaveBeenCalled();
        });
    }));

    it('should allow navigation when user is registered', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(true);

        actions.next(new UserActions.Request.CurrentFulfilled(TEST_USER_RESOURCE_REGISTERED));
        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(result => {
            expect(result).toBeTruthy();
        });
    }));

    it('should request current user if request is not in progress and user was not loaded previously', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(false);
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.empty);

        const expectedAction = new UserActions.Request.Current();

        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(() => {
            expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
        });
    }));

    it('should not request current user if request is in progress', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(false);
        spyOn(userQueries, 'getCurrentUserRequestStatus').and.returnValue(RequestStatusEnum.progress);

        const expectedAction = new UserActions.Request.Current();

        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
        });
    }));

    it('should not request current user if was requested previously', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(store, 'dispatch').and.callThrough();
        spyOn(userQueries, 'isCurrentUserLoaded').and.returnValue(true);

        const expectedAction = new UserActions.Request.Current();

        guard.canActivate(activatedRouteSnapshotMock, routerStateSnapshot).subscribe(() => {
            expect(store.dispatch).not.toHaveBeenCalledWith(expectedAction);
        });
    }));
});
