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
    fakeAsync,
    flush,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {BreakpointHelper} from '../../misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE} from '../constants/breakpoints.constant';
import {FlyoutDirective} from '../flyout/directive/flyout.directive';
import {FlyoutService} from '../flyout/service/flyout.service';
import {
    COLLAPSIBLE_BUTTON_LIST_MAX_INLINE_BUTTONS_BY_SCREEN_SIZE,
    CollapsibleButtonListComponent
} from './collapsible-button-list.component';
import {CollapsibleButtonListTestComponent} from './collapsible-button-list.test.component';

declare const viewport: any;

describe('Collapsible Button List Component', () => {
    let component: CollapsibleButtonListComponent;
    let fixture: ComponentFixture<CollapsibleButtonListTestComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;

    const breakpointChange$: Subject<string> = new Subject();
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);

    const collapsibleButtonListHostSelector = 'ss-collapsible-button-list';
    const dataAutomationInlineButtonsSelector = '[data-automation="inline-buttons"]';
    const dataAutomationCollapsedButtonsSelector = '[data-automation="flyout-component"]';
    const dataAutomationDropdownButtonSelector = '[data-automation="dropdown-button"]';

    const clickEvent: Event = new Event('click', {bubbles: true});

    const getInlineButtons = (): any => de.query(By.css(dataAutomationInlineButtonsSelector)).nativeElement.children[0].children;
    const getCollapsedButtons = (): any => document.querySelector(dataAutomationCollapsedButtonsSelector).children[0].children;
    const getDropdownButton = (): any => de.query(By.css(dataAutomationDropdownButtonSelector)).nativeElement;

    const openCollapsedButtons = () => getDropdownButton().dispatchEvent(clickEvent);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        providers: [
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
        ],
        declarations: [
            CollapsibleButtonListComponent,
            CollapsibleButtonListTestComponent,
            FlyoutDirective,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CollapsibleButtonListTestComponent);
        de = fixture.debugElement.query(By.css(collapsibleButtonListHostSelector));
        component = de.componentInstance;

        flyoutService = TestBed.inject(FlyoutService);

        when(breakpointHelperMock.currentBreakpoint()).thenReturn('xl');
        when(breakpointHelperMock.breakpointChange()).thenReturn(breakpointChange$);

        fixture.detectChanges();
    });

    afterEach(() => viewport.reset());

    it('should display all buttons inline in screens larger then MD', () => {
        const buttons = Array.from(getInlineButtons());

        viewport.set(BREAKPOINTS_RANGE.lg.min);

        buttons.forEach((button: any) => expect(getComputedStyle(button).display).not.toBe('none'));

        viewport.set(BREAKPOINTS_RANGE.xl.min);

        buttons.forEach((button: any) => expect(getComputedStyle(button).display).not.toBe('none'));
    });

    it('should display the correct inline buttons in XS, SM and MD screens', () => {
        const expectedResultsByBreakpointFn = (breakpoint: string) => {
            const buttons = Array.from(getInlineButtons());
            const maxInlineButtonsByScreenSize = COLLAPSIBLE_BUTTON_LIST_MAX_INLINE_BUTTONS_BY_SCREEN_SIZE[breakpoint];
            const displayedButtons = buttons.splice(0, maxInlineButtonsByScreenSize);
            const hiddenButtons = buttons.splice(maxInlineButtonsByScreenSize, buttons.length);

            hiddenButtons.forEach((button: any) => expect(getComputedStyle(button).display).toBe('none'));
            displayedButtons.forEach((button: any) => expect(getComputedStyle(button).display).not.toBe('none'));
        };

        viewport.set(BREAKPOINTS_RANGE.xs.max);
        expectedResultsByBreakpointFn('xs');

        viewport.set(BREAKPOINTS_RANGE.sm.min);
        expectedResultsByBreakpointFn('sm');

        viewport.set(BREAKPOINTS_RANGE.md.min);
        expectedResultsByBreakpointFn('md');
    });

    it('should display the correct collapsed buttons in MD, SM and XS', fakeAsync(() => {
        const expectedResultByScreenFn = (breakpoint: string) => {
            const buttons = Array.from(getCollapsedButtons());
            const maxInlineButtonsByScreenSize = COLLAPSIBLE_BUTTON_LIST_MAX_INLINE_BUTTONS_BY_SCREEN_SIZE[breakpoint];
            const hiddenButtons = buttons.splice(0, maxInlineButtonsByScreenSize);
            const displayedButtons = buttons.splice(maxInlineButtonsByScreenSize, buttons.length);

            hiddenButtons.forEach((button: any) => expect(getComputedStyle(button).display).toBe('none'));
            displayedButtons.forEach((button: any) => expect(getComputedStyle(button).display).not.toBe('none'));
        };

        when(breakpointHelperMock.currentBreakpoint()).thenReturn('xs');
        component.ngAfterViewInit();
        viewport.set(BREAKPOINTS_RANGE.xs.max);

        openCollapsedButtons();

        tick(1);

        expectedResultByScreenFn('xs');

        viewport.set(BREAKPOINTS_RANGE.sm.min);
        expectedResultByScreenFn('sm');

        viewport.set(BREAKPOINTS_RANGE.md.min);
        expectedResultByScreenFn('md');

        flush();
    }));

    it('should show dropdown options button when there are collapsed options on screens smaller then LG', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('sm');
        viewport.set(BREAKPOINTS_RANGE.sm.min);

        component.ngAfterViewInit();

        expect(component.showDropdownButton).toBeTruthy();
    });

    it('should not show dropdown options button when there are no collapsed options on screen larger then MD', () => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('lg');
        viewport.set(BREAKPOINTS_RANGE.lg.min);

        component.ngAfterViewInit();

        expect(component.showDropdownButton).toBeFalsy();
    });

    it('should update dropdown button visibility on breakpoint change', () => {
        expect(component.showDropdownButton).toBeFalsy();

        viewport.set(BREAKPOINTS_RANGE.sm.min);
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('sm');

        breakpointChange$.next();

        expect(component.showDropdownButton).toBeTruthy();

        viewport.set(BREAKPOINTS_RANGE.lg.min);
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('lg');

        breakpointChange$.next();

        expect(component.showDropdownButton).toBeFalsy();
    });

    it('should close collapsible button list flyout on a collapsible button click', fakeAsync(() => {
        when(breakpointHelperMock.currentBreakpoint()).thenReturn('md');
        breakpointChange$.next();
        viewport.set(BREAKPOINTS_RANGE.md.max);

        openCollapsedButtons();

        tick(1);

        spyOn(flyoutService, 'close').and.callThrough();
        spyOn(component, 'handleCollapsedButtonClick').and.callThrough();

        getCollapsedButtons()[0].dispatchEvent(clickEvent);

        expect(flyoutService.close).toHaveBeenCalledWith(component.collapsedButtonsFlyoutId);
        expect(component.handleCollapsedButtonClick).toHaveBeenCalled();
    }));

});
