/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Router} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {AuthService} from '../../../shared/authentication/services/auth.service';
import {UnauthenticatedGuard} from './unauthenticated.guard';

describe('Unauthenticated Guard', () => {
    let guard: UnauthenticatedGuard;
    let router: Router;

    const authServiceMock: AuthService = mock(AuthService);

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [{
            provide: AuthService,
            useFactory: () => instance(authServiceMock),
        }],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(UnauthenticatedGuard);
        router = TestBed.inject(Router);
    });

    it('should cancel navigation when user has a valid token', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(true));
        spyOn(router, 'navigateByUrl');
        guard.canActivate().subscribe(result => {
            expect(result).toBeFalsy();
            expect(router.navigateByUrl).toHaveBeenCalled();
        });
    }));

    it('should allow navigation when user hasn\'t a valid token', waitForAsync(() => {
        when(authServiceMock.isAuthenticated()).thenReturn(of(false));
        spyOn(router, 'navigateByUrl');
        guard.canActivate().subscribe(result => {
            expect(result).toBeTruthy();
            expect(router.navigateByUrl).not.toHaveBeenCalled();
        });
    }));
});
