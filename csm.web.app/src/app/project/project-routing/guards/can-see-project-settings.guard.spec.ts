/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {NOT_AUTHORISED_ROUTE} from '../../../app.routes';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';
import {CanSeeProjectSettingsGuard} from './can-see-project-settings.guard';

describe('Can See Project Settings Guard', () => {
    let guard: CanSeeProjectSettingsGuard;
    let router: any;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const activatedRouteSnapshot = {
        parent: {
            paramMap: {
                get: () => 'foo',
            },
        },
        queryParams: {},
    } as unknown as ActivatedRouteSnapshot;
    const routerStateSnapshotMock: RouterStateSnapshot = {
        url: 'url/here',
    } as RouterStateSnapshot;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Router,
                useValue: jasmine.createSpyObj('Router', ['navigate']),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(CanSeeProjectSettingsGuard);
        router = TestBed.inject(Router);

        router.navigate.calls.reset();

        when(projectSliceServiceMock.observeAccessToProjectSettings()).thenReturn(of(false));
    });

    it('should allow activation of the route when user has permissions', () => {
        when(projectSliceServiceMock.observeAccessToProjectSettings()).thenReturn(of(true));

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshotMock)
            .subscribe(result => expect(result).toBeTruthy);
    });

    it('should not allow activation of the route when user has no permission', () => {
        when(projectSliceServiceMock.observeAccessToProjectSettings()).thenReturn(of(false));

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshotMock)
            .subscribe(result => expect(result).toBeFalsy());
    });

    it('should not call router navigate when user has permission', () => {
        when(projectSliceServiceMock.observeAccessToProjectSettings()).thenReturn(of(true));

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshotMock)
            .subscribe(() => expect(router.navigate).not.toHaveBeenCalled());
    });

    it('should call router navigate when user has no permission', () => {
        const expectedResult = [`/${NOT_AUTHORISED_ROUTE}`];
        when(projectSliceServiceMock.observeAccessToProjectSettings()).thenReturn(of(false));

        guard.canActivate(activatedRouteSnapshot, routerStateSnapshotMock)
            .subscribe(() => expect(router.navigate).toHaveBeenCalledWith(expectedResult));
    });
});
