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
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';

import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {MiscModule} from '../../misc.module';
import {PageNotFoundComponent} from './page-not-found.component';

describe('PageNotFoundComponent Component', () => {
    let fixture: ComponentFixture<PageNotFoundComponent>;
    let de: DebugElement;
    let router: Router;

    const getElement = (element: string): Element => de.nativeElement.querySelector(element);
    const eventClick: Event = new Event('click');
    const notFoundLogoSelector = '[data-automation="page-not-found-logo"]';
    const noItemsButtonSelector = '[data-automation="no-items-button"]';

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            MiscModule,
        ],
        declarations: [PageNotFoundComponent],
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
        fixture = TestBed.createComponent(PageNotFoundComponent);
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should navigate to home when logo is clicked', () => {
        spyOn(router, 'navigate');

        getElement(notFoundLogoSelector).dispatchEvent(eventClick);

        expect(router.navigate).toHaveBeenCalledWith(['']);
    });

    it('should navigate to home when button is clicked', () => {
        spyOn(router, 'navigate');

        getElement(noItemsButtonSelector).dispatchEvent(eventClick);

        expect(router.navigate).toHaveBeenCalledWith(['']);
    });
});
