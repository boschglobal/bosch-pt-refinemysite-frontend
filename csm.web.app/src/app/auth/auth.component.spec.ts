/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../test/stubs/translate-service.stub';
import {TranslationModule} from '../shared/translation/translation.module';
import {UIModule} from '../shared/ui/ui.module';
import {AuthComponent} from './auth.component';

describe('Auth Component', () => {
    let fixture: ComponentFixture<AuthComponent>;
    let comp: AuthComponent;
    let translateService: TranslateService;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            TranslationModule.forRoot(),
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [AuthComponent],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AuthComponent);
        comp = fixture.componentInstance;

        translateService = TestBed.inject(TranslateService);
        fixture.detectChanges();
    });

    afterAll(() => {
        fixture.destroy();
        translateService.setDefaultLang('en');
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });
});
