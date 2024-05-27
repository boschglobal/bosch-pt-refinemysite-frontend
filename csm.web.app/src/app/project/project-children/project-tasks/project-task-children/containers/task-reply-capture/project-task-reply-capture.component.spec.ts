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
    TestBed
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    of,
    Subject,
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../../../configurations/configuration';
import {MOCK_TOPIC_1} from '../../../../../../../test/mocks/task-topics';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../../../test/mocks/user';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {AttachmentHelper} from '../../../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../../../shared/misc/helpers/environment.helper';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {UserQueries} from '../../../../../../user/store/user/user.queries';
import {SaveMessageResource} from '../../../../../project-common/api/messages/resources/save-message.resource';
import {MessageQueries} from '../../../../../project-common/store/messages/message.queries';
import {ProjectTaskReplyCaptureComponent} from './project-task-reply-capture.component';

describe('Project Task Reply Capture Component', () => {
    let comp: ProjectTaskReplyCaptureComponent;
    let fixture: ComponentFixture<ProjectTaskReplyCaptureComponent>;
    let de: DebugElement;

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);
    const userQueriesMock: UserQueries = mock(UserQueries);
    const messageQueriesMock: MessageQueries = mock(MessageQueries);
    const observeMessagesByTopicRequestStatusSubject = new Subject<RequestStatusEnum>();
    const topicId: string = MOCK_TOPIC_1.id;
    const moduleDef = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            FormsModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [ProjectTaskReplyCaptureComponent],
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
                provide: MessageQueries,
                useValue: instance(messageQueriesMock),
            },
            {
                provide: UserQueries,
                useValue: instance(userQueriesMock),
            },
        ],
    };

    const MOCK_CONTENT = 'abc';
    const MOCK_FILES: File[] = [new File([''], '')];
    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const dataAutomationInputFiles = '[data-automation="input-files"]';
    const dataAutomationToggleAddPictures = '[data-automation="button-toggle-input-files"]';
    const dataAutomationSubmit = '[data-automation="button-submit"]';

    const getElement = <T extends HTMLElement>(selector: string): T => de.query(By.css(selector))?.nativeElement;
    const eventClick: Event = new Event('click');

    beforeEach(async () => {
        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);
        when(messageQueriesMock.observeMessagesByTopicRequestStatus(topicId)).thenReturn(observeMessagesByTopicRequestStatusSubject);
        when(userQueriesMock.observeCurrentUser()).thenReturn(of(TEST_USER_RESOURCE_REGISTERED));

        await TestBed.configureTestingModule(moduleDef)
            .compileComponents();

        fixture = TestBed.createComponent(ProjectTaskReplyCaptureComponent);
        de = fixture.debugElement;
        comp = fixture.componentInstance;
        comp.topicId = topicId;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(comp).toBeTruthy();
    });

    it('should set the image max size in bytes and megabytes', () => {
        expect(comp.imageMaxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
        expect(comp.imageMaxSize).toBe(MOCK_FILE_SIZE_BYTES);
    });

    it('should trigger onSubmit emit when form is submitted', () => {
        comp.form.get('content').setValue(MOCK_CONTENT);
        spyOn(comp.submitForm, 'emit').and.callThrough();

        comp.onSubmitForm();

        expect(comp.submitForm.emit).toHaveBeenCalled();
    });

    it('should trigger openFinder() when add files is pressed', () => {
        spyOn(comp, 'openFinder').and.callThrough();
        comp.isInputFilesVisible = true;
        fixture.detectChanges();

        getElement(dataAutomationInputFiles).dispatchEvent(eventClick);
        fixture.detectChanges();

        expect(comp.openFinder).toThrow();
    });

    it('should return when form is submitted empty', () => {
        spyOn(comp.submitForm, 'emit').and.callThrough();
        comp.onSubmitForm();

        expect(comp.submitForm.emit).not.toHaveBeenCalled();
    });

    it('should open the finder on clicking the picture button', () => {
        const button = getElement(dataAutomationToggleAddPictures);
        spyOn(comp, 'openFinder');
        button.dispatchEvent(eventClick);
        fixture.detectChanges();

        expect(comp.openFinder).toHaveBeenCalled();
    });

    it('should show the files input after an attachment has been added', () => {
        comp.onChangeFiles(MOCK_FILES);
        fixture.detectChanges();

        expect(comp.isInputFilesVisible).toBeTruthy();
    });

    it('should hide the files input after the file input has been emptied', () => {
        comp.onChangeFiles([]);
        fixture.detectChanges();

        expect(comp.isInputFilesVisible).toBeFalsy();
    });

    it('should disable the button when the form is empty', () => {
        comp.form.get('content').setValue('');
        comp.form.get('files').setValue([]);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(dataAutomationSubmit).disabled).toBeTruthy();
    });

    it('should enable the button when a file is added', () => {
        comp.form.get('content').setValue('');
        comp.form.get('files').setValue(MOCK_FILES);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(dataAutomationSubmit).disabled).toBeFalsy();
    });

    it('should enable the button when text is entered', () => {
        comp.form.get('content').setValue(MOCK_CONTENT);
        comp.form.get('files').setValue([]);
        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(dataAutomationSubmit).disabled).toBeFalsy();
    });

    it('should set the focused property on focus', () => {
        comp.focused = false;
        fixture.detectChanges();

        comp.onFocus();

        expect(comp.focused).toBeTruthy();
    });

    it('should unset the focused property on blur', () => {
        comp.focused = true;
        fixture.detectChanges();

        comp.onBlur();

        expect(comp.focused).toBeFalsy();
    });

    it('should submit when submit is triggered with text', () => {
        const expectedEmit = new SaveMessageResource(topicId, MOCK_CONTENT, null);

        comp.form.get('content').setValue(MOCK_CONTENT);

        fixture.detectChanges();

        spyOn(comp.submitForm, 'emit');
        comp.onSubmitForm();
        fixture.detectChanges();

        expect(comp.submitForm.emit).toHaveBeenCalledWith(expectedEmit);
    });

    it('should submit when submit is triggered with files', () => {
        const expectedEmit = new SaveMessageResource(topicId, null, MOCK_FILES);

        comp.form.get('files').setValue(MOCK_FILES);
        comp.isInputFilesVisible = true;

        fixture.detectChanges();

        spyOn(comp.submitForm, 'emit');
        comp.onSubmitForm();
        fixture.detectChanges();

        expect(comp.submitForm.emit).toHaveBeenCalledWith(expectedEmit);
    });

    it('should submit when submit is triggered with files and content', () => {
        const expectedEmit = new SaveMessageResource(topicId, MOCK_CONTENT, MOCK_FILES);

        comp.form.get('content').setValue(MOCK_CONTENT);
        comp.form.get('files').setValue(MOCK_FILES);
        comp.isInputFilesVisible = true;

        fixture.detectChanges();

        spyOn(comp.submitForm, 'emit');
        comp.onSubmitForm();
        fixture.detectChanges();

        expect(comp.submitForm.emit).toHaveBeenCalledWith(expectedEmit);
    });

    it('should not reset the form when the form is submitted', () => {
        comp.form.get('content').setValue(MOCK_CONTENT);
        comp.onSubmitForm();

        expect(comp.form.get('content').value).not.toBe('');
    });

    it('should reset the form when the form is submitted and the request was succeeded', () => {
        comp.form.get('content').setValue(MOCK_CONTENT);
        comp.onSubmitForm();

        observeMessagesByTopicRequestStatusSubject.next(RequestStatusEnum.success);

        expect(comp.form.get('content').value).toBe('');
    });

    it('should not reset the form when the form is submitted and the request failed', () => {
        comp.form.get('content').setValue(MOCK_CONTENT);
        comp.onSubmitForm();

        observeMessagesByTopicRequestStatusSubject.next(RequestStatusEnum.error);

        expect(comp.form.get('content').value).not.toBe('');
    });
});
