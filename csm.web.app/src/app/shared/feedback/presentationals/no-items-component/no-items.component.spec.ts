/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
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

import {RouterStub} from '../../../../../test/stubs/router.stub';
import {IconModule} from '../../../ui/icons/icon.module';
import {NoItemsComponent} from './no-items.component';

describe('No Items Component', () => {
    let fixture: ComponentFixture<NoItemsComponent>;
    let comp: NoItemsComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const dataAutomationButtonSelector = '[data-automation="no-items-button"]';
    const dataAutomationIconSelector = '[data-automation="no-items-icon"]';

    const defaultCssClass = 'ss-no-items--normal';
    const defaultIconSize = 96;

    const eventClick: Event = new Event('click');
    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            IconModule,
        ],
        providers: [
            {
                provide: Router,
                useValue: RouterStub,
            },
        ],
        declarations: [NoItemsComponent],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NoItemsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        fixture.detectChanges();
    });

    it('should show button on the component', () => {
        comp.showButton = true;
        fixture.detectChanges();

        expect(comp.showButton).toBeDefined();
    });

    it('should emit clickButton when button is clicked', () => {
        spyOn(comp.clickButton, 'emit');
        comp.showButton = true;
        fixture.detectChanges();

        getElement(dataAutomationButtonSelector).dispatchEvent(eventClick);

        expect(comp.clickButton.emit).toHaveBeenCalled();
    });

    it('should not display icon when it\'s not defined', () => {
        fixture.detectChanges();

        expect(getElement(dataAutomationIconSelector)).toBeFalsy();
    });

    it('should display icon when it\'s defined', () => {
        comp.icon = 'abc';
        fixture.detectChanges();

        expect(getElement(dataAutomationIconSelector)).toBeTruthy();
    });

    it('should change noItemsClasses when size change', () => {
        const expectedCssClass = 'ss-no-items--small';

        expect(comp.noItemsClasses).toBe(defaultCssClass);

        comp.size = 'small';
        fixture.detectChanges();

        expect(comp.noItemsClasses).toBe(expectedCssClass);
    });

    it('should change iconSize when size change', () => {
        const expectedIconSize = 64;

        expect(comp.iconSize).toBe(defaultIconSize);

        comp.size = 'small';
        fixture.detectChanges();

        expect(comp.iconSize).toBe(expectedIconSize);
    });
});
