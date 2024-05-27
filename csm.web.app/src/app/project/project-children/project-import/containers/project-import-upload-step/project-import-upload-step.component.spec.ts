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
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MockStore} from '../../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TransitionStatusEnum} from '../../../../../shared/ui/status-transition/status-transition.component';
import {ProjectImportActions} from '../../../../project-common/store/project-import/project-import.actions';
import {ProjectImportQueries} from '../../../../project-common/store/project-import/project-import.queries';
import {ProjectImportUploadStepComponent} from './project-import-upload-step.component';

describe('Project Import Upload Step Component', () => {
    let component: ProjectImportUploadStepComponent;
    let fixture: ComponentFixture<ProjectImportUploadStepComponent>;
    let store: Store;
    let de: DebugElement;

    const projectImportQueriesMock: ProjectImportQueries = mock(ProjectImportQueries);
    const uploadRequestStatusObservable: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();

    const statusMap: { [key in RequestStatusEnum]: TransitionStatusEnum } = {
        [RequestStatusEnum.empty]: null,
        [RequestStatusEnum.progress]: TransitionStatusEnum.InProgress,
        [RequestStatusEnum.success]: TransitionStatusEnum.Completed,
        [RequestStatusEnum.error]: TransitionStatusEnum.Error,
    };
    const titleMap: { [key in RequestStatusEnum]: string } = {
        [RequestStatusEnum.empty]: null,
        [RequestStatusEnum.progress]: 'Project_Import_UploadProgressLabel',
        [RequestStatusEnum.success]: 'Project_Import_UploadSuccessLabel',
        [RequestStatusEnum.error]: 'Project_Import_UploadErrorLabel',
    };
    const mockFile: File = new File([''], '');

    const projectImportUploadStepCapture = '[data-automation="project-import-upload-step-capture"]';
    const projectImportUploadStepStatusTransition = '[data-automation="project-import-upload-step-status-transition"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [],
        declarations: [
            ProjectImportUploadStepComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: ProjectImportQueries,
                useFactory: () => instance(projectImportQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectImportUploadStepComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(Store);
        de = fixture.debugElement;

        when(projectImportQueriesMock.observeRequestStatus('upload')).thenReturn(uploadRequestStatusObservable);

        component.ngOnInit();
    });

    it('should render the upload capture when the upload request status is empty', () => {
        uploadRequestStatusObservable.next(RequestStatusEnum.empty);
        fixture.detectChanges();

        expect(getElement(projectImportUploadStepCapture)).toBeTruthy();
        expect(getElement(projectImportUploadStepStatusTransition)).toBeFalsy();
    });

    it('should render the status transition when the upload request status is not empty', () => {
        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.progress);
        fixture.detectChanges();

        expect(getElement(projectImportUploadStepCapture)).toBeFalsy();
        expect(getElement(projectImportUploadStepStatusTransition)).toBeTruthy();
    });

    it('should dispatch a ProjectImportActions.Upload.One when handleUploadStepChanged is called with a file', () => {
        const expectedAction = new ProjectImportActions.Upload.One(mockFile);

        spyOn(store, 'dispatch');
        component.handleUploadStepChanged(mockFile);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should dispatch a ProjectImportActions.Upload.OneReset when handleUploadStepChanged is called without a file', () => {
        const expectedAction = new ProjectImportActions.Upload.OneReset();

        spyOn(store, 'dispatch');
        component.handleUploadStepChanged(null);

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    Object.entries(statusMap).forEach(([requestStatus, status]) => {
        it(`should set the status as ${status} when the request status is ${requestStatus}`, () => {
            component.file = mockFile;
            uploadRequestStatusObservable.next(requestStatus as unknown as RequestStatusEnum);

            expect(component.status).toBe(status);
        });
    });

    Object.entries(titleMap).forEach(([requestStatus, title]) => {
        it(`should set the title as ${title} when the request status is ${requestStatus}`, () => {
            component.file = mockFile;
            uploadRequestStatusObservable.next(requestStatus as unknown as RequestStatusEnum);

            expect(component.title).toBe(title);
        });
    });

    it('should set showCancelButton as true when the request status is success', () => {
        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.success);

        expect(component.showCancelButton).toBeTruthy();
    });

    it('should set showCancelButton as true when the request status is error', () => {
        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.error);

        expect(component.showCancelButton).toBeTruthy();
    });

    it('should not set showCancelButton as true when the request status is progress', () => {
        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(component.showCancelButton).toBeFalsy();
    });

    it('should not set showCancelButton as true when the request status is empty', () => {
        uploadRequestStatusObservable.next(RequestStatusEnum.empty);

        expect(component.showCancelButton).toBeFalsy();
    });

    it('should emit fileUploaded with the file when the request status is success', () => {
        spyOn(component.fileUploaded, 'emit');

        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.success);

        expect(component.fileUploaded.emit).toHaveBeenCalledWith(mockFile);
    });

    it('should emit fileUploaded with null when the request status is empty', () => {
        spyOn(component.fileUploaded, 'emit');

        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.empty);

        expect(component.fileUploaded.emit).toHaveBeenCalledWith(null);
    });

    it('should emit fileUploaded with null when the request status is error', () => {
        spyOn(component.fileUploaded, 'emit');

        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.error);

        expect(component.fileUploaded.emit).toHaveBeenCalledWith(null);
    });

    it('should not emit fileUploaded when the request status is progress', () => {
        spyOn(component.fileUploaded, 'emit');

        component.file = mockFile;
        uploadRequestStatusObservable.next(RequestStatusEnum.progress);

        expect(component.fileUploaded.emit).not.toHaveBeenCalled();
    });
});
