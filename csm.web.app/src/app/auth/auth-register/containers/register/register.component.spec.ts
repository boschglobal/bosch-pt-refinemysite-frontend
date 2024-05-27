/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

import {AuthService} from '../../../../shared/authentication/services/auth.service';
import {
    PARAM_HAS_BOSCH_ID,
    RegisterComponent
} from './register.component';

describe('Register Component', () => {
    let fixture: ComponentFixture<RegisterComponent>;
    let comp: RegisterComponent;
    let de: DebugElement;
    let authService: AuthService;
    let activatedRoute: ActivatedRoute;

    const registerLoaderSelector = `[data-automation="register-loader"]`;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        providers: [
            {
                provide: AuthService,
                useValue: jasmine.createSpyObj('AuthService', ['login', 'signup']),
            },
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: {
                        queryParamMap: {
                            has: () => false,
                        },
                    },
                },
            },
        ],
        declarations: [
            RegisterComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RegisterComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        authService = TestBed.inject(AuthService);
        activatedRoute = TestBed.inject(ActivatedRoute);

        fixture.detectChanges();
    });

    it('should redirect to CIAM signup page when component initializes and user doesn\'t have Bosch Id', () => {
        spyOn(activatedRoute.snapshot.queryParamMap, 'has').and.callFake(paramName => paramName !== PARAM_HAS_BOSCH_ID);
        comp.ngOnInit();

        expect(authService.signup).toHaveBeenCalled();
    });

    it('should redirect to CIAM login page when component initializes and user has Bosch Id', () => {
        spyOn(activatedRoute.snapshot.queryParamMap, 'has').and.callFake(paramName => paramName === PARAM_HAS_BOSCH_ID);
        comp.ngOnInit();

        expect(authService.login).toHaveBeenCalled();
    });

    it('should render loader while user is waiting to be redirected to CIAM signup page', () => {
        expect(de.query(By.css(registerLoaderSelector))).toBeTruthy();
    });
});
