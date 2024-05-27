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
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
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

import {MOCK_PROJECT_1} from '../../../../test/mocks/projects';
import {MockStore} from '../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../shared/translation/translation.module';
import {UIModule} from '../../../shared/ui/ui.module';
import {ProjectExportResource} from '../../project-common/api/project-export/resources/project-export.resource';
import {ProjectExportFormatEnum} from '../../project-common/enums/project-export-format.enum';
import {ProjectExportSchedulingTypeEnum} from '../../project-common/enums/project-export-scheduling-type.enum';
import {ProjectExportAction} from '../../project-common/store/project-export/project-export.actions';
import {ProjectExportQueries} from '../../project-common/store/project-export/project-export.queries';
import {ProjectSliceService} from '../../project-common/store/projects/project-slice.service';
import {ProjectExportComponent} from './project-export.component';

describe('ProjectExportComponent', () => {
    let component: ProjectExportComponent;
    let fixture: ComponentFixture<ProjectExportComponent>;
    let de: DebugElement;
    let store: Store<State>;

    const clickEvent: Event = new Event('click');
    const dataAutomationExportButtonSelector = '[data-automation="export"]';
    const dataAutomationCancelButtonSelector = '[data-automation="cancel"]';
    const dataAutomationTopicNotesSelector = '[data-automation="topic-notes-subtitle"]';
    const dataAutomationTopicCommentsSelector = '[data-automation="topic-comments-subtitle"]';
    const exportRequestStatusSubject: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectExportQueriesMock: ProjectExportQueries = mock(ProjectExportQueries);

    const getExportButton = () => de.query(By.css(dataAutomationExportButtonSelector)).nativeElement;
    const getCancelBtn = () => de.query(By.css(dataAutomationCancelButtonSelector)).nativeElement;
    const getTopicNotesSubtitle = () => de.query(By.css(dataAutomationTopicNotesSelector)).nativeElement;
    const getTopicCommentsSubtitle = () => de.query(By.css(dataAutomationTopicCommentsSelector)).nativeElement;

    const setFormValue = (formKey: string, value: any) => component.form.get(formKey).setValue(value);
    const getFormValue = (formKey: string) => component.form.get(formKey).value;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectExportComponent,
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ProjectExportQueries,
                useFactory: () => instance(projectExportQueriesMock),
            },
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectExportComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        store = TestBed.inject(Store);

        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
        when(projectExportQueriesMock.observeProjectExportRequestStatus()).thenReturn(exportRequestStatusSubject);

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should call handleCancel when cancel button is clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();
        getCancelBtn().dispatchEvent(clickEvent);

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should reset form when handleCancel is called', () => {
        setFormValue('format', ProjectExportFormatEnum.PrimaveraP6);

        fixture.detectChanges();
        component.handleCancel();

        expect(getFormValue('format')).toEqual(ProjectExportFormatEnum.MSProject);
        expect(component.isFormValid()).toBeTruthy();
    });

    it('should emit close when handleCancel is called', () => {
        spyOn(component.closed, 'emit').and.callThrough();
        component.handleCancel();

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should dispatch ProjectExportAction.Export.OneReset when handleCancel is called', () => {
        const expectedAction = new ProjectExportAction.Export.OneReset();

        spyOn(store, 'dispatch').and.callThrough();

        component.handleCancel();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call handleCancel when is submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleDownload();
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should not call handleCancel when not submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should not call handleCancel when is submitting and current request status is not success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleDownload();
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should not call handleCancel when not submitting and current request status is not success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should set isLoading to true when submitting and current export request status is in progress', () => {
        component.handleDownload();
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when submitting and current export request status is not in progress', () => {
        component.handleDownload();
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when is not submitting and current export request status is in progress', () => {
        exportRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when not submitting and current export request status is not in progress', () => {
        exportRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();

        exportRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();
    });

    it('should dispatch ProjectExportAction.Export.One when the export button is clicked and the form is valid', () => {
        const expectedResource: ProjectExportResource = new ProjectExportResource(
            ProjectExportFormatEnum.PrimaveraP6,
            true,
            ProjectExportSchedulingTypeEnum.AutoScheduled,
            ProjectExportSchedulingTypeEnum.ManuallyScheduled,
        );
        const expectedAction = new ProjectExportAction.Export.One(MOCK_PROJECT_1.id, expectedResource);

        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('format', ProjectExportFormatEnum.PrimaveraP6);
        setFormValue('includeTopics', true);
        setFormValue('taskExportSchedulingType', ProjectExportSchedulingTypeEnum.AutoScheduled);
        setFormValue('milestoneExportSchedulingType', ProjectExportSchedulingTypeEnum.ManuallyScheduled);

        getExportButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should update isMicrosoftProjectFormatSelected depending on MicrosoftProject format being selected', () => {
        setFormValue('format', ProjectExportFormatEnum.PrimaveraP6);
        fixture.detectChanges();
        expect(component.isMicrosoftProjectFormatSelected).toBeFalsy();

        setFormValue('format', ProjectExportFormatEnum.MSProject);
        fixture.detectChanges();
        expect(component.isMicrosoftProjectFormatSelected).toBeTruthy();
    });

    it('should show the correct subtitle for the import topics option if MicrosoftProject format is selected', () => {
        const elem = getTopicNotesSubtitle();
        expect(elem).toBeTruthy();
    });

    it('should show the correct subtitle for the import topics option if PrimaveraP6 format is selected', () => {
        setFormValue('format', ProjectExportFormatEnum.PrimaveraP6);

        fixture.detectChanges();
        const elem = getTopicCommentsSubtitle();
        expect(elem).toBeTruthy();
    });

    it('should disable form controls that are not necessary for ZIP format when format changes to ZIP', () => {
        setFormValue('format', ProjectExportFormatEnum.Zip);

        expect(component.form.get('includeTopics').disabled).toBeTruthy();
        expect(component.form.get('taskExportSchedulingType').disabled).toBeTruthy();
        expect(component.form.get('milestoneExportSchedulingType').disabled).toBeTruthy();
    });

    it('should enable form controls that are necessary when MicrosoftProject format is selected', () => {
        setFormValue('format', ProjectExportFormatEnum.MSProject);

        expect(component.form.get('includeTopics').enabled).toBeTruthy();
        expect(component.form.get('taskExportSchedulingType').enabled).toBeTruthy();
        expect(component.form.get('milestoneExportSchedulingType').enabled).toBeTruthy();
    });

    it('should enable form controls that are necessary when PrimaveraP6 format is selected', () => {
        setFormValue('format', ProjectExportFormatEnum.PrimaveraP6);

        expect(component.form.get('includeTopics').enabled).toBeTruthy();
        expect(component.form.get('taskExportSchedulingType').enabled).toBeTruthy();
        expect(component.form.get('milestoneExportSchedulingType').enabled).toBeTruthy();
    });

    it('should return true if a specified form control is disabled', () => {
        setFormValue('format', ProjectExportFormatEnum.Zip);

        expect(component.isFormDisabled('includeTopics')).toBeTruthy();
    });

    it('should return false if a specified form control is not disabled', () => {
        expect(component.isFormDisabled('includeTopics')).toBeFalsy();
    });
});
