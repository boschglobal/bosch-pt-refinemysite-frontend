/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync,
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../../test/mocks/store';
import {
    TEST_USER_RESOURCE_REGISTERED,
    TEST_USER_SLICE
} from '../../../../../test/mocks/user';
import {ActivatedRouteStub} from '../../../../../test/stubs/activated-route.stub';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {ResizeHelper} from '../../../misc/helpers/resize.helper';
import {TranslationModule} from '../../../translation/translation.module';
import {BREAKPOINTS_RANGE} from '../../../ui/constants/breakpoints.constant';
import {HistoryService} from '../../api/history.service';
import {NavigationModule} from '../../navigation.module';
import {
    Breadcrumb,
    BreadcrumbComponent,
    ROUTE_DATA_BREADCRUMB,
} from './breadcrumb.component';
import {BreadcrumbTestComponent} from './breadcrumb.test.component';

declare const viewport: any;

describe('Breadcrumb Component', () => {
    let fixture: ComponentFixture<BreadcrumbTestComponent>;
    let comp: BreadcrumbComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let historyService: HistoryService;
    let router: Router;

    const breadcrumbSelector = 'ss-breadcrumb';

    const resize$ = new Subject<void>();
    const breakpointHelperMock: BreakpointHelper = mock(BreakpointHelper);
    const resizeHelperMock: ResizeHelper = mock(ResizeHelper);

    const getBreadcrumb = (): any => de.query(By.css('[data-automation="breadcrumb"]'))?.nativeElement;
    const getBreadcrumbPath = (): any => de.query(By.css('[data-automation="breadcrumb-path"]'))?.nativeElement;
    const getBreadcrumbPathList = (): any => de.query(By.css('[data-automation="breadcrumb-path-ul"]'))?.nativeElement;
    const getBreadcrumbItems = (): DebugElement[] => de.queryAll(By.css('[data-automation="breadcrumb-path-li"]'));
    const getBreadcrumbExternalContent = (): any => de.query(By.css('[data-automation="breadcrumb-external-content"]'))?.nativeElement;
    const getBreadcrumbPathContentByIndex = (pathIndex: number): string =>
        de.query(By.css(`[data-automation="breadcrumb-path-${pathIndex}"]`))?.nativeElement?.textContent;

    const breadcrumbs: Breadcrumb[] = [
        {
            staticLabel: 'message_foo',
            dynamicLabel: null,
            url: 'foo',
        },
        {
            staticLabel: null,
            dynamicLabel: of(TEST_USER_RESOURCE_REGISTERED.firstName),
            url: 'foo/123',
        },
        {
            staticLabel: 'message_bar',
            dynamicLabel: null,
            url: 'foo/123/bar',
        },
    ];

    const oneLevelNestedRoutes = Object.assign(new ActivatedRouteStub(), {
        children: [Object.assign(new ActivatedRouteStub(), {
            children: [],
            data: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'message_foo'}},
        })],
    });

    const twoLevelsNestedRoutes = Object.assign({}, oneLevelNestedRoutes, {
        children: Object.assign({}, oneLevelNestedRoutes.children, {
            children: [Object.assign(new ActivatedRouteStub(), {
                children: [],
                data: {[ROUTE_DATA_BREADCRUMB]: {staticLabel: 'message_bar'}},
            })],
        }),
    });

    const moduleDef: TestModuleMetadata = {
        imports: [
            NavigationModule,
            RouterTestingModule,
            TranslationModule.forRoot(),
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            BreadcrumbComponent,
            BreadcrumbTestComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useClass: ActivatedRouteStub,
            },
            {
                provide: BreakpointHelper,
                useFactory: () => instance(breakpointHelperMock),
            },
            {
                provide: ResizeHelper,
                useFactory: () => instance(resizeHelperMock),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore({userSlice: TEST_USER_SLICE}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BreadcrumbTestComponent);
        de = fixture.debugElement.query(By.css(breadcrumbSelector));
        el = de.nativeElement;
        comp = de.componentInstance;

        router = TestBed.inject(Router);
        historyService = TestBed.inject(HistoryService);

        when(resizeHelperMock.events$).thenReturn(resize$);
        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.xs)).thenReturn(false);

        comp.ngOnInit();
    });

    afterEach(() => viewport.reset());

    it('should render and display the correct breadcrumb paths on screen sizes different then XS', () => {
        const expectedDisplayValue = 'flex';
        const expectedBreadcrumbPaths = breadcrumbs.length - 1;

        viewport.set(BREAKPOINTS_RANGE.sm.max);

        expect(getBreadcrumbItems().length).toBe(expectedBreadcrumbPaths);

        getBreadcrumbItems().forEach((item) => {
            expect(getComputedStyle(item.nativeElement).display).toBe(expectedDisplayValue);
        });
    });

    it('should render and display the correct breadcrumb paths on XS screen sizes', () => {
        const expectedDisplayValue = 'none';
        const expectedBreadcrumbPaths = breadcrumbs.length - 1;

        viewport.set(BREAKPOINTS_RANGE.xs.max);

        expect(getBreadcrumbItems().length).toBe(expectedBreadcrumbPaths);

        getBreadcrumbItems().forEach((item, index, items) => {
            if (index !== items.length - 1) {
                expect(getComputedStyle(item.nativeElement).display).toBe(expectedDisplayValue);
            } else {
                expect(getComputedStyle(item.nativeElement).display).not.toBe(expectedDisplayValue);
            }
        });
    });

    it('should not render current route on the breadcrumb', () => {
        const pathIndex = breadcrumbs.length;
        expect(getBreadcrumbPathContentByIndex(pathIndex)).toBeUndefined();
    });

    it('should render breadcrumb when there is more then 1 child route and not render when there\'s none', () => {
        expect(getBreadcrumb()).toBeDefined();

        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: oneLevelNestedRoutes,
        });

        comp.ngOnInit();

        expect(getBreadcrumb()).toBeUndefined();
    });

    it('should render and display correct breadcrumb paths upon changes in router navigation', () => {
        const expectedBreadcrumbPaths = 1;
        const expectedInitialBreadcrumbPaths = breadcrumbs.length - 1;
        const expectedDisplayValue = 'flex';

        expect(getBreadcrumbItems().length).toBe(expectedInitialBreadcrumbPaths);
        getBreadcrumbItems().forEach((item) => {
            expect(getComputedStyle(item.nativeElement).display).toBe(expectedDisplayValue);
        });

        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: twoLevelsNestedRoutes,
        });

        router.navigateByUrl('');

        expect(getBreadcrumbItems().length).toBe(expectedBreadcrumbPaths);
        getBreadcrumbItems().forEach((item) => {
            expect(getComputedStyle(item.nativeElement).display).toBe(expectedDisplayValue);
        });
    });

    it('should render the correct breadcrumb label for static label', () => {
        const pathIndex = 0;
        expect(getBreadcrumbPathContentByIndex(pathIndex)).toContain(breadcrumbs[pathIndex].staticLabel);
    });

    it('should render the correct breadcrumb label for dynamic label', () => {
        const pathIndex = 1;
        expect(getBreadcrumbPathContentByIndex(pathIndex)).toContain(TEST_USER_RESOURCE_REGISTERED.firstName);
    });

    it('should generate the right breadcrumb path urls', () => {
        const renderedBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
        renderedBreadcrumbs.forEach((breadcrumb, pathIndex) => {
            expect(comp.breadcrumbs[pathIndex].url).toBe(breadcrumb.url);
        });
    });

    it('should call breadcrumb path element scroll function to update scroll left on ngOnInit and page resize ' +
        'event with left 0 value when current breakpoint is XS', fakeAsync(() => {
        const scrollLeft = 2000;
        const breadcrumbPathElement = getBreadcrumbPath();
        const breadcrumbPathListElement = getBreadcrumbPathList();
        const expectedResult = {behavior: 'smooth', left: 0};
        const spy = spyOn(breadcrumbPathElement, 'scroll').and.callThrough();

        breadcrumbPathListElement.style.width = `${scrollLeft}px`;

        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.xs)).thenReturn(true);

        comp.ngOnInit();

        expect(breadcrumbPathElement.scroll).toHaveBeenCalledWith(expectedResult);

        spy.calls.reset();

        resize$.next();

        tick(300);

        expect(breadcrumbPathElement.scroll).toHaveBeenCalledWith(expectedResult);
    }));

    it('should call breadcrumb path element scroll function to update scroll left on ngOnInit and page resize event ' +
        'with left value different then 0 when current breakpoint is not XS', fakeAsync(() => {
        const scrollLeft = 2000;
        const breadcrumbPathElement = getBreadcrumbPath();
        const breadcrumbPathListElement = getBreadcrumbPathList();
        const expectedResult = {behavior: 'smooth', left: scrollLeft};
        const spy = spyOn(breadcrumbPathElement, 'scroll').and.callThrough();

        breadcrumbPathListElement.style.width = `${scrollLeft}px`;

        when(breakpointHelperMock.isCurrentBreakpoint(BREAKPOINTS_RANGE.xs)).thenReturn(false);

        comp.ngOnInit();

        expect(breadcrumbPathElement.scroll).toHaveBeenCalledWith(expectedResult);

        spy.calls.reset();

        resize$.next();

        tick(300);

        expect(breadcrumbPathElement.scroll).toHaveBeenCalledWith(expectedResult);
    }));

    it('should set hasNavigationHistory to false when there\'s no navigation history', () => {
        spyOnProperty(historyService, 'length', 'get').and.returnValue(0);

        comp.ngOnInit();

        expect(comp.hasNavigationHistory).toBeFalsy();
    });

    it('should set hasNavigationHistory to true when there\'s navigation history', () => {
        spyOnProperty(historyService, 'length', 'get').and.returnValue(1);

        comp.ngOnInit();

        expect(comp.hasNavigationHistory).toBeTruthy();
    });

    it('should navigate back when handleNavigateBack is called', () => {
        spyOn(historyService, 'back');
        comp.handleNavigateBack();
        expect(historyService.back).toHaveBeenCalled();
    });

    it('should not render external content when there are child routes', () => {
        expect(getBreadcrumbExternalContent()).toBeUndefined();
    });

    it('should render external content when there are no child routes', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: oneLevelNestedRoutes,
        });

        comp.ngOnInit();

        expect(getBreadcrumbExternalContent()).toBeDefined();
    });
});
