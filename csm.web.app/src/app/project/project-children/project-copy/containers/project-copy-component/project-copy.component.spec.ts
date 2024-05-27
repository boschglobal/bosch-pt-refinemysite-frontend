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
    when,
} from 'ts-mockito';

import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {TranslateServiceStub} from '../../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {CreateProjectCopyResource} from '../../../../project-common/api/project-copy/resources/create-project-copy.resource';
import {ProjectCopyAction} from '../../../../project-common/store/project-copy/project-copy.actions';
import {ProjectCopyQueries} from '../../../../project-common/store/project-copy/project-copy.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectCopyComponent} from './project-copy.component';

describe('ProjectCopyComponent', () => {
    let component: ProjectCopyComponent;
    let fixture: ComponentFixture<ProjectCopyComponent>;
    let de: DebugElement;
    let store: Store<State>;

    const clickEvent: Event = new Event('click');
    const dataAutomationCancelButtonSelector = '[data-automation="cancel"]';
    const dataAutomationCopyButtonSelector = '[data-automation="copy"]';

    const copyRequestStatusSubject: Subject<RequestStatusEnum> = new Subject<RequestStatusEnum>();
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectCopyQueriesMock: ProjectCopyQueries = mock(ProjectCopyQueries);

    const getCancelBtn = () => de.query(By.css(dataAutomationCancelButtonSelector)).nativeElement;
    const getCopyButton = () => de.query(By.css(dataAutomationCopyButtonSelector)).nativeElement;

    const setFormValue = (formKey, value) => component.form.get(formKey).setValue(value);
    const getFormValue = (formKey) => component.form.get(formKey).value;

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
            ProjectCopyComponent,
        ],
        providers: [
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: ProjectCopyQueries,
                useFactory: () => instance(projectCopyQueriesMock),
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
        fixture = TestBed.createComponent(ProjectCopyComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        store = TestBed.inject(Store);

        component.projectCopyTitle = 'foo';

        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
        when(projectCopyQueriesMock.observeCurrentProjectCopyRequestStatus()).thenReturn(copyRequestStatusSubject);

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should call handleCancel when cancel button is clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();
        getCancelBtn().dispatchEvent(clickEvent);

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should reset form when handleCancel is called', () => {
        setFormValue('projectName', 'test');
        setFormValue('workingAreas', true);
        setFormValue('disciplines', true);
        setFormValue('selectAll', true);
        setFormValue('milestones', true);
        setFormValue('tasks', true);
        setFormValue('dayCards', true);
        setFormValue('keepTaskStatus', true);
        setFormValue('keepTaskAssignee', true);

        fixture.detectChanges();
        component.handleCancel();

        expect(getFormValue('projectName')).toEqual('foo');
        expect(getFormValue('selectAll')).toBeFalsy();
        expect(getFormValue('workingAreas')).toBeFalsy();
        expect(getFormValue('disciplines')).toBeFalsy();
        expect(getFormValue('milestones')).toBeFalsy();
        expect(getFormValue('tasks')).toBeFalsy();
        expect(getFormValue('dayCards')).toBeFalsy();
        expect(getFormValue('keepTaskStatus')).toBeFalsy();
        expect(getFormValue('keepTaskAssignee')).toBeFalsy();
        expect(component.isFormValid()).toBeTruthy();
    });

    it('should emit close when handleCancel is called', () => {
        spyOn(component.closed, 'emit').and.callThrough();
        component.handleCancel();

        expect(component.closed.emit).toHaveBeenCalled();
    });

    it('should dispatch ProjectCopyAction.Copy.OneReset when handleCancel is called', () => {
        const expectedAction = new ProjectCopyAction.Copy.OneReset();

        spyOn(store, 'dispatch').and.callThrough();

        component.handleCancel();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should call handleCancel when is submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleCopy();
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should not call handleCancel when not submitting and current request status is success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        copyRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should not call handleCancel when is submitting and current request status is not success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        component.handleCopy();
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should not call handleCancel when not submitting and current request status is not success', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        copyRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.handleCancel).not.toHaveBeenCalled();

        copyRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.handleCancel).not.toHaveBeenCalled();
    });

    it('should set isLoading to true when submitting and current export request status is in progress', () => {
        component.handleCopy();
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeTruthy();
    });

    it('should set isLoading to false when submitting and current export request status is not in progress', () => {
        component.handleCopy();
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when is not submitting and current export request status is in progress', () => {
        copyRequestStatusSubject.next(RequestStatusEnum.progress);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when not submitting and current export request status is not in progress', () => {
        copyRequestStatusSubject.next(RequestStatusEnum.error);
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.empty);
        expect(component.isLoading).toBeFalsy();

        copyRequestStatusSubject.next(RequestStatusEnum.success);
        expect(component.isLoading).toBeFalsy();
    });

    it('should set allSelectedControlFlag to false, isIndeterminated and isIndeterminatedTasks to false', () => {
        expect(getFormValue('selectAll')).toBeFalsy();
        expect(component.isIndeterminated).toBeFalsy();
        expect(component.isIndeterminatedTasks).toBeFalsy();
    });

    it('should dispatch ProjectCopyAction.Copy.One when the export button is clicked and the form is valid', () => {
        const expectedResource = {
            projectName: 'foo',
            workingAreas: true,
            disciplines: false,
            milestones: false,
            tasks: false,
            dayCards: false,
            keepTaskStatus: false,
            keepTaskAssignee: false,
        } as CreateProjectCopyResource;
        const expectedAction = new ProjectCopyAction.Copy.One(MOCK_PROJECT_1.id, expectedResource);

        spyOn(store, 'dispatch').and.callThrough();

        setFormValue('workingAreas', true);

        getCopyButton().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(store.dispatch).toHaveBeenCalledTimes(1);
        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set allSelectedControlFlag to false and isIndeterminated to true', () => {
        setFormValue('workingAreas', true);

        fixture.detectChanges();

        expect(getFormValue('selectAll')).toBeFalsy();
        expect(component.isIndeterminated).toBeTruthy();
    });

    it('should set allSelectedControlFlag to true, isIndeterminated and isIndeterminatedTasks to false', () => {
        setFormValue('selectAll', true);
        setFormValue('workingAreas', true);
        setFormValue('disciplines', true);
        setFormValue('milestones', true);
        setFormValue('tasks', true);
        setFormValue('dayCards', true);
        setFormValue('keepTaskStatus', true);
        setFormValue('keepTaskAssignee', true);

        fixture.detectChanges();

        expect(getFormValue('selectAll')).toBeTruthy();
        expect(getFormValue('tasks')).toBeTruthy();
        expect(component.isIndeterminated).toBeFalsy();
        expect(component.isIndeterminatedTasks).toBeFalsy();
    });

    it('should set allTasksSelectedControlFlag to true, isIndeterminatedTasks to false and isIndeterminated to true', () => {
        setFormValue('tasks', true);
        setFormValue('dayCards', true);
        setFormValue('keepTaskStatus', true);
        setFormValue('keepTaskAssignee', true);

        fixture.detectChanges();

        expect(getFormValue('selectAll')).toBeFalsy();
        expect(component.isTasksSelected).toBeTruthy();
        expect(component.isIndeterminated).toBeTruthy();
        expect(component.isIndeterminatedTasks).toBeFalsy();
    });

    it('should set allTasksSelectedControlFlag to true, isIndeterminatedTasks to false and isIndeterminated to true', () => {
        setFormValue('tasks', true);

        fixture.detectChanges();

        expect(getFormValue('selectAll')).toBeFalsy();
        expect(getFormValue('tasks')).toBeTruthy();
        expect(component.isIndeterminated).toBeTruthy();
        expect(component.isIndeterminatedTasks).toBeFalsy();
    });

    it('should set all tasks sub options to true if tasks are set', () => {
        setFormValue('tasks', true);

        fixture.detectChanges();

        expect(getFormValue('dayCards')).toBeTruthy();
        expect(getFormValue('keepTaskStatus')).toBeTruthy();
        expect(getFormValue('keepTaskAssignee')).toBeTruthy();
        expect(component.isTasksSelected).toBeTruthy();
        expect(component.isKeepTaskAssigneeSelected).toBeTruthy();
    });

    it('should set isKeepTaskStatusSelected to false if keepTaskAssignees is set to false', () => {
        setFormValue('keepTaskAssignee', false);

        fixture.detectChanges();

        expect(getFormValue('keepTaskStatus')).toBeFalsy();
        expect(component.isKeepTaskAssigneeSelected).toBeFalsy();
    });
});
