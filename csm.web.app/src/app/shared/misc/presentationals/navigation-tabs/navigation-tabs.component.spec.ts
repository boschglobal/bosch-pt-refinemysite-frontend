/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {APP_BASE_HREF} from '@angular/common';
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
    PRIMARY_OUTLET,
    Router,
    Routes
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {
    NavigationTabsComponent,
    NavigationTabsRoutes
} from './navigation-tabs.component';

describe('Navigation Tabs Component', () => {
    let fixture: ComponentFixture<NavigationTabsComponent>;
    let comp: NavigationTabsComponent;
    let de: DebugElement;

    let router: Router;

    const testDataOutlet = 'test-outlet';
    const testDataNavigationTabsRoutes: NavigationTabsRoutes[] = [
        {label: 'foo', link: 'bar', hasMarker: true},
        {label: 'baz', link: 'quux'},
    ];
    const testDataRoutes: Routes = [
        {
            path: '',
            component: NavigationTabsComponent,
        },
        {
            path: testDataNavigationTabsRoutes[0].link,
            component: NavigationTabsComponent,
            outlet: testDataOutlet,
        },
        {
            path: testDataNavigationTabsRoutes[1].link,
            component: NavigationTabsComponent,
            outlet: testDataOutlet,
        }];

    const dataAutomationNavigationTabsSelector = '[data-automation="navigation-tabs"]';
    const dataAutomationNavigationTabWidthNewsSelector = '[data-automation="tab-with-marker"]';
    const dataAutomationNavigationTabSelector = `${dataAutomationNavigationTabsSelector} a[data-automation^="tab-"]`;
    const disabledCSSClass = 'ss-navigation-tabs__tab--disabled';

    const getDebugElement = (selector: string): DebugElement => de.query(By.css(selector));
    const getTab = (tabIndex: number) => getDebugElement(`${dataAutomationNavigationTabsSelector} [data-automation^="tab-${tabIndex}"]`);
    const getTabWrapper = (tabIndex: number) =>
        getDebugElement(`${dataAutomationNavigationTabsSelector} [data-automation^="tab-wrapper-${tabIndex}"]`);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            RouterTestingModule.withRoutes(testDataRoutes),
            TranslationModule,
        ],
        declarations: [
            NavigationTabsComponent,
        ],
        providers: [
            {
                provide: APP_BASE_HREF,
                useValue: '/',
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavigationTabsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        comp.outlet = testDataOutlet;
        comp.routes = testDataNavigationTabsRoutes;
        fixture.detectChanges();
    });

    beforeEach(() => {
        router = TestBed.inject(Router);
    });

    it('should render one tab per each route passed in', () => {
        const tabNumbers: number = de.queryAll(By.css(dataAutomationNavigationTabSelector)).length;
        const routeNumbers: number = testDataNavigationTabsRoutes.length;

        expect(tabNumbers).toBe(routeNumbers);
    });

    it('should render correct href on anchor tag on router with a primary outlet defined', waitForAsync(() => {
        comp.outlet = PRIMARY_OUTLET;

        fixture.detectChanges();

        const tabIndex = 0;
        const expectedHref = `/${testDataNavigationTabsRoutes[tabIndex].link}`;
        const href: string = getTab(tabIndex).nativeElement.getAttribute('href');

        expect(href).toBe(expectedHref);
    }));

    it('should render correct href on anchor tag on router with a specific outlet defined', waitForAsync(() => {
        const tabIndex = 0;
        const expectedHref = `/(${testDataOutlet}:${testDataNavigationTabsRoutes[tabIndex].link})`;
        const href: string = getTab(tabIndex).nativeElement.getAttribute('href');

        expect(href).toBe(expectedHref);
    }));

    it('should render marker for tab with news', () => {
        const tabWithNew = getTab(0).query(By.css(dataAutomationNavigationTabWidthNewsSelector));

        expect(tabWithNew).not.toBeNull();
    });

    it('should not render marker for tab without news', () => {
        const tabWithNew = getTab(1).query(By.css(dataAutomationNavigationTabWidthNewsSelector));

        expect(tabWithNew).toBeNull();
    });

    it('should allow clicking on the tab and not style it as disabled when it is not disabled', () => {
        const tabElement: HTMLElement = getTab(0).nativeElement;
        const tabWrapperElement: HTMLElement = getTabWrapper(0).nativeElement;

        expect(tabWrapperElement.classList.contains(disabledCSSClass)).toBeFalsy();
        expect(getComputedStyle(tabElement).pointerEvents).not.toBe('none');
    });

    it('should not allow clicking on the tab and style it as disabled when it is disabled', () => {
        comp.routes = [{
            label: 'baz',
            link: 'quux',
            disabled: true,
        }];
        fixture.detectChanges();

        const tabElement: HTMLElement = getTab(0).nativeElement;
        const tabWrapperElement: HTMLElement = getTabWrapper(0).nativeElement;

        expect(tabWrapperElement.classList.contains(disabledCSSClass)).toBeTruthy();
        expect(getComputedStyle(tabElement).pointerEvents).toBe('none');
    });
});
