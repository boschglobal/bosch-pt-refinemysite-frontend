/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    CUSTOM_ELEMENTS_SCHEMA,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../../../configurations/configuration';
import {AttachmentHelper} from '../../../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../../../shared/misc/helpers/environment.helper';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {ProjectTaskTopicCaptureComponent} from './project-task-topic-capture.component';
import {ProjectTaskTopicCaptureTestComponent} from './project-task-topic-capture.test.component';

describe('Project Task Topic Capture', () => {
    let fixture: ComponentFixture<ProjectTaskTopicCaptureTestComponent>;
    let comp: ProjectTaskTopicCaptureComponent;
    let testHostComp: ProjectTaskTopicCaptureTestComponent;
    let de: DebugElement;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const projectTaskTopicCaptureComponentSelector = 'ss-project-task-topic-capture';
    const dataAutomationTextInputSelector = '[data-automation="description"]';
    const dataAutomationCancelButtonSelector = '[data-automation="cancel"]';
    const dataAutomationCreateButtonSelector = '[data-automation="create"]';

    const getElement = <T extends HTMLElement>(selector: string): T => de.query(By.css(selector))?.nativeElement;

    const eventFocus: Event = new Event('focus');
    const eventClick: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            CUSTOM_ELEMENTS_SCHEMA,
        ],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectTaskTopicCaptureComponent,
            ProjectTaskTopicCaptureTestComponent,
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
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);

        fixture = TestBed.createComponent(ProjectTaskTopicCaptureTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(projectTaskTopicCaptureComponentSelector));
        comp = de.componentInstance;

        testHostComp.isCollapsed = false;
        fixture.detectChanges();
    });

    it('should set the image max size in bytes and megabytes', () => {
        expect(comp.imageMaxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
        expect(comp.imageMaxSize).toBe(MOCK_FILE_SIZE_BYTES);
    });

    it('should reset the form when cancel button is clicked', () => {
        const oldForm = comp.form;

        getElement(dataAutomationCancelButtonSelector).dispatchEvent(eventClick);
        fixture.detectChanges();

        expect(oldForm).not.toBe(comp.form);
    });

    it('should trigger submitted emit when form is submitted', () => {
        spyOn(comp.submitted, 'emit').and.callThrough();

        comp.onSubmitForm();
        expect(comp.submitted.emit).toHaveBeenCalled();
    });

    it('should trigger canceled when form is cancelled', () => {
        spyOn(comp.canceled, 'emit').and.callThrough();

        comp.handleCancel();
        expect(comp.canceled.emit).toHaveBeenCalled();
    });

    it('should trigger focused when input is focused', () => {
        spyOn(comp.focused, 'emit').and.callThrough();

        getElement(dataAutomationTextInputSelector).dispatchEvent(eventFocus);

        expect(comp.focused.emit).toHaveBeenCalled();
    });

    it('should be uncritical by default', () => {
        expect(comp.form.get('criticality').value).toBe(false);
    });

    it('should disable the create button when the form is invalid', () => {
        comp.form.get('description').setValue('');
        comp.form.get('files').setValue([]);

        expect(getElement<HTMLButtonElement>(dataAutomationCreateButtonSelector).disabled).toBeTruthy();
    });

    it('should enable the create button when the form is valid', () => {
        comp.form.get('description').setValue('foo');
        comp.form.get('files').setValue([]);

        expect(getElement<HTMLButtonElement>(dataAutomationCreateButtonSelector).disabled).toBeFalsy();
    });

    it('should set focus on the description input when the capture is opened and not collapsed', () => {
        spyOn(comp.descriptionInput, 'setFocus');

        comp.isCollapsed = false;
        comp.ngOnInit();

        expect(comp.descriptionInput.setFocus).toHaveBeenCalled();
    });

    it('should not set focus on the description input when the capture is opened and collapsed', () => {
        spyOn(comp.descriptionInput, 'setFocus');

        comp.isCollapsed = true;
        comp.ngOnInit();

        expect(comp.descriptionInput.setFocus).not.toHaveBeenCalled();
    });
});
