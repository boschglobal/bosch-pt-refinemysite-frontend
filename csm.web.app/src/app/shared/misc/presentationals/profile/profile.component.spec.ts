/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';
import {TranslateService} from '@ngx-translate/core';

import {BlobServiceStub} from '../../../../../test/stubs/blob.service.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {
    EmployeeRoleEnum,
    EmployeeRoleEnumHelper
} from '../../../../project/project-common/enums/employee-role.enum';
import {
    CountryEnum,
    countryEnumHelper,
} from '../../../../user/user-common/enums/country.enum';
import {AuthService} from '../../../authentication/services/auth.service';
import {BlobService} from '../../../rest/services/blob.service';
import {
    LanguageEnum,
    LanguageEnumHelper,
} from '../../../translation/helper/language.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {BackgroundImageDirective} from '../../../ui/directives/background-image.directive';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {ModalInterface} from '../../../ui/modal/containers/modal-component/modal.component';
import {PhoneDescriptionEnumHelper} from '../../data/phone-description.enum';
import {ModalIdEnum} from '../../enums/modal-id.enum';
import {GenericBannerComponent} from '../generic-banner/generic-banner.component';
import {ProfileComponent} from './profile.component';
import {ProfileModel} from './profile.model';

describe('Profile Component', () => {
    let fixture: ComponentFixture<ProfileComponent>;
    let comp: ProfileComponent;
    let de: DebugElement;
    let changeDetectorRef: ChangeDetectorRef;
    let authService: AuthService;
    let modalService: ModalService;

    const dataAutomationNoDataFeedbackSelector = '[data-automation="no-data-feedback"]';
    const dataAutomationProfileLanguagePanelSelector = '[data-automation="profile-language-panel"]';
    const dataAutomationUserCountrySelector = '[data-automation="user-country"]';
    const dataAutomationUserLanguageSelector = '[data-automation="user-language"]';
    const dataAutomationSetCountryButtonSelector = '[data-automation="set-country-button"]';
    const dataAutomationSetLanguageButtonSelector = '[data-automation="set-language-button"]';
    const dataAutomationManageSingleKeyIdSelector = '[data-automation="manage-singlekey-id"]';
    const dataAutomationManageSingleKeyIdButtonSelector = '[data-automation="manage-singlekey-id-button"]';
    const dataAutomationOwnUserEmailSelector = '[data-automation="own-user-email"]';
    const dataAutomationOtherUserEmailSelector = '[data-automation="other-user-email"]';
    const dataAutomationPrivacySelector = '[data-automation="privacy"]';
    const dataAutomationChangePrivacyButtonSelector = '[data-automation="change-privacy-settings-button"]';

    const gender = 'Mr';
    const profile: ProfileModel = {
        picture: 'http://abc.com',
        gender,
        name: 'First last',
        position: 'Position',
        role: EmployeeRoleEnum.CSM,
        crafts: 'Craft A, Craft B',
        phoneNumbers: [
            {
                label: 'Ab',
                value: '0',
            },
        ],
        email: 'email@email.com',
    };
    const profileWithCountryAndLanguage: ProfileModel = {
        ...profile,
        locale: LanguageEnum.PT,
        country: CountryEnum.PT,
    };

    const clickEvent: Event = new Event('click');

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            TranslationModule,
            RouterTestingModule,
        ],
        declarations: [
            BackgroundImageDirective,
            GenericBannerComponent,
            ProfileComponent,
        ],
        providers: [
            {
                provide: AuthService,
                useValue: jasmine.createSpyObj('AuthService', ['changePassword']),
            },
            {
                provide: BlobService,
                useClass: BlobServiceStub,
            },
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open']),
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
        fixture = TestBed.createComponent(ProfileComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        authService = TestBed.inject(AuthService);
        modalService = TestBed.inject(ModalService);

        comp.profile = profile;
        comp.ownProfile = false;

        changeDetectorRef.detectChanges();
    });

    it('should have profile defined', () => {
        expect(comp.profileModel).toBeDefined();
    });

    it('should get correct role key', () => {
        const expectedValue = EmployeeRoleEnumHelper.getLabelByKey(comp.profileModel.role);

        expect(comp.getRoleKey).toBe(expectedValue);
    });

    it('should get correct phone type key', () => {
        const phoneNumberIndex = 0;
        const expectedValue = PhoneDescriptionEnumHelper.getLabelByKey('Ab');

        expect(comp.getPhoneTypeKey(profile.phoneNumbers[phoneNumberIndex])).toBe(expectedValue);
    });

    it('should render feedback when user has no data', () => {
        profile.phoneNumbers = [];
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationNoDataFeedbackSelector)).toBeTruthy();
    });

    it('should not render feedback when user has data', () => {
        profile.phoneNumbers = [{
            label: 'Mobile',
            value: '0',
        }];
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationNoDataFeedbackSelector)).toBeFalsy();
    });

    it('should not render clickable email when user is on his own profile page', () => {
        comp.ownProfile = true;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationOwnUserEmailSelector)).toBeTruthy();
        expect(getElement(dataAutomationOtherUserEmailSelector)).toBeFalsy();
    });

    it('should render clickable email when user is not on his profile page', () => {
        expect(getElement(dataAutomationOwnUserEmailSelector)).toBeFalsy();
        expect(getElement(dataAutomationOtherUserEmailSelector)).toBeTruthy();
    });

    it('should show language panel when ownProfile is true', () => {
        comp.ownProfile = true;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationProfileLanguagePanelSelector)).toBeTruthy();
    });

    it('should not show language panel when ownProfile is false', () => {
        comp.ownProfile = false;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationProfileLanguagePanelSelector)).toBeFalsy();
    });

    it('should show user country when user has a country specified', () => {
        const expectedCountry = countryEnumHelper.getLabelByValue(profileWithCountryAndLanguage.country);

        comp.ownProfile = true;
        comp.profile = profileWithCountryAndLanguage;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationSetCountryButtonSelector)).toBeFalsy();
        expect(getElement(dataAutomationUserCountrySelector).innerText).toBe(expectedCountry);
    });

    it('should show Set Country button when user has no country specified', () => {
        comp.ownProfile = true;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationUserCountrySelector)).toBeFalsy();
        expect(getElement(dataAutomationSetCountryButtonSelector)).toBeTruthy();
    });

    it('should show user language when user has a language specified', () => {
        const expectedLanguage = LanguageEnumHelper.getLabelByValue(profileWithCountryAndLanguage.locale);

        comp.ownProfile = true;
        comp.profile = profileWithCountryAndLanguage;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationSetLanguageButtonSelector)).toBeFalsy();
        expect(getElement(dataAutomationUserLanguageSelector).innerText).toBe(expectedLanguage);
    });

    it('should show Set Language button when user has no language specified', () => {
        comp.ownProfile = true;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationUserLanguageSelector)).toBeFalsy();
        expect(getElement(dataAutomationSetLanguageButtonSelector)).toBeTruthy();
    });

    it('should show single key id section when ownProfile is enabled', () => {
        comp.ownProfile = true;
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationManageSingleKeyIdSelector)).toBeTruthy();
    });

    it('should not show single key id section when ownProfile is disabled', () => {
        comp.ownProfile = false;
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationManageSingleKeyIdSelector)).toBeFalsy();
    });

    it('should call changePassword when manage single key id button is clicked', () => {
        comp.ownProfile = true;
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        getElement(dataAutomationManageSingleKeyIdButtonSelector).dispatchEvent(clickEvent);

        expect(authService.changePassword).toHaveBeenCalled();
    });

    it('should show privacy section when ownProfile is enabled', () => {
        comp.ownProfile = true;
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationPrivacySelector)).toBeTruthy();
    });

    it('should not show privacy section when ownProfile is disabled', () => {
        comp.ownProfile = false;
        comp.profile = profile;

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationPrivacySelector)).toBeFalsy();
    });

    it('should open privacy settings modal when change privacy settings button is clicked', () => {
        comp.ownProfile = true;
        comp.profile = profile;
        const expectedModalConfig: ModalInterface = {
            id: ModalIdEnum.PrivacySettings,
            data: null,
        };

        changeDetectorRef.detectChanges();

        getElement(dataAutomationChangePrivacyButtonSelector).dispatchEvent(clickEvent);

        expect(modalService.open).toHaveBeenCalledWith(expectedModalConfig);
    });
});
