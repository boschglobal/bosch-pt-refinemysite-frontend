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
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {TranslationModule} from '../../../translation/translation.module';
import {BREAKPOINTS_RANGE} from '../../../ui/constants/breakpoints.constant';
import {HeaderComponent} from './header.component';

declare const viewport: any;

describe('Header Component', () => {
    let fixture: ComponentFixture<HeaderComponent>;
    let comp: HeaderComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const headerNotificationsSelector = '[data-automation="header-notifications"]';
    const headerAccountMenuSelector = '[data-automation="header-account-menu"]';
    const headerBreadcrumbSelector = '[data-automation="header-breadcrumb"]';
    const headerHelpSectionSelector = '[data-automation="header-help-section"]';

    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const breakpointChange$: Subject<string> = new Subject();

    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
        ],
        declarations: [
            HeaderComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(HeaderComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        when(breakpointHelperMock.breakpointChange()).thenReturn(breakpointChange$);

        fixture.detectChanges();
    });

    afterEach(() => viewport.reset());

    it('should create component', () => {
        expect(comp).toBeTruthy();
    });

    it('should render notifications component', () => {
        expect(getElement(headerNotificationsSelector)).toBeTruthy();
    });

    it('should render account menu component', () => {
        expect(getElement(headerAccountMenuSelector)).toBeTruthy();
    });

    it('should render breadcrumb component', () => {
        expect(getElement(headerBreadcrumbSelector)).toBeTruthy();
    });

    it('should not show user guide icon when current breakpoint is XS', () => {
        viewport.set(BREAKPOINTS_RANGE.xs.max);

        const userGuideButton = fixture.debugElement.query(By.css(headerHelpSectionSelector));

        expect(getComputedStyle(userGuideButton.nativeElement).display).toBe('none');
    });

    it('should show user guide icon when current breakpoint is not XS', () => {
        viewport.set(BREAKPOINTS_RANGE.sm.max);

        const userGuideButton = fixture.debugElement.query(By.css(headerHelpSectionSelector));

        expect(getComputedStyle(userGuideButton.nativeElement).display).not.toBe('none');
    });

    it(`should show user guide icon`, () => {
        viewport.set(BREAKPOINTS_RANGE.sm.max);
        fixture.detectChanges();

        const userGuideButton = fixture.debugElement.query(By.css(headerHelpSectionSelector));

        expect(userGuideButton).not.toBeNull();
    });
});
