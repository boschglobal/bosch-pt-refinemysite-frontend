/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    of,
    Subject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../configurations/configuration';
import {
    CRAFT_RESOURCE_MOCK,
    CRAFT_RESOURCE_MOCK_B
} from '../../../../../test/mocks/crafts';
import {
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2
} from '../../../../../test/mocks/user-legal-documents';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {AuthService} from '../../../../shared/authentication/services/auth.service';
import {CraftSliceService} from '../../../../shared/master-data/store/crafts/craft-slice.service';
import {PhoneNumber} from '../../../../shared/misc/api/datatypes/phone-number.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {LanguageEnum} from '../../../../shared/translation/helper/language.enum';
import {TranslateHelper} from '../../../../shared/translation/helper/translate.helper';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {WizardStepsComponent} from '../../../../shared/ui/wizard-steps/wizard-steps.component';
import {SaveUserResource} from '../../../../user/api/resources/save-user.resource';
import {LegalDocumentResource} from '../../../../user/api/resources/user-legal-documents.resource';
import {LegalDocumentsActions} from '../../../../user/store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';
import {UserActions} from '../../../../user/store/user/user.actions';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {
    CountryEnum,
    countryEnumHelper,
} from '../../../../user/user-common/enums/country.enum';
import {
    SignupComponent,
    SignUpWizardStepsEnum
} from './signup.component';

