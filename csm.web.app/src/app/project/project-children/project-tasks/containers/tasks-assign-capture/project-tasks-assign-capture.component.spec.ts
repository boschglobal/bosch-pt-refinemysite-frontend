/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    Router,
    RouterModule
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {of} from 'rxjs';

import {
    TEST_COMPANY_1_REFERENCE,
    TEST_COMPANY_REFERENCE_LIST
} from '../../../../../../test/company/api/testdata/company.testdata';
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANTS_LIST
} from '../../../../../../test/mocks/participants';
import {ProjectSliceServiceMock} from '../../../../../../test/mocks/project-slice.service.mock';
import {MOCK_PROJECT_1} from '../../../../../../test/mocks/projects';
import {MockStore} from '../../../../../../test/mocks/store';
import {
    MOCK_TASK_RESOURCE,
    MOCK_TASKS_RESOURCES
} from '../../../../../../test/mocks/tasks';
import {REDUCER} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {PaginatorData} from '../../../../../shared/ui/paginator/paginator-data.datastructure';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {UIModule} from '../../../../../shared/ui/ui.module';
import {ProjectCompanyService} from '../../../../project-common/api/companies/project-company.service';
import {ProjectParticipantsService} from '../../../../project-common/api/participants/project-participants.service';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {ProjectTasksAssignCaptureComponent} from './project-tasks-assign-capture.component';

