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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {
    instance,
    mock
} from 'ts-mockito';

import {FeatureToggleEnum} from '../../../../../configurations/feature-toggles/feature-toggle.enum';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {TEST_USER_SLICE} from '../../../../../test/mocks/user';
import {ActivatedRouteStub} from '../../../../../test/stubs/activated-route.stub';
import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {AuthService} from '../../../authentication/services/auth.service';
import {FeatureToggleHelper} from '../../../misc/helpers/feature-toggle.helper';
import {BlobService} from '../../../rest/services/blob.service';
import {TranslationModule} from '../../../translation/translation.module';
import {BreakpointsEnum} from '../../../ui/constants/breakpoints.constant';
import {NavigationModule} from '../../navigation.module';
import {
    NavbarComponent,
    ROUTE_DATA_NAVBAR,
} from './navbar.component';

describe('NavBar Component', () => {
    let fixture: ComponentFixture<NavbarComponent>;
    let comp: NavbarComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let router: Router;
    let featureToggleHelper: any;

    const authServiceMock: AuthService = mock(AuthService);

    const dataAutomationExpand = '[data-automation="ss-navbar-expand"]';
    const copyrightLabelSelector = '[data-automation="ss-navbar-copyright-label"]';

    const clickEvent: Event = new Event('click');
    const resizeEvent: Event = new Event('resize');
    const scrollEvent: Event = new Event('scroll');

    const initialInnerWidth: number = window.innerWidth;
    const cssClassBodyNoScroll = 'no-scroll';
    const featureToggle = 'SMAR-0000' as unknown as FeatureToggleEnum;

    const getMockActivatedRoute = (permissions: boolean, features: FeatureToggleEnum[] = null): ActivatedRouteStub => {
        const navBarData = {
            staticLabel: 'foo',
            icon: 'foo',
            url: 'url',
            permissions,
            ...features != null ? {features} : {},
        };

        return Object.assign(new ActivatedRouteStub(), {
            children: [Object.assign(new ActivatedRouteStub(), {
                children: [],
                data: {[ROUTE_DATA_NAVBAR]: [navBarData]},
            })],
        });
    };

    const updateWindowInnerWidth = (width: number) => {
        Object.defineProperty(window, 'innerWidth', {
            get: () => width,
        });

        window.dispatchEvent(resizeEvent);
    };

    const expandNavBar = () => {
        const navbarExpandableElement: HTMLElement = de.query(By.css(dataAutomationExpand)).nativeElement;

        navbarExpandableElement.dispatchEvent(clickEvent);
    };

    const initialState: any = {
        projectModule: {
            projectSlice: {
                items: [MOCK_PROJECT_1],
                currentItem: {
                    id: MOCK_PROJECT_1.id,
                },
            },
        },
        userSlice: TEST_USER_SLICE,
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            NavigationModule,
            RouterTestingModule,
            StoreModule.forRoot({}),
            TranslationModule.forRoot(),
            BrowserModule,
            BrowserAnimationsModule,
        ],
        providers: [
            {
                provide: AuthService,
                useFactory: () => instance(authServiceMock),
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
            {
                provide: ActivatedRoute,
                useClass: ActivatedRouteStub,
            },
            {
                provide: FeatureToggleHelper,
                useValue: jasmine.createSpyObj('FeatureToggleHelper', ['isFeatureActive']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        fixture.detectChanges();
        router = TestBed.inject(Router);
        featureToggleHelper = TestBed.inject(FeatureToggleHelper);

        featureToggleHelper.isFeatureActive.calls.reset();
        featureToggleHelper.isFeatureActive.and.returnValue(true);
    });

    afterAll(() => {
        updateWindowInnerWidth(initialInnerWidth);
    });

    it('should retrieve correct navBar icon', () => {
        expect(comp.isNavBarOpen).toBeFalsy();
        expect(comp.getNavBarIcon()).toBe('menu');

        comp.isNavBarOpen = true;
        fixture.detectChanges();

        expect(comp.isNavBarOpen).toBeTruthy();
        expect(comp.getNavBarIcon()).toBe('close');
    });

    it('should expand the navbar when clicked on the hamburger', () => {
        spyOn(comp, 'toggleNavBarPanel').and.callThrough();

        expandNavBar();
        fixture.detectChanges();
        expect(comp.toggleNavBarPanel).toHaveBeenCalled();
    });

    it('should retrieve navbar height when navbar is open or the screen is big', () => {
        comp.isNavBarOpen = true;
        updateWindowInnerWidth(BreakpointsEnum.sm);
        fixture.detectChanges();
        expect(comp.getNavStyle().hasOwnProperty('height')).toBeTruthy();
    });

    it('should not retrieve navbar height when navbar is not open and the screen is small', () => {
        comp.isNavBarOpen = false;
        updateWindowInnerWidth(BreakpointsEnum.sm - 1);
        fixture.detectChanges();
        expect(comp.getNavStyle().hasOwnProperty('height')).toBeFalsy();
    });

    it('should recalculate navbar height after window scroll', () => {
        spyOn(comp.nav.nativeElement, 'getBoundingClientRect').and.callThrough();
        window.dispatchEvent(scrollEvent);
        expect(comp.nav.nativeElement.getBoundingClientRect).toHaveBeenCalled();
    });

    it('should recalculate navbar height after window resize', () => {
        spyOn(comp.nav.nativeElement, 'getBoundingClientRect').and.callThrough();
        window.dispatchEvent(resizeEvent);
        expect(comp.nav.nativeElement.getBoundingClientRect).toHaveBeenCalled();
    });

    it('should add body class when navbar is open in small window size', () => {
        comp.isNavBarOpen = true;

        updateWindowInnerWidth(BreakpointsEnum.lg);
        fixture.detectChanges();
        expect(document.body.classList).not.toContain(cssClassBodyNoScroll);

        updateWindowInnerWidth(BreakpointsEnum.sm);
        fixture.detectChanges();
        expect(document.body.classList).toContain(cssClassBodyNoScroll);
    });

    it('should remove scroll class from body when clicking on document to close menu', () => {
        comp.isNavBarOpen = true;

        expect(document.body.classList).toContain(cssClassBodyNoScroll);

        document.dispatchEvent(clickEvent);

        expect(document.body.classList).not.toContain(cssClassBodyNoScroll);
    });

    it('should close navbar on document click when navbar is open', () => {
        comp.isNavBarOpen = true;

        document.dispatchEvent(clickEvent);

        expect(comp.isNavBarOpen).toBeFalsy();
    });

    it('should render Copyright label when navbar is expanded', () => {
        comp.isNavBarOpen = true;

        fixture.detectChanges();

        expect(el.querySelector(copyrightLabelSelector)).not.toBeNull();
    });

    it('should not render Copyright label when navbar is collapsed', () => {
        comp.isNavBarOpen = false;

        fixture.detectChanges();

        expect(el.querySelector(copyrightLabelSelector)).toBeNull();
    });

    it('should show navbar options if user have permission and feature toggle is not provided', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: getMockActivatedRoute(true),
        });

        comp.ngOnInit();

        expect(comp.navBar.length).toBe(1);
    });

    it('should show navbar options if user have permission and feature toggle is provided and is active', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: getMockActivatedRoute(true, [featureToggle]),
        });

        comp.ngOnInit();

        expect(comp.navBar.length).toBe(1);
    });

    it('should not show navbar options if user does not have permission and feature toggle is provided and is active', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: getMockActivatedRoute(false, [featureToggle]),
        });

        comp.ngOnInit();

        expect(comp.navBar[0].length).toBe(0);
    });

    it('should not show navbar options if user does not have permission and feature toggle is provided but is not active', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: getMockActivatedRoute(false, [featureToggle]),
        });

        featureToggleHelper.isFeatureActive.and.returnValue(false);

        comp.ngOnInit();

        expect(comp.navBar[0].length).toBe(0);
    });

    it('should not show navbar options if user does not have permission and feature toggle is not provided', () => {
        spyOnProperty(router, 'routerState', 'get').and.returnValue({
            root: getMockActivatedRoute(false, []),
        });

        comp.ngOnInit();

        expect(comp.navBar[0].length).toBe(0);
    });
});