describe('Signup Component', () => {
    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    let fixture: ComponentFixture<SignupComponent>;
    let comp: SignupComponent;
    let userQueries: UserQueries;
    let craftSliceService: CraftSliceService;
    let authService: AuthService;
    let legalDocumentsQueries: LegalDocumentsQueries;
    let store: Store<any>;
    let router: Router;
    let translateService: TranslateService;
    let translateHelper: jasmine.SpyObj<TranslateHelper>;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            UntypedFormBuilder,
            {
                provide: AttachmentHelper,
                useFactory: () => instance(attachmentHelper),
            },
            {
                provide: AuthService,
                useValue: instance(mock(AuthService)),
            },

            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelper),
            },
            {
                provide: Store,
                useValue: instance(mock(Store)),
            },
            {
                provide: Router,
                useValue: instance(mock(Router)),
            },
            {
                provide: UserQueries,
                useValue: instance(mock(UserQueries)),
            },
            {
                provide: LegalDocumentsQueries,
                useValue: instance(mock(LegalDocumentsQueries)),
            },
            {
                provide: CraftSliceService,
                useValue: instance(mock(CraftSliceService)),
            },
            {
                provide: TranslateHelper,
                useValue: jasmine.createSpyObj('TranslateHelper', ['configLanguage']),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: WizardStepsComponent,
                useValue: jasmine.createSpyObj('WizardStepsComponent', ['advanceStep', 'regressStep']),
            },
        ],
        declarations: [
            SignupComponent,
            WizardStepsComponent,
        ],
    };

    const craftList = [CRAFT_RESOURCE_MOCK, CRAFT_RESOURCE_MOCK_B];
    const countryOptions = countryEnumHelper.getSelectOptions();
    const formValue = {
        gender: 'male',
        firstName: 'firstName',
        lastName: 'lastName',
        position: 'position',
        crafts: ['craftId1', 'craftId2'],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        EULA: true,
        profilePicture: new File([], 'profilepicture'),
        language: LanguageEnum.PT,
        country: countryEnumHelper.getLabelByValue(CountryEnum.PT),
    };
    const formValueWithoutEULA = {
        gender: 'male',
        firstName: 'firstName',
        lastName: 'lastName',
        position: 'position',
        crafts: ['craftId1', 'craftId2'],
        profilePicture: new File([], 'profilepicture'),
        language: LanguageEnum.PT,
        country: countryEnumHelper.getLabelByValue(CountryEnum.PT),
    };
    const legalDocuments = [MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1, MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2];
    const legalDocumentsRequestStatusStream = new Subject();
    const legalDocumentsListObservable = new Subject<LegalDocumentResource[]>();
    const phoneNumbers = [
        {
            type: 'type1',
            countryCode: 'countryCode1',
            // eslint-disable-next-line id-blacklist
            number: '123',
        },
        {
            type: 'type2',
            countryCode: 'countryCode2',
            // eslint-disable-next-line id-blacklist
            number: '456',
        },
    ];
    const requestStatusStream = new Subject();

    const createSaveUserResource = (form: any, phones: any[]): SaveUserResource => {
        const data = new SaveUserResource();
        const country = countryOptions.find(({label}) => form.country === label)?.value;

        data.gender = form.gender;
        data.firstName = form.firstName;
        data.lastName = form.lastName;
        data.position = form.position;
        data.eulaAccepted = form.EULA || false;
        data.craftIds = form.crafts;
        data.phoneNumbers = phones.map(phone => new PhoneNumber(phone.countryCode, phone.number, phone.type));
        data.locale = form.language;
        data.country = country;

        return data;
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SignupComponent);
        comp = fixture.componentInstance;

        userQueries = TestBed.inject(UserQueries);
        legalDocumentsQueries = TestBed.inject(LegalDocumentsQueries);
        craftSliceService = TestBed.inject(CraftSliceService);
        authService = TestBed.inject(AuthService);
        store = TestBed.inject(Store);
        router = TestBed.inject(Router);
        translateHelper = TestBed.inject(TranslateHelper) as jasmine.SpyObj<TranslateHelper>;
        translateService = TestBed.inject(TranslateService);

        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);

        spyOn(userQueries, 'observeCurrentUserRequestStatus').and.returnValue(requestStatusStream);
        spyOn(legalDocumentsQueries, 'observeLegalDocumentsRequestStatus').and.returnValue(legalDocumentsRequestStatusStream);
        spyOn(legalDocumentsQueries, 'observeLegalDocumentsList').and.returnValue(legalDocumentsListObservable);
        spyOn(craftSliceService, 'observeCraftList').and.returnValue(of(craftList));
        translateHelper.configLanguage.calls.reset();

        // reset form values
        comp.ngOnInit();
        comp.onChangeProfilePicture(null);
        comp.onChangePhones({value: [], valid: true});
        comp.activeStep = 0;
        requestStatusStream.next(RequestStatusEnum.empty);
        legalDocumentsRequestStatusStream.next(RequestStatusEnum.empty);
        legalDocumentsListObservable.next(legalDocuments);

        fixture.detectChanges();
    });

    it('should create component', () => {
        expect(comp).toBeDefined();
    });

    it('should set the max size validation of picture in megabytes and bytes', () => {
        expect(comp.validations.profilePicture.maxSize).toBe(MOCK_FILE_SIZE_BYTES);
        expect(comp.validations.profilePicture.maxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
    });

    it('should set default picture when custom picture not set', () => {
        comp.isProfilePictureDefault = false;
        comp.onChangeProfilePicture(null);

        expect(comp.profileDefaultPicture).toBe('/assets/images/user/neutral.png');
        expect(comp.isProfilePictureDefault).toBeTruthy();
    });

    it('should not set default picture when custom picture set', () => {
        comp.profileDefaultPicture = 'dummyDefaultPicture';
        comp.onChangeProfilePicture({} as Blob);

        expect(comp.profileDefaultPicture).toBe('dummyDefaultPicture');
    });

    it('should create user with form data', () => {
        const expectedSaveUserResource = createSaveUserResource(formValue, phoneNumbers);
        const legalDocumentListIds = legalDocuments.map(document => document.id);
        const expectedAction = new UserActions.Create.One(expectedSaveUserResource, legalDocumentListIds);

        spyOn(store, 'dispatch').and.callThrough();

        comp.onChangePhones({
            value: phoneNumbers,
            valid: true,
        });

        comp.onSubmitForm(formValue);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should create user with form data with custom picture', () => {
        const expectedSaveUserResource = createSaveUserResource(formValue, []);
        const picture = new File([], 'profilePicture');
        const legalDocumentListIds = legalDocuments.map(document => document.id);
        const expectedAction = new UserActions.Create.One(expectedSaveUserResource, legalDocumentListIds, picture);

        spyOn(store, 'dispatch').and.callThrough();

        comp.onChangeProfilePicture(picture);
        comp.onSubmitForm(formValue);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should return an invalid form if phonegroup is not defined', () => {
        comp.onChangePhones(null);
        expect(comp.isFormValid()).toBeFalsy();
    });

    it('should return an invalid form if phonegroup is invalid', () => {
        comp.onChangePhones({value: [], valid: false});
        expect(comp.isFormValid()).toBeFalsy();
    });

    it('should return an invalid form if form is invalid', () => {
        comp.signupForm = {valid: false} as UntypedFormGroup;
        expect(comp.isFormValid()).toBeFalsy();
    });

    it('should return a valid form if form and phonegroup are valid', () => {
        comp.signupForm = {valid: true} as UntypedFormGroup;
        comp.onChangePhones({value: [], valid: true});
        expect(comp.isFormValid()).toBeTruthy();
    });

    it('should logout when cancel signup form', () => {
        spyOn(authService, 'logout').and.callThrough();
        comp.cancelSignUp();

        expect(authService.logout).toHaveBeenCalled();
    });

    it('should not change the active step to the second step if the first is invalid', () => {
        comp.activeStep = 0;
        comp.signupForm = {
            controls: {
                firstName: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
                lastName: {
                    valid: false,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;

        spyOn(comp.signupForm.controls.firstName, 'markAsTouched');
        spyOn(comp.signupForm.controls.lastName, 'markAsTouched');

        comp.handleNext();

        expect(comp.activeStep).toBe(0);
        expect(comp.signupForm.controls.firstName.markAsTouched).not.toHaveBeenCalled();
        expect(comp.signupForm.controls.lastName.markAsTouched).toHaveBeenCalled();
    });

    it('should not change the active step to the third step if the second is invalid', () => {
        comp.activeStep = 1;
        comp.signupForm = {
            controls: {
                country: {
                    valid: false,
                    markAsTouched: () => {
                    },
                },
                language: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;

        spyOn(comp.signupForm.controls.country, 'markAsTouched');
        spyOn(comp.signupForm.controls.language, 'markAsTouched');

        comp.handleNext();

        expect(comp.activeStep).toBe(1);
        expect(comp.signupForm.controls.country.markAsTouched).toHaveBeenCalled();
        expect(comp.signupForm.controls.language.markAsTouched).not.toHaveBeenCalled();
    });

    it('should show loading when current user request status in progress', () => {
        requestStatusStream.next(RequestStatusEnum.progress);

        expect(comp.isRequesting).toBeTruthy();
    });

    it('should not show loading when current user request status is not in progress', () => {
        requestStatusStream.next(RequestStatusEnum.success);

        expect(comp.isRequesting).toBeFalsy();
    });

    it('should navigate to homepage when current user request status is success', () => {
        spyOn(router, 'navigate').and.callThrough();

        requestStatusStream.next(RequestStatusEnum.success);

        expect(router.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should change the app language when the user is on the second step and clicks next', () => {
        comp.activeStep = SignUpWizardStepsEnum.LanguageAndCountryStep;

        const countryCode = CountryEnum.CA;
        const country = countryEnumHelper.getLabelByValue(countryCode);
        const language = LanguageEnum.FR;
        const cultureLanguage = `${language}-${countryCode}`;

        comp.signupForm.get('language').setValue(language);
        comp.signupForm.get('country').setValue(country);

        comp.handleNext();

        expect(translateHelper.configLanguage).toHaveBeenCalledWith(language, cultureLanguage);
    });

    it('should not change the app language when language input is not filled and country input changes', () => {
        const countryCode = CountryEnum.CA;
        const country = countryEnumHelper.getLabelByValue(countryCode);

        comp.signupForm.get('country').setValue(country);

        expect(translateHelper.configLanguage).not.toHaveBeenCalled();
    });

    it('should change the country list when language changes', () => {
        const countryLabels = comp.countryLabels;

        translateService.setDefaultLang(LanguageEnum.PT);

        expect(comp.countryLabels).not.toBe(countryLabels);
    });

    it('should update the country input value when language changes and the input has a valid country', () => {
        const countryCode = CountryEnum.CA;
        const countryInEN = `EN_${countryEnumHelper.getLabelByValue(countryCode)}`;
        const countryInPT = `PT_${countryEnumHelper.getLabelByValue(countryCode)}`;
        const instantSpy = spyOn(translateService, 'instant').and.callFake((val) => `EN_${val}`);

        comp.ngOnInit();
        comp.signupForm.get('country').setValue(countryInEN);
        instantSpy.and.callFake((val) => `PT_${val}`);

        spyOn(comp.signupForm.get('country'), 'clearValidators').and.callThrough();
        spyOn(comp.signupForm.get('country'), 'setValidators').and.callThrough();
        spyOn(comp.signupForm.get('country'), 'setValue').and.callThrough();

        translateService.setDefaultLang(LanguageEnum.PT);

        expect(comp.signupForm.get('country').clearValidators).toHaveBeenCalled();
        expect(comp.signupForm.get('country').setValue).toHaveBeenCalledWith(countryInPT, {emitEvent: false});
        expect(comp.signupForm.get('country').setValidators).toHaveBeenCalled();
    });

    it('should not update the country input value when language changes and the input does not have a valid country', () => {
        const country = '123';

        comp.ngOnInit();
        comp.signupForm.get('country').setValue(country);

        spyOn(comp.signupForm.get('country'), 'setValue').and.callThrough();
        translateService.setDefaultLang(LanguageEnum.PT);

        expect(comp.signupForm.get('country').setValue).toHaveBeenCalledWith(country, {emitEvent: false});
    });

    it('should advance step if form is valid and activeStep is SignUpWizardStepsEnum.PersonalInfoStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        comp.activeStep = SignUpWizardStepsEnum.PersonalInfoStep;
        comp.signupForm = {
            controls: {
                firstName: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
                lastName: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;
        comp.handleNext();

        expect(comp.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should advance step if form is not valid and activeStep is SignUpWizardStepsEnum.PersonalInfoStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        comp.activeStep = SignUpWizardStepsEnum.PersonalInfoStep;
        comp.signupForm = {
            controls: {
                firstName: {
                    valid: false,
                    markAsTouched: () => {
                    },
                },
                lastName: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;
        comp.handleNext();

        expect(comp.wizardStepsComponent.advanceStep).not.toHaveBeenCalled();
    });

    it('should advance step if form is valid, legal documents service was successful' +
        'and activeStep is SignUpWizardStepsEnum.LanguageAndCountryStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        comp.activeStep = SignUpWizardStepsEnum.LanguageAndCountryStep;
        comp.signupForm = {
            controls: {
                language: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
                country: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;
        comp.handleNext();

        legalDocumentsRequestStatusStream.next(RequestStatusEnum.success);

        expect(comp.wizardStepsComponent.advanceStep).toHaveBeenCalled();
    });

    it('should not advance step if legal documents request was successful ' +
        'but activeStep is not LanguageAndCountryStep.LanguageAndCountryStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        comp.activeStep = SignUpWizardStepsEnum.JobInfoStep;
        legalDocumentsRequestStatusStream.next(RequestStatusEnum.success);

        expect(comp.wizardStepsComponent.advanceStep).not.toHaveBeenCalled();
    });

    it('should not advance step if form is valid, legal documents service failed' +
        'and activeStep is SignUpWizardStepsEnum.LanguageAndCountryStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        legalDocumentsRequestStatusStream.next(RequestStatusEnum.error);

        comp.activeStep = SignUpWizardStepsEnum.LanguageAndCountryStep;
        comp.signupForm = {
            controls: {
                language: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
                country: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;
        comp.handleNext();

        expect(comp.wizardStepsComponent.advanceStep).not.toHaveBeenCalled();
    });

    it('should not advance step if form is not valid and activeStep is SignUpWizardStepsEnum.LanguageAndCountryStep', () => {
        spyOn(comp.wizardStepsComponent, 'advanceStep');

        comp.activeStep = SignUpWizardStepsEnum.LanguageAndCountryStep;
        comp.signupForm = {
            controls: {
                language: {
                    valid: false,
                    markAsTouched: () => {
                    },
                },
                country: {
                    valid: true,
                    markAsTouched: () => {
                    },
                },
            },
        } as any;
        comp.handleNext();

        expect(comp.wizardStepsComponent.advanceStep).not.toHaveBeenCalled();
    });

    it('should call regressStep when handleBack is called', () => {
        spyOn(comp.wizardStepsComponent, 'regressStep');
        comp.handleBack();

        expect(comp.wizardStepsComponent.regressStep).toHaveBeenCalled();
    });

    it('should set wizardSteps with the provided value when handleWizardStepsChange is called', () => {
        const wizardSteps = comp.wizardSteps;

        comp.wizardSteps = [];
        comp.handleWizardStepsChange(wizardSteps);

        expect(comp.wizardSteps).toBe(wizardSteps);
    });

    it('should set the activeStep to the active step when handleWizardStepsChange is called', () => {
        const activeStep = SignUpWizardStepsEnum.PersonalInfoStep;
        const wizardSteps = comp.wizardSteps.map(step => ({...step, active: false}));

        wizardSteps[activeStep].active = true;
        comp.handleWizardStepsChange(wizardSteps);

        expect(comp.activeStep).toBe(activeStep);
    });

    it('should disable JobInformationStep if LanguageAndCountryStep form is not valid', () => {
        const countryCode = CountryEnum.CA;
        const country = countryEnumHelper.getLabelByValue(countryCode);
        const language = LanguageEnum.FR;

        comp.activeStep = SignUpWizardStepsEnum.PersonalInfoStep;
        comp.signupForm.get('firstName').setValue('Ze');
        comp.signupForm.get('lastName').setValue('Maria');

        comp.handleNext();
        expect(comp.wizardSteps[2].disabled).toBeTruthy();

        comp.signupForm.get('language').setValue(language);
        comp.signupForm.get('country').setValue(country);

        comp.handleNext();
        legalDocumentsRequestStatusStream.next(RequestStatusEnum.success);
        expect(comp.wizardSteps[2].disabled).toBeFalsy();

        comp.handleBack();
        comp.signupForm.get('language').setValue('');

        expect(comp.wizardSteps[2].disabled).toBeTruthy();
    });

    it('should disable LanguageAndCountryStep if PersonalInfoStep form is not valid', () => {
        comp.activeStep = SignUpWizardStepsEnum.PersonalInfoStep;

        expect(comp.wizardSteps[1].disabled).toBeTruthy();

        comp.signupForm.get('firstName').setValue('Ze');
        comp.signupForm.get('lastName').setValue('Maria');

        comp.handleNext();
        expect(comp.wizardSteps[1].disabled).toBeFalsy();

        comp.handleBack();
        comp.signupForm.get('firstName').setValue('');

        expect(comp.wizardSteps[1].disabled).toBeTruthy();
    });

    it('should request unregistered legal documents when going to the third step', () => {
        const countryCode = CountryEnum.CA;
        const country = countryEnumHelper.getLabelByValue(countryCode);
        const language = LanguageEnum.FR;
        const expectedAction = new LegalDocumentsActions.Request.UnregisteredAll(countryCode, language);

        spyOn(store, 'dispatch').and.callThrough();

        comp.activeStep = SignUpWizardStepsEnum.LanguageAndCountryStep;

        comp.signupForm.get('language').setValue(language);
        comp.signupForm.get('country').setValue(country);

        comp.handleNext();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set legalDocumentsList to be equal to the value of the query', () => {
        legalDocumentsListObservable.next(legalDocuments);

        expect(comp.legalDocumentsList).toBe(legalDocuments);
    });

    it('should show loader when is retrieving legal documents', () => {
        legalDocumentsRequestStatusStream.next(RequestStatusEnum.progress);

        expect(comp.isRequestingLegalDocuments).toBeTruthy();
    });

    it('should not show the loader when the service that returns the legal documents has already been successful', () => {
        legalDocumentsRequestStatusStream.next(RequestStatusEnum.success);

        expect(comp.isRequestingLegalDocuments).toBeFalsy();
    });

    it('should dispatch action with eulaAccepted as false when there is no eulaAccepted on the form', () => {
        const expectedSaveUserResource = createSaveUserResource(formValueWithoutEULA, []);
        const legalDocumentListIds = legalDocuments.map(document => document.id);
        const expectedAction = new UserActions.Create.One(expectedSaveUserResource, legalDocumentListIds);

        spyOn(store, 'dispatch').and.callThrough();

        comp.onSubmitForm(formValueWithoutEULA);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });
});
