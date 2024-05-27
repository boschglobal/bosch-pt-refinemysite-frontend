/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import {Moment} from 'moment';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../configurations/configuration';
import {FORM_DEBOUNCE_TIME} from '../../../../../test/constants';
import {MOCK_SAVE_PROJECT} from '../../../../../test/mocks/projects';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCardComponent} from '../project-card/project-card.component';
import {ProjectCardContactComponent} from '../project-card-contact/project-card-contact.component';
import {ProjectCaptureComponent} from './project-capture.component';
import {ProjectCaptureModel} from './project-capture.model';

describe('Project Capture Component', () => {
    let fixture: ComponentFixture<ProjectCaptureComponent>;
    let comp: ProjectCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let translateService: TranslateServiceStub;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const testStartDate: Moment = MOCK_SAVE_PROJECT.start;
    const testEndDate: Moment = MOCK_SAVE_PROJECT.end;

    const dataAutomationSelectorCancel = '[data-automation="cancel"]';
    const dataAutomationSelectorSubmit = '[data-automation="submit"]';

    const clickEvent: Event = new Event('click');
    const setFormValues = (formValues: any) => {
        comp.form.get('title').setValue(formValues.title);
        comp.form.get('projectNumber').setValue(formValues.projectNumber);
        comp.form.get('range').setValue({
            start: formValues.start,
            end: formValues.end,
        });
        comp.form.get('address').get('street').setValue(formValues.address.street);
        comp.form.get('address').get('houseNumber').setValue(formValues.address.houseNumber);
        comp.form.get('address').get('zipCode').setValue(formValues.address.zipCode);
        comp.form.get('address').get('city').setValue(formValues.address.city);
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectCaptureComponent,
            ProjectCardContactComponent,
            ProjectCardComponent,
        ],
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
        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);

        fixture = TestBed.createComponent(ProjectCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        fixture.detectChanges();
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);
    });

    it('should set the max size validation of picture in megabytes and bytes', () => {
        expect(comp.validations.picture.maxSize).toBe(MOCK_FILE_SIZE_BYTES);
        expect(comp.validations.picture.maxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
    });

    it('should set project capture form after ngOnInit()', () => {
        comp.form = null;
        comp.ngOnInit();
        expect(comp.form).toBeDefined();
    });

    it('should get \'create\' for capture mode enum 0', () => {
        comp.mode = CaptureModeEnum.create;
        expect(comp.getMode()).toBe('create');
    });

    it('should get \'update\' for capture mode enum 1', () => {
        comp.mode = CaptureModeEnum.update;
        expect(comp.getMode()).toBe('update');
    });

    it('should setup validations and form when \'defaultValues\' @Input changes', () => {
        const defaultCaptureValues: ProjectCaptureModel = {
            picture: null,
            title: '',
            description: '',
            projectNumber: '',
            start: null,
            end: null,
            client: '',
            category: null,
            address: {
                street: '',
                houseNumber: '',
                zipCode: '',
                city: '',
            },
        };
        comp.defaultValues = defaultCaptureValues;
        expect(comp.validations).toBeDefined();
        expect(comp.form).toBeDefined();
    });

    it('should trigger onCancelForm() when cancel form button is clicked', () => {
        spyOn(comp, 'onCancelForm').and.callThrough();
        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.onCancelForm).toHaveBeenCalled();
    });

    it('should submit form when form is valid', fakeAsync(() => {
        const language = 'de';
        const start: Moment = testStartDate.locale(language);
        const end: Moment = testEndDate.add(1, 'day').locale(language);
        translateService.setDefaultLang(language);
        fixture.detectChanges();
        const formValidValues: any = {
            title: 'A',
            projectNumber: '12',
            start,
            end,
            address: {
                street: 'B',
                houseNumber: 'C',
                zipCode: 'D',
                city: 'E',
            },
        };

        spyOn(comp, 'onSubmitForm').and.callThrough();
        setFormValues(formValidValues);
        fixture.detectChanges();
        tick(FORM_DEBOUNCE_TIME);
        el.querySelector(dataAutomationSelectorSubmit).dispatchEvent(clickEvent);
        expect(comp.onSubmitForm).toHaveBeenCalled();
    }));

    it('should not submit form when form is invalid', fakeAsync(() => {
        const language = 'de';
        const start: Moment = testStartDate.locale(language);
        const end: Moment = testEndDate.add(1, 'day').locale(language);
        translateService.setDefaultLang(language);
        fixture.detectChanges();
        const formInvalidValues: any = {
            title: '',
            projectNumber: '12',
            start,
            end,
            address: {
                street: 'B',
                houseNumber: 'C',
                zipCode: 'D',
                city: 'E',
            },
        };

        setFormValues(formInvalidValues);
        fixture.detectChanges();
        tick(FORM_DEBOUNCE_TIME);
        expect(comp.isFormValid()).toBe(false);
    }));
});