describe('Project Tasks Assign Component', () => {
    let fixture: ComponentFixture<ProjectTasksAssignCaptureComponent>;
    let comp: ProjectTasksAssignCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let mockedStore: any;
    let projectParticipantsService: any;
    let projectCompanyService: any;

    const dataAutomationSelectorCancel = '[data-automation="cancel-assign"]';
    const dataAutomationSelectorSubmit = '[data-automation="submit-assign"]';
    const company1ID = '1';
    const company2ID = '2';

    const listOfOneCompany = {
        ...TEST_COMPANY_REFERENCE_LIST,
        companies: [TEST_COMPANY_1_REFERENCE],
    };
    const listOfOneParticipant = {
        ...MOCK_PARTICIPANTS_LIST,
        items: [MOCK_PARTICIPANT],
    };

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [CUSTOM_ELEMENTS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
            StoreModule.forRoot(REDUCER),
            EffectsModule.forRoot([]),
            ReactiveFormsModule,
        ],
        declarations: [
            ProjectTasksAssignCaptureComponent,
        ],
        providers: [
            HttpClient,
            ProjectTaskQueries,
            {
                provide: Router,
                useValue: RouterModule,
            },
            {
                provide: ProjectCompanyService,
                useValue: jasmine.createSpyObj('ProjectCompanyService', ['findAll']),
            },
            {
                provide: ProjectSliceService,
                useClass: ProjectSliceServiceMock,
            },
            {
                provide: ProjectParticipantsService,
                useValue: jasmine.createSpyObj('ProjectParticipantsService', ['findAllByCompany']),
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                currentItem: {
                                    id: MOCK_PROJECT_1.id,
                                },
                                items: [MOCK_PROJECT_1],
                            },
                            projectParticipantSlice: {
                                currentItem: {
                                    id: MOCK_PARTICIPANT.id,
                                },
                                items: [MOCK_PARTICIPANT],
                            },
                            projectTaskSlice: {
                                currentItem: {
                                    id: MOCK_TASK_RESOURCE.id,
                                },
                                items: MOCK_TASKS_RESOURCES,
                                list: {
                                    pages: {'0': MOCK_TASKS_RESOURCES.map(item => item.id)},
                                    pagination: new PaginatorData(),
                                    sort: new SorterData(),
                                    requestStatus: RequestStatusEnum.empty,
                                },
                                assignList: new AbstractSelectionList(),
                            },
                        },
                    }
                ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksAssignCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        mockedStore = TestBed.inject(Store);
        projectParticipantsService = TestBed.inject(ProjectParticipantsService);
        projectCompanyService = TestBed.inject(ProjectCompanyService);

        projectParticipantsService.findAllByCompany.and.returnValue(of(MOCK_PARTICIPANTS_LIST));
        projectCompanyService.findAll.and.returnValue(of(TEST_COMPANY_REFERENCE_LIST));

        fixture.detectChanges();
        comp.ngOnInit();
    });

    afterEach(() => comp.ngOnDestroy());

    it('should set tasks assign form after ngOnInit()', () => {
        fixture.detectChanges();
        expect(comp.tasksAssignForm).toBeDefined();
    });

    it('should emit onClose when cancel button is clicked', () => {
        spyOn(comp.onClose, 'emit');
        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.onClose.emit).toHaveBeenCalled();
    });

    it('should ensure that company and assignee are empty at on init', () => {
        const company = comp.tasksAssignForm.get('company').value;
        const assignee = comp.tasksAssignForm.get('participant').value;
        expect(company).toBeNull();
        expect(assignee).toBeNull();
    });

    it('should ensure that assignee are disabled when there is no company selected', () => {
        const companyDisabled = comp.tasksAssignForm.get('company').value;
        const assigneeDisabled = comp.tasksAssignForm.get('participant').disabled;
        expect(companyDisabled).toBeNull();
        expect(assigneeDisabled).toBeTruthy();
    });

    it('should enable assignee when a company is selected', () => {
        const company = comp.tasksAssignForm.get('company');
        const assigneeDisabled = comp.tasksAssignForm.get('participant');

        company.setValue(company1ID);
        fixture.detectChanges();

        expect(company.value).toBeDefined();
        expect(assigneeDisabled.disabled).toBeFalsy();
    });

    it('should ensure that button "Assign and Send" is enabled when company and assignee are selected', () => {
        const company = comp.tasksAssignForm.get('company');
        const assignee = comp.tasksAssignForm.get('participant');
        const assignButton = el.querySelector(dataAutomationSelectorSubmit);

        company.setValue(company1ID);
        assignee.setValue({id: 'xyz', picture: ''});

        fixture.detectChanges();

        expect(company.value).toBeDefined();
        expect(assignee.value).toBeDefined();
        expect(assignButton.classList).not.toContain('disable');
    });

    it('should clean assignee when company changed', () => {
        const company = comp.tasksAssignForm.get('company');
        const assignee = comp.tasksAssignForm.get('participant');

        company.setValue(company1ID);
        assignee.setValue({id: 'xyz', picture: ''});

        fixture.detectChanges();

        expect(company.value).toBeDefined();
        expect(assignee.value).toBeDefined();

        company.setValue(company2ID);

        fixture.detectChanges();

        expect(assignee.value).toBeNull();
    });

    it('should disable assignee when company change from a company to "No Selection"', () => {
        const company = comp.tasksAssignForm.get('company');
        const assignee = comp.tasksAssignForm.get('participant');
        const assignButton = el.querySelector(dataAutomationSelectorSubmit);

        company.setValue(company1ID);
        assignee.setValue({id: 'xyz', picture: ''});

        fixture.detectChanges();

        expect(company.value).toBeDefined();
        expect(assignee.value).toBeDefined();

        company.reset();
        fixture.detectChanges();

        expect(assignee.value).toBeNull();
        expect(assignee.disabled).toBeTruthy();
        expect(assignButton.hasAttribute('disabled')).toBeTruthy();
    });

    it('should trigger event when click on "Assign and Send"', () => {
        const assignButton = el.querySelector(dataAutomationSelectorSubmit);
        const company = comp.tasksAssignForm.get('company');
        const assignee = comp.tasksAssignForm.get('participant');

        spyOn(comp, 'onSubmitForm');

        company.setValue(company1ID);
        assignee.setValue({id: 'xyz', picture: ''});
        comp.selectedTasksNumber = 1;
        fixture.detectChanges();

        assignButton.dispatchEvent(clickEvent);

        expect(comp.onSubmitForm).toHaveBeenCalled();
    });

    it('should added amount of items selected on table to "Assign and Send" button', () => {
        const assignButton = el.querySelector(dataAutomationSelectorSubmit);
        comp.selectedTasksNumber = 5;
        fixture.detectChanges();
        expect(assignButton.textContent).toContain(comp.selectedTasksNumber.toString());
    });

    it('should dispatch AssignSelecting on isSelecting true', () => {
        const taskAssignSelecting = new ProjectTaskActions.Set.AssignSelecting(true);
        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.isSelecting = true;
        expect(mockedStore.dispatch).toHaveBeenCalledWith(taskAssignSelecting);
    });

    it('should not dispatch AssignSelecting on isSelecting false', () => {
        const taskAssignSelecting = new ProjectTaskActions.Set.AssignSelecting(true);
        spyOn(mockedStore, 'dispatch').and.callThrough();

        comp.isSelecting = false;
        expect(mockedStore.dispatch).not.toHaveBeenCalledWith(taskAssignSelecting);
    });

    it('should dispatch ProjectTaskAction Assign.All on trigger onSubmitForm()', () => {
        const payload = {
            taskIds: ['foo'],
            companyId: 'bar',
            participantId: 'xyz',
        };
        const assignTasks = new ProjectTaskActions.Assign.All(payload);
        spyOn(mockedStore, 'dispatch');

        comp.selectedTasks = ['foo'];
        comp.tasksAssignForm.get('company').setValue('bar');
        comp.tasksAssignForm.get('participant').setValue({id: 'xyz', picture: ''});
        fixture.detectChanges();

        comp.onSubmitForm();
        expect(mockedStore.dispatch).toHaveBeenCalledWith(assignTasks);
    });

    it('should emit onOpen when parsing list and isSelecting is true', () => {
        spyOn(comp.onOpen, 'emit');
        mockedStore._value.projectModule.projectTaskSlice.assignList.isSelecting = true;

        comp.ngOnInit();
        expect(comp.onOpen.emit).toHaveBeenCalled();
    });

    it('should set company on form on handleCancel when there is only a company on the list', () => {
        projectCompanyService.findAll.and.returnValue(of(listOfOneCompany));
        comp.ngOnInit();

        comp.handleCancel();
        expect(comp.tasksAssignForm.get('company').value).toBe(TEST_COMPANY_1_REFERENCE.id);
    });

    it('should set participant on form on handleCancel when there is only a participant on the list', () => {
        projectCompanyService.findAll.and.returnValue(of(listOfOneCompany));
        projectParticipantsService.findAllByCompany.and.returnValue(of(listOfOneParticipant));
        comp.ngOnInit();

        const expectedResult = {id: MOCK_PARTICIPANT.id, picture: MOCK_PARTICIPANT.user.picture};

        comp.handleCancel();
        expect(comp.tasksAssignForm.get('participant').value).toEqual(expectedResult);
    });

    it('should set isSubmit to false on handleCaptureState when there is Request status success', () => {
        mockedStore._value.projectModule.projectTaskSlice.assignList.requestStatus = RequestStatusEnum.success;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeFalsy();
    });

    it('should set isSubmit to true on handleCaptureState when there is Request status progress', () => {
        mockedStore._value.projectModule.projectTaskSlice.assignList.requestStatus = RequestStatusEnum.progress;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeTruthy();
    });

    it('should set isSubmit to false on handleCaptureState when there is Request status error', () => {
        mockedStore._value.projectModule.projectTaskSlice.assignList.requestStatus = RequestStatusEnum.error;

        comp.ngOnInit();
        expect(comp.isSubmitting).toBeFalsy();
    });
});
