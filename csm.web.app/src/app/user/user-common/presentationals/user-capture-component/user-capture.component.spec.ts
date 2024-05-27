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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    TranslateModule,
    TranslateService
} from '@ngx-translate/core';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../configurations/configuration';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {LanguageEnum} from '../../../../shared/translation/helper/language.enum';
import {UIModule} from '../../../../shared/ui/ui.module';
import {
    CountryEnum,
    countryEnumHelper,
} from '../../enums/country.enum';
import {UserCaptureComponent} from './user-capture.component';
import {UserCaptureModel} from './user-capture.model';

describe('User Capture Component', () => {
    let fixture: ComponentFixture<UserCaptureComponent>;
    let comp: UserCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);

    const emptyDefaultValues: UserCaptureModel = {
        picture: null,
        gender: '',
        firstName: '',
        lastName: '',
        position: '',
        crafts: [],
        phoneNumbers: [],
        email: '',
    };
    const validDefaultValues: UserCaptureModel = {
        picture: null,
        gender: 'MALE',
        firstName: 'Daniel',
        lastName: 'Oliveira',
        position: 'Under the bridge',
        crafts: ['1', '2'],
        phoneNumbers: [
            {
                type: 'FAX',
                countryCode: '+44',
                // eslint-disable-next-line id-blacklist
                number: '123456789',
            },
            {
                type: 'MOBILE',
                countryCode: '+351',
                // eslint-disable-next-line id-blacklist
                number: '910414293',
            },
        ],
        email: '',
        locale: LanguageEnum.PT,
        country: CountryEnum.PT,
    };

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const dataAutomationCancelSelector = '[data-automation="cancel"]';
    const clickEvent: Event = new Event('click');

    const getElement = (element: string): Element => el.querySelector(element);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslateModule,
        ],
        declarations: [UserCaptureComponent],
        providers: [
            {
                provide: AttachmentHelper,
                useFactory: () => instance(attachmentHelper),
            },
            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelper),
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
        fixture = TestBed.createComponent(UserCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);

        comp.ngOnInit();
    });

    it('should set the max size validation of picture in megabytes and bytes', () => {
        expect(comp.validations.picture.maxSize).toBe(MOCK_FILE_SIZE_BYTES);
        expect(comp.validations.picture.maxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
    });

    it('should set user capture model', () => {
        expect(comp.userCaptureModel).toBeUndefined();

        comp.defaultValues = emptyDefaultValues;

        expect(comp.userCaptureModel).toBeDefined();
    });

    it('should emit onCancel when cancel is clicked', () => {
        spyOn(comp.onCancel, 'emit').and.callThrough();

        comp.defaultValues = emptyDefaultValues;
        fixture.detectChanges();

        getElement(dataAutomationCancelSelector).dispatchEvent(clickEvent);

        expect(comp.onCancel.emit).toHaveBeenCalled();
    });

    it('should emit onSubmit when form submit is submitted', () => {
        const country = CountryEnum.US;
        const language = LanguageEnum.ES;
        const countryLabel = countryEnumHelper.getLabelByValue(country);
        const expectedPayload: UserCaptureModel = {
            ...validDefaultValues,
            country,
            locale: language,
        };

        delete expectedPayload.email;

        spyOn(comp.onSubmit, 'emit').and.callThrough();

        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();

        comp.onChangePhones({valid: true, value: comp.userCaptureModel.phoneNumbers});
        comp.form.get('country').setValue(countryLabel);
        comp.form.get('language').setValue(language);
        fixture.detectChanges();

        comp.onSubmitForm();

        expect(comp.onSubmit.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should not change profile default picture', () => {
        const picture: File = new File([''], 'filename');

        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();
        comp.profileDefaultPicture = undefined;
        comp.form.get('picture').setValue(picture);

        comp.onChangePicture(picture);

        expect(comp.profileDefaultPicture).toBeUndefined();
    });

    it('should set user country input when user has a country specified', () => {
        const expectedCountry = countryEnumHelper.getLabelByValue(validDefaultValues.country);

        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();

        expect(comp.form.get('country').value).toBe(expectedCountry);
    });

    it('should not set user country input when user has no country specified', () => {
        const defaultValuesWithoutCountry: UserCaptureModel = {
            ...validDefaultValues,
            country: undefined,
        };

        comp.defaultValues = defaultValuesWithoutCountry;
        fixture.detectChanges();

        expect(comp.form.get('country').value).toBeNull();
    });

    it('should not create the form when userCaptureModel is not set', () => {
        comp.ngOnInit();

        expect(comp.form).not.toBeDefined();

        comp.defaultValues = validDefaultValues;

        expect(comp.form).toBeDefined();
    });

    it('should setup validations and form when \'defaultValues\' @Input changes', () => {
        comp.defaultValues = emptyDefaultValues;
        expect(comp.validations).toBeDefined();
        expect(comp.form).toBeDefined();
    });

    it('should focus on the country input when focus attribute is set to country', () => {
        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();

        spyOn(comp.countryInput, 'setFocus');
        spyOn(comp.languageInput, 'setFocus');

        comp.focus = 'country';
        comp.ngAfterViewInit();

        expect(comp.countryInput.setFocus).toHaveBeenCalled();
        expect(comp.languageInput.setFocus).not.toHaveBeenCalled();
    });

    it('should focus on the language input when focus attribute is set to language', () => {
        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();

        spyOn(comp.countryInput, 'setFocus');
        spyOn(comp.languageInput, 'setFocus');

        comp.focus = 'language';
        comp.ngAfterViewInit();

        expect(comp.countryInput.setFocus).not.toHaveBeenCalled();
        expect(comp.languageInput.setFocus).toHaveBeenCalled();
    });

    it('should not focus on any input when focus attribute is not set', () => {
        comp.defaultValues = validDefaultValues;
        fixture.detectChanges();

        spyOn(comp.countryInput, 'setFocus');
        spyOn(comp.languageInput, 'setFocus');

        comp.focus = undefined;
        comp.ngAfterViewInit();

        expect(comp.countryInput.setFocus).not.toHaveBeenCalled();
        expect(comp.languageInput.setFocus).not.toHaveBeenCalled();
    });
});
