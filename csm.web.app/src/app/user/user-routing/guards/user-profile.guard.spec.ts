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
    ActivatedRoute,
    ActivatedRouteSnapshot,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {
    of,
    ReplaySubject
} from 'rxjs';

import {MockStore} from '../../../../test/mocks/store';
import {UserQueries} from '../../store/user/user.queries';
import {UserProfileGuard} from './user-profile.guard';

describe('User Profile Guard', () => {
    let guard: UserProfileGuard;
    let router: Router;
    let actions: ReplaySubject<any>;
    let userQueries: UserQueries;
    let activatedRoute: ActivatedRouteSnapshot;

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: {['userId']: '123'},
                    snapshot: {
                        parent: {
                            params: 'name',
                            paramMap: {
                                get: () => '123',
                            },
                        },
                    },
                    root: {
                        firstChild: {
                            snapshot: {
                                children: [{
                                    params: {['userId']: '123'},
                                }],
                            },
                        },
                    },
                },
            },
            provideMockActions(() => actions),
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
        guard = TestBed.inject(UserProfileGuard);
        router = TestBed.inject(Router);
        userQueries = TestBed.inject(UserQueries);
        actions = new ReplaySubject(1);
        activatedRoute = TestBed.inject<ActivatedRouteSnapshot>(ActivatedRoute as any);
    });

    it('should allow access to user profile module when is logged, registered and has valid token', () => {
        spyOn(userQueries, 'observeCurrentUser').and.returnValue(of({id: '123'}));
        guard.canActivate(activatedRoute).subscribe(result => {
            expect(result).toBeTruthy();
            expect(router.navigate).not.toHaveBeenCalled();
        });
    });

    it('should not allow access to user profile module when the user returned is invalid', () => {
        spyOn(userQueries, 'observeCurrentUser').and.returnValue(of(undefined));
        guard.canActivate(activatedRoute).subscribe(result => {
            expect(result).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
        });
    });

    it('should not allow access to user profile module when the user returned is valid ' +
        'but it does not match the one requested in the url', () => {
        spyOn(userQueries, 'observeCurrentUser').and.returnValue(of({id: '321'}));
        guard.canActivate(activatedRoute).subscribe(result => {
            expect(result).toBeFalsy();
            expect(router.navigate).toHaveBeenCalled();
        });
    });
});
