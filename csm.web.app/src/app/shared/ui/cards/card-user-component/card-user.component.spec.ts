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

import {BlobServiceMock} from '../../../../../test/mocks/blob.service.mock';
import {UserStatusEnum} from '../../../../project/project-common/enums/user-status.enum';
import {ResourceReference} from '../../../misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {BlobService} from '../../../rest/services/blob.service';
import {TranslationModule} from '../../../translation/translation.module';
import {BackgroundImageDirective} from '../../directives/background-image.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MailLinkComponent} from '../../links/mail-link/mail-link-component/mail-link.component';
import {PhoneLinkComponent} from '../../links/phone-link/phone-link-component/phone-link.component';
import {
    CardUserComponent,
    CardUserSize
} from './card-user.component';

describe('Card User Component', () => {
    let fixture: ComponentFixture<CardUserComponent>;
    let comp: CardUserComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let flyoutService: FlyoutService;

    const testDataUserName = 'Test user';
    const testDataCompanyName = 'Test company';
    const testDataUser: ResourceReferenceWithPicture = {
        id: '123',
        displayName: testDataUserName,
        picture: '',
    };
    const testUserStatusActive = UserStatusEnum.ACTIVE;
    const testDataCompany: ResourceReference = {
        id: '123',
        displayName: testDataCompanyName,
    };
    const testDataEmail = 'foo@bar.com';
    const testDataPhone = '+351 666000';

    const dataAutomationPictureSelector = '[data-automation="card-picture"]';
    const dataAutomationInformationSelector = '[data-automation="card-information"]';
    const dataAutomationTitleSelector = '[data-automation="card-title"]';
    const dataAutomationDescriptionSelector = '[data-automation="card-description"]';
    const dataAutomationContactSelector = '[data-automation="card-contact"]';
    const dataAutomationContactEmailSelector = '[data-automation="card-contact-email"]';
    const dataAutomationContactPhoneSelector = '[data-automation="card-contact-phone"]';
    const dataAutomationAltTitleSelector = '[data-automation="alternative-card-title"]';
    const dataAutomationTooltipSelector = '[data-automation="card-tooltip-info-button"]';
    const dataAutomationUserNotActiveIconSelector = '[data-automation="card-picture-not-active"]';

    const getElement = (selector: string): Element => el.querySelector(selector);
    const getElementTrimmed = (selector: string): string => getElement(selector).textContent.trim();

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            BackgroundImageDirective,
            CardUserComponent,
            MailLinkComponent,
            PhoneLinkComponent,
        ],
        providers: [
            {
                provide: BlobService,
                useValue: new BlobServiceMock(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CardUserComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        flyoutService = TestBed.inject(FlyoutService);

        comp.user = testDataUser;
        comp.status = testUserStatusActive;
        fixture.detectChanges();
    });

    it('should check user name has the received input', () => {
        expect(comp.getTitle()).toBe(testDataUserName);
    });

    it('should check if user name is rendered', () => {
        expect(getElementTrimmed(dataAutomationTitleSelector)).toBe(testDataUserName);
    });

    it('should render company name on title when company is set', () => {
        comp.company = testDataCompany;
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationTitleSelector)).toBe(testDataCompanyName);
    });

    it('should render user name on description when company is set', () => {
        comp.company = testDataCompany;
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationDescriptionSelector)).toBe(testDataUserName);
    });

    it('should not render contact by default', () => {
        expect(getElement(dataAutomationContactSelector)).toBeNull();
    });

    it('should render contact email when size is set to "large" and has "email"', () => {
        comp.email = testDataEmail;
        comp.size = 'large';
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationContactEmailSelector)).toBe(testDataEmail);
    });

    it('should render contact phone when size is set to "large" and has "phone"', () => {
        comp.phone = testDataPhone;
        comp.size = 'large';
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationContactPhoneSelector)).toBe(testDataPhone);
    });

    it('should render both contact phone and email when size is set to "large" and has "phone" and "email"', () => {
        comp.phone = testDataPhone;
        comp.email = testDataEmail;
        comp.size = 'large';
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationContactEmailSelector)).toBe(testDataEmail);
        expect(getElementTrimmed(dataAutomationContactPhoneSelector)).toBe(testDataPhone);
    });

    it('should render the correct css class modifier according to the size', () => {
        const hasCssClassModifier = (selector: string, styleClass: string, cardSize: string): boolean => {
            const cssClassModifier = `${styleClass}--${cardSize}`;
            return getElement(selector).classList.contains(cssClassModifier);
        };

        let size: CardUserSize;
        let cssClass: string;

        cssClass = 'ss-card-user__picture';
        size = 'small';
        comp.size = size;
        fixture.detectChanges();

        expect(hasCssClassModifier(dataAutomationPictureSelector, cssClass, size)).toBeTruthy();

        cssClass = 'ss-card-user__information';
        size = 'normal';
        comp.size = size;
        fixture.detectChanges();

        expect(hasCssClassModifier(dataAutomationInformationSelector, cssClass, size)).toBeTruthy();
    });

    it('should render contact phone when size is set to "large" and has "phone"', () => {
        comp.phone = testDataPhone;
        comp.size = 'large';
        fixture.detectChanges();
        expect(getElementTrimmed(dataAutomationContactPhoneSelector)).toBe(testDataPhone);
    });

    it('should render default picture and title for non-active users', () => {
        comp.status = UserStatusEnum.VALIDATION;
        comp.company = testDataCompany;

        fixture.detectChanges();

        expect(getElement(dataAutomationPictureSelector)).toBeFalsy();
        expect(getElement(dataAutomationUserNotActiveIconSelector)).toBeTruthy();
        expect(getElement(dataAutomationAltTitleSelector)).toBeTruthy();
    });

    it('should render tooltip for Invited status', () => {
        comp.status = UserStatusEnum.INVITED;
        comp.company = testDataCompany;

        fixture.detectChanges();

        expect(getElement(dataAutomationTooltipSelector)).toBeTruthy();
    });

    it('should render tooltip for Validation status', () => {
        comp.status = UserStatusEnum.VALIDATION;
        comp.company = testDataCompany;

        fixture.detectChanges();

        expect(getElement(dataAutomationTooltipSelector)).toBeTruthy();
    });

    it('should open flyout after tooltip click', () => {
        spyOn(flyoutService, 'open');
        comp.status = UserStatusEnum.INVITED;
        comp.company = testDataCompany;

        fixture.detectChanges();
        getElement(dataAutomationTooltipSelector).dispatchEvent(clickEvent);
        expect(getElement(dataAutomationTooltipSelector)).toBeTruthy();
        expect(flyoutService.open).toHaveBeenCalledWith('ssUserStatusTooltip-123');
    });
});
