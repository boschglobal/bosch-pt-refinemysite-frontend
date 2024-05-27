/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {UIModule} from '../../../ui/ui.module';
import {MiscModule} from '../../misc.module';
import {MaintenanceComponent} from './maintenance.component';

describe('Maintenance Component', () => {
    let fixture: ComponentFixture<MaintenanceComponent>;
    let de: DebugElement;
    let router: Router;

    const getElement = (element: string): Element => de.nativeElement.querySelector(element);
    const eventClick: Event = new Event('click');
    const maintenanceLogoSelector = '[data-automation="maintenance-logo"]';
    const noItemsButtonSelector = '[data-automation="no-items-button"]';

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            MiscModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [MaintenanceComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        router = TestBed.inject(Router);
        fixture = TestBed.createComponent(MaintenanceComponent);
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should navigate to home when logo is clicked', () => {
        spyOn(router, 'navigate');

        getElement(maintenanceLogoSelector).dispatchEvent(eventClick);

        expect(router.navigate).toHaveBeenCalledWith(['']);
    });

    it('should navigate to home when button is clicked', () => {
        spyOn(router, 'navigate');

        getElement(noItemsButtonSelector).dispatchEvent(eventClick);

        expect(router.navigate).toHaveBeenCalledWith(['']);
    });
});
