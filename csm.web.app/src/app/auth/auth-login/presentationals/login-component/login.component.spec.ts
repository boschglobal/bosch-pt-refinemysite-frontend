/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    instance,
    mock
} from 'ts-mockito';

import {AuthService} from '../../../../shared/authentication/services/auth.service';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {LoginComponent} from './login.component';

describe('Login Component', () => {
    let fixture: ComponentFixture<LoginComponent>;
    let comp: LoginComponent;
    let de: DebugElement;

    const authServiceMock: AuthService = mock(AuthService);

    const dataAutomationLoginButton = `[data-automation="login"]`;
    const clickEvent: Event = new Event('click');

    const getNativeElement = (selector: string): HTMLElement => {
        return de.query(By.css(selector)).nativeElement;
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [LoginComponent],
        providers: [{
            provide: AuthService,
            useFactory: () => instance(authServiceMock),
        }],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should call login when clicking login button', () => {
        spyOn(comp, 'login').and.callThrough();

        getNativeElement(dataAutomationLoginButton).dispatchEvent(clickEvent);

        expect(comp.login).toHaveBeenCalled();
    });
});
