/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
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
import {RouterTestingModule} from '@angular/router/testing';
import {Store} from '@ngrx/store';
import {
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MockStore} from '../../../../../test/mocks/store';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2
} from '../../../../../test/mocks/user-legal-documents';
import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {State} from '../../../../app.reducers';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {LegalDocumentResource} from '../../../../user/api/resources/user-legal-documents.resource';
import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {LegalDocumentTypeEnum} from '../../../../user/user-common/enums/legal-document-type.enum';
import {AuthService} from '../../../authentication/services/auth.service';
import {BreakpointHelper} from '../../../misc/helpers/breakpoint.helper';
import {BlobService} from '../../../rest/services/blob.service';
import {TranslationModule} from '../../../translation/translation.module';
import {MenuItem} from '../../../ui/menus/menu-list/menu-list.component';
import {UIModule} from '../../../ui/ui.module';
import {
    AccountMenuComponent,
    LOGOUT_ITEM_ID,
} from './account-menu.component';

describe('Account Menu Component', () => {
    let component: AccountMenuComponent;
    let fixture: ComponentFixture<AccountMenuComponent>;
    let authService: AuthService;
    let changeDetectorRef: ChangeDetectorRef;
    let store: Store<State>;
    let breakpointHelper: any;

    const authServiceMock: AuthService = mock(AuthService);
    const userQueriesMock: UserQueries = mock(UserQueries);
    const legalDocumentsMock: LegalDocumentsQueries = mock(LegalDocumentsQueries);

    let breakpointObservable: Subject<string>;
    const legalDocumentsListObservable = new Subject<LegalDocumentResource[]>();
    const clickEvent: Event = new Event('click', {bubbles: true});
    const accountMenuButtonSelector = '[data-automation="account-menu-button"]';
    const accountMenuProfileSelector = '[data-automation="account-menu-option-profile"]';
    const accountMenuTermsSelector = `[data-automation="account-menu-${LegalDocumentTypeEnum.TermsAndConditions}"]`;
    const accountMenuEULASelector = `[data-automation="account-menu-${LegalDocumentTypeEnum.Eula}"]`;
    const accountMenuPrivacyStatementSelector = '[data-automation="account-menu-option-privacy-statement"]';
    const accountMenuImprintSelector = '[data-automation="account-menu-option-imprint"]';
    const accountMenuOSSSelector = '[data-automation="account-menu-option-oss"]';
    const accountUserGuideSelector = '[data-automation="account-menu-user-guide"]';

    const getDocumentElement = (selector: string): HTMLElement => document.querySelector(selector);

    const legalDocuments = [MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1, MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2];

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            RouterTestingModule,
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: AuthService,
                useFactory: () => instance(authServiceMock),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
            {
                provide: LegalDocumentsQueries,
                useFactory: () => instance(legalDocumentsMock),
            },
            {
                provide: BreakpointHelper,
                useValue: jasmine.createSpyObj('BreakpointHelper', [
                    'breakpointChange',
                    'currentBreakpoint',
                ]),
            },
        ],
        declarations: [
            AccountMenuComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AccountMenuComponent);
        component = fixture.componentInstance;
        breakpointHelper = TestBed.inject(BreakpointHelper);

        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));
        when(legalDocumentsMock.observeLegalDocumentsList()).thenReturn(legalDocumentsListObservable);

        authService = TestBed.inject(AuthService);
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        store = TestBed.inject(Store);
        breakpointObservable = new Subject<string>();

        breakpointHelper.breakpointChange.and.returnValue(breakpointObservable);
        breakpointHelper.currentBreakpoint.and.returnValue('sm');

        fixture.detectChanges();
    });

    it('should request current user on component bootstrap', () => {
        spyOn(store, 'dispatch').and.callThrough();

        const expectedValue = new UserActions.Request.Current();

        component.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedValue);
    });

    it('should set correct values for userPicture', () => {
        const _embedded = TEST_USER_RESOURCE_REGISTERED._embedded;

        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));
        component.ngOnInit();

        expect(component.userPicture).toBe(_embedded.profilePicture._links.small.href);
    });

    it('should set the dropdown items when current use emits', () => {
        const currentUserObservable = new Subject<UserResource>();

        component.dropdownItems = [];
        when(userQueriesMock.observeCurrentUser()).thenReturn(currentUserObservable);
        component.ngOnInit();

        expect(component.dropdownItems.length).toBe(0);

        currentUserObservable.next(TEST_USER_RESOURCE_REGISTERED);

        expect(component.dropdownItems.length).toBe(3);
    });

    it('should render Profile link with right label', () => {
        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);

        const link: HTMLElement = getDocumentElement(accountMenuProfileSelector);

        expect(link.textContent).toBe('Generic_MyProfileLabel');
    });

    it('should render Terms link with right href and label', () => {
        legalDocumentsListObservable.next(legalDocuments);

        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        const link: HTMLElement = getDocumentElement(accountMenuTermsSelector);

        expect(link.textContent).toBe(MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1.displayName);
        expect(link.getAttribute('href')).toBe(MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1.url);
    });

    it('should render EULA link with right href and label', () => {
        legalDocumentsListObservable.next(legalDocuments);

        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        const link: HTMLElement = getDocumentElement(accountMenuEULASelector);

        expect(link.textContent).toBe(MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2.displayName);
        expect(link.getAttribute('href')).toBe(MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2.url);
    });

    it('should render Privacy Statement link with right href and label', () => {
        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);

        const link: HTMLElement = getDocumentElement(accountMenuPrivacyStatementSelector);

        expect(link.textContent).toBe('Legal_PrivacyStatement_Label');
        expect(link.getAttribute('href')).toBe('Legal_PrivacyStatement_Link');
    });

    it('should render Imprint link with right href and label', () => {
        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);

        const link: HTMLElement = getDocumentElement(accountMenuImprintSelector);

        expect(link.textContent).toBe('Legal_Imprint_Label');
        expect(link.getAttribute('href')).toBe('Legal_Imprint_Link');
    });

    it('should render OSS link with right href and label', () => {
        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);

        const link: HTMLElement = getDocumentElement(accountMenuOSSSelector);

        expect(link.textContent).toBe('Legal_OSSLicenses_Label');
        expect(link.getAttribute('href')).toBe('3rdpartylicenses.txt');
    });

    it('should logout when clicking in logout option', () => {
        const logoutItem: MenuItem = {
            id: LOGOUT_ITEM_ID,
            type: 'button',
        };

        spyOn(authService, 'logout').and.callThrough();

        component.handleItemClicked(logoutItem);

        expect(authService.logout).toHaveBeenCalled();
    });

    it('should call detectChanges when observeCurrentUser emits', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));
        component.ngOnInit();

        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should render and display user guide option on dropdown when viewport is xs', () => {
        const expectedDropDownItensSize = 4;

        breakpointHelper.currentBreakpoint.and.returnValue('xs');
        breakpointObservable.next('xs');
        fixture.detectChanges();

        expect(component.dropdownItems.length).toBe(expectedDropDownItensSize);
    });

    it('should not render and display user guide option on dropdown when viewport is not xs', () => {
        const expectedDropDownItensSize = 3;

        breakpointHelper.currentBreakpoint.and.returnValue('sm');
        breakpointObservable.next('sm');
        fixture.detectChanges();

        expect(component.dropdownItems.length).toBe(expectedDropDownItensSize);
    });

    it(`should display user guide option`, () => {
        const expectedDropDownItensSize = 4;

        breakpointHelper.currentBreakpoint.and.returnValue('xs');
        breakpointObservable.next('xs');
        fixture.detectChanges();

        expect(component.dropdownItems.length).toBe(expectedDropDownItensSize);
    });

    it('should render User Guide with right href and label when is showable', () => {
        breakpointHelper.currentBreakpoint.and.returnValue('xs');
        breakpointObservable.next('xs');
        fixture.detectChanges();

        getDocumentElement(accountMenuButtonSelector).dispatchEvent(clickEvent);

        const link: HTMLElement = getDocumentElement(accountUserGuideSelector);

        expect(link.textContent).toBe('Generic_UserGuide');
        expect(link.getAttribute('href')).toBe('Generic_UserGuide_Link');
    });

    it('should show legal documents on dropdown', () => {
        legalDocumentsListObservable.next(legalDocuments);

        expect(component.dropdownItems[1].items.length).toBe(5);
    });

    it('should not show legal documents on dropdown if there are none', () => {
        legalDocumentsListObservable.next([]);

        expect(component.dropdownItems[1].items.length).toBe(3);
    });
});
