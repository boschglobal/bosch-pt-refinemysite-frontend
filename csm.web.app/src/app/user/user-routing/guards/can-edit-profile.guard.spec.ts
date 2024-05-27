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
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {ReplaySubject} from 'rxjs';

import {MockStore} from '../../../../test/mocks/store';
import {ActivatedRouteStub} from '../../../../test/stubs/activated-route.stub';
import {UserQueries} from '../../store/user/user.queries';
import {CanEditProfileGuard} from './can-edit-profile.guard';

describe('Can Edit Profile Guard', () => {
    let guard: CanEditProfileGuard;
    let router: Router;
    let actions: ReplaySubject<any>;
    let userQueries: UserQueries;
    const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();
    const activatedRouteSnapshotMock: ActivatedRouteSnapshot = activatedRoute.snapshot as ActivatedRouteSnapshot;

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            provideMockActions(() => actions),
            {
                provide: Store,
                useValue: new MockStore({})
            },
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate'])
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(CanEditProfileGuard);
        router = TestBed.inject(Router);
        userQueries = TestBed.inject(UserQueries);
        actions = new ReplaySubject(1);
    });

    it('should allow access to edit profile module when is logged, registered and has valid token', () => {
        spyOn(userQueries, 'hasEditProfilePermission').and.returnValue(true);

        expect(guard.canActivate(activatedRouteSnapshotMock)).toBeTruthy();
    });

    it('should not allow access to edit profile module when he does not have permissions to edit profile', () => {
        spyOn(userQueries, 'hasEditProfilePermission').and.returnValue(false);

        expect(guard.canActivate(activatedRouteSnapshotMock)).toBeFalsy();
        expect(router.navigate).toHaveBeenCalled();
    });
});
