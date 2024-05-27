/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
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
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {
    Store,
    StoreModule
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    of,
    ReplaySubject
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {configuration} from '../../../../../configurations/configuration';
import {TEST_COMPANY_1_REFERENCE} from '../../../../../test/company/api/testdata/company.testdata';
import {
    MOCK_COMPANY_1,
    MOCK_COMPANY_2,
    MOCK_COMPANY_3
} from '../../../../../test/mocks/companies';
import {MOCK_PROJECT_CRAFT_B} from '../../../../../test/mocks/crafts';
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2,
    MOCK_PARTICIPANT_3
} from '../../../../../test/mocks/participants';
import {ProjectSliceServiceMock} from '../../../../../test/mocks/project-slice.service.mock';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_TASK,
    MOCK_TASK_NOT_ASSIGNED
} from '../../../../../test/mocks/tasks';
import {MOCK_WORKAREA_B} from '../../../../../test/mocks/workareas';
import {RouterStub} from '../../../../../test/stubs/router.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {REDUCER} from '../../../../app.reducers';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {AttachmentHelper} from '../../../../shared/misc/helpers/attachment.helper';
import {EnvironmentHelper} from '../../../../shared/misc/helpers/environment.helper';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {DatepickerCalendarSelectionTypeEnum} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {SelectOption} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {INPUT_SELECT_DEFAULT_OPTIONS} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.test.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ROUTE_PARAM_PROJECT_ID} from '../../../project-routing/project-route.paths';
import {ProjectCompanyService} from '../../api/companies/project-company.service';
import {ProjectParticipantsService} from '../../api/participants/project-participants.service';
import {
    SaveTaskResource,
    SaveTaskResourceWithVersions
} from '../../api/tasks/resources/save-task.resource';
import {Task} from '../../models/tasks/task';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    ProjectTaskCaptureFormInputEnum,
    ProjectTasksCaptureComponent
} from './project-tasks-capture.component';

describe('Project Tasks Capture Component', () => {
    let fixture: ComponentFixture<ProjectTasksCaptureComponent>;
    let comp: ProjectTasksCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let projectParticipantsService: ProjectParticipantsService;
    let projectCompanyService: ProjectCompanyService;
    let modalService: ModalService;

    const clickEvent: Event = new Event('click');
    const testDropdown: SelectOption[] = INPUT_SELECT_DEFAULT_OPTIONS;

    const MOCK_FILE_SIZE_MEGABYTES: number = configuration.imageUploadMaxFileSize;
    const MOCK_FILE_SIZE_BYTES: number = MOCK_FILE_SIZE_MEGABYTES * 1024 * 1024;

    const dataAutomationSaveAsDraftSelector = '[data-automation="draft"]';
    const dataAutomationAssignAndSendSelector = '[data-automation="assign"]';
    const dataAutomationSelectorCancel = '[data-automation="cancel"]';
    const dataAutomationSelectorUpdate = '[data-automation="update"]';

    const attachmentHelper: AttachmentHelper = mock(AttachmentHelper);
    const environmentHelper: EnvironmentHelper = mock(EnvironmentHelper);
    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);
    const projectTaskQueriesMock: ProjectTaskQueries = mock(ProjectTaskQueries);
    const workareaQueriesMock: WorkareaQueries = mock(WorkareaQueries);

    const mockDate = moment().format(API_DATE_YEAR_MONTH_DAY_FORMAT);

    const mockTaskResource: SaveTaskResource = new SaveTaskResource(
        MOCK_PROJECT_1.id,
        'Test assign',
        'Test description',
        'OPEN',
        'location',
        'testCraftId',
        testDropdown[2].value,
        mockDate,
        mockDate,
        'testAssigneeId',
        [new File([''], '')],
    );

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            EffectsModule.forRoot([]),
            ReactiveFormsModule,
            StoreModule.forRoot(REDUCER),
            TranslationModule.forRoot(),
            UIModule,
            BrowserAnimationsModule,
            BrowserModule,
        ],
        declarations: [
            ProjectTasksCaptureComponent,
        ],
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    params: of({[ROUTE_PARAM_PROJECT_ID]: 123}),
                },
            },
            {
                provide: AttachmentHelper,
                useFactory: () => instance(attachmentHelper),
            },
            {
                provide: EnvironmentHelper,
                useFactory: () => instance(environmentHelper),
            },
            {
                provide: ProjectCraftQueries,
                useFactory: () => instance(projectCraftQueriesMock),
            },
            {
                provide: ProjectTaskQueries,
                useFactory: () => instance(projectTaskQueriesMock),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueriesMock),
            },
            HttpClient,
            {
                provide: ModalService,
                useValue: {
                    get currentModalData() {
                        return {
                            taskId: MOCK_TASK.id,
                            start: moment(),
                            end: moment(),
                            workarea: '123',
                        };
                    },
                },
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: ProjectSliceService,
                useClass: ProjectSliceServiceMock,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectTasksCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        projectParticipantsService = TestBed.inject(ProjectParticipantsService);
        projectCompanyService = TestBed.inject(ProjectCompanyService);
        modalService = TestBed.inject(ModalService);

        when(environmentHelper.getConfiguration()).thenReturn(configuration);
        when(attachmentHelper.convertMbToBytes(MOCK_FILE_SIZE_MEGABYTES)).thenReturn(MOCK_FILE_SIZE_BYTES);
        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(of([MOCK_PROJECT_CRAFT_B]));
        when(projectSliceServiceMock.observeCurrentProject()).thenReturn(of(MOCK_PROJECT_1));
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(MOCK_PROJECT_1.id));
        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK.id)).thenReturn(of(MOCK_TASK));
        when(workareaQueriesMock.observeWorkareas()).thenReturn(of([MOCK_WORKAREA_B]));

        fixture.detectChanges();
        comp.ngOnInit();
    });

    afterEach(() => {
        comp.ngOnDestroy();
    });

    it('should set the image max size in bytes and megabytes', () => {
        expect(comp.imageMaxSizeInMb).toBe(MOCK_FILE_SIZE_MEGABYTES);
        expect(comp.imageMaxSize).toBe(MOCK_FILE_SIZE_BYTES);
    });

    it('should set form after ngOnInit()', () => {
        fixture.detectChanges();
        expect(comp.form).toBeDefined();

        comp.form = null;
        comp.ngOnInit();

        fixture.detectChanges();
        expect(comp.form).toBeDefined();
    });

    it('should set form for edit after ngOnInit()', () => {
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        fixture.detectChanges();
        expect(comp.form).toBeDefined();
    });

    it('should allow to save task as draft after filling task name and select one craft', () => {
        spyOn(comp, 'onSaveAsDraft').and.callThrough();
        spyOn(comp.onSubmit, 'emit');

        const expectedRes = new SaveTaskResourceWithVersions(
            new SaveTaskResource(
                MOCK_PROJECT_1.id,
                'Test draft',
                '',
                'DRAFT',
                '',
                'testCraftId',
                null,
                null,
                null,
                null,
                []),
            undefined, undefined);

        comp.form.get('name').setValue('Test draft');
        comp.form.get('craft').setValue({craftId: 'testCraftId', color: 'blue'});
        comp.mode = CaptureModeEnum.create;
        fixture.detectChanges();

        el.querySelector(dataAutomationSaveAsDraftSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.onSaveAsDraft).toHaveBeenCalled();
        expect(comp.onSubmit.emit).toHaveBeenCalledWith(expectedRes);
    });

    it('should allow to assign and send a task filling task name and select one craft, company and person', () => {
        spyOn(comp, 'onAssignAndSend').and.callThrough();
        comp.form.get('craft').setValue(testDropdown[1]);
        comp.form.get('company').setValue(testDropdown[3]);
        comp.form.get('person').setValue(testDropdown[5]);
        comp.form.get('name').setValue('Test assign');
        comp.mode = CaptureModeEnum.create;

        fixture.detectChanges();
        el.querySelector(dataAutomationAssignAndSendSelector).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(comp.onAssignAndSend).toHaveBeenCalled();
    });

    it('should assign and send a task after filling every field', () => {
        spyOn(comp, 'onAssignAndSend').and.callThrough();
        spyOn(comp.onSubmit, 'emit');

        comp.form.get('craft').setValue({craftId: 'testCraftId', color: 'blue'});
        comp.form.get('company').setValue(testDropdown[3]);
        comp.form.get('person').setValue({id: 'testAssigneeId', picture: 'pictureblob'});
        comp.form.get('name').setValue('Test assign');
        comp.form.get('description').setValue('Test description');
        comp.form.get('location').setValue('location');
        comp.form.get('workarea').setValue(testDropdown[2].value);
        comp.form.get('range').setValue({
            start: moment(),
            end: moment(),
        });
        comp.form.get('files').setValue([new File([''], '')]);
        comp.mode = CaptureModeEnum.create;

        const expectedRes = new SaveTaskResourceWithVersions(mockTaskResource, undefined, undefined);

        fixture.detectChanges();
        el.querySelector(dataAutomationAssignAndSendSelector).dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(comp.onAssignAndSend).toHaveBeenCalled();
        expect(comp.onSubmit.emit).toHaveBeenCalledWith(expectedRes);
    });

    it('should emit event onClose when cancel button is clicked', () => {
        spyOn(comp.onCancel, 'emit');
        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.onCancel.emit).toHaveBeenCalled();
    });

    it('should call handleCancel and navigateToInformation when clicking cancel in update mode', () => {
        comp.mode = CaptureModeEnum.update;
        spyOn(comp, 'handleCancel').and.callThrough();

        el.querySelector(dataAutomationSelectorCancel).dispatchEvent(clickEvent);
        expect(comp.handleCancel).toHaveBeenCalled();
    });

    it('should call onUpdate when update button is clicked', () => {
        comp.mode = CaptureModeEnum.update;
        spyOn(comp, 'onClickUpdate').and.callThrough();

        el.querySelector(dataAutomationSelectorUpdate).dispatchEvent(clickEvent);
        expect(comp.onClickUpdate).toHaveBeenCalled();
    });

    it('should make workarea dropdown to be enabled on filled workarea list', () => {
        expect(comp.form.get('workarea').enabled).toBeTruthy();
    });

    it('should make workarea dropdown to be disabled on empty workarea list', () => {
        when(workareaQueriesMock.observeWorkareas()).thenReturn(of([]));
        comp.ngOnInit();

        expect(comp.form.get('workarea').disabled).toBeTruthy();
    });

    it('should pre-fill the form when default values is true', () => {
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.form.get('range').value.start).toBeTruthy();
        expect(comp.form.get('range').value.end).toBeTruthy();
    });

    it('should set person on form when company is selected and there is only a person on the list', () => {
        spyOn(projectParticipantsService, 'findAllByCompany').and.returnValue(of({
            items: [
                MOCK_PARTICIPANT,
            ],
        }));

        const participantOption =
            {label: MOCK_PARTICIPANT.user.displayName, value: {id: MOCK_PARTICIPANT.id, picture: MOCK_PARTICIPANT.user.picture}};
        const expectedParticipant = participantOption.value;

        comp.companyList = [{label: TEST_COMPANY_1_REFERENCE.displayName, value: TEST_COMPANY_1_REFERENCE.id}];
        comp.personList = [participantOption];

        comp.form.get('company').setValue(comp.companyList[0]);

        expect(comp.form.get('person').value.id).toBe(expectedParticipant.id);
    });

    it('should disable company and person dropdown when user cannot assign the task', () => {
        const taskWithoutAssignPermission = Object.assign({}, MOCK_TASK, {
            permissions: Object.assign({}, MOCK_TASK.permissions, {
                canAssign: false,
            }),
        });

        when(projectTaskQueriesMock.observeTaskById(taskWithoutAssignPermission.id)).thenReturn(of(taskWithoutAssignPermission));

        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.form.get('company').disabled).toBeTruthy();
        expect(comp.form.get('person').disabled).toBeTruthy();
    });

    it('should enable company and person dropdown in create mode', () => {
        comp.companyList = [{label: TEST_COMPANY_1_REFERENCE.displayName, value: TEST_COMPANY_1_REFERENCE.id}];
        comp.personList = [{label: MOCK_PARTICIPANT.user.displayName, value: {id: MOCK_PARTICIPANT.id, picture: ''}}];
        comp.mode = CaptureModeEnum.create;

        comp.handleCancel();
        expect(comp.form.get('company').enabled).toBeTruthy();
        comp.form.get('company').setValue(testDropdown[3]);

        expect(comp.form.get('person').enabled).toBeTruthy();
    });

    it('should fill company and person controls when default values are available in the options', () => {
        const assignedParticipant = MOCK_PARTICIPANT;
        const assignedCompany = MOCK_COMPANY_1;
        const companyList = {
            companies: [
                MOCK_COMPANY_1,
            ],
        };
        const participantList = {
            items: [
                MOCK_PARTICIPANT,
            ],
        };
        const task = Object.assign({}, MOCK_TASK, {
            assignee: new ResourceReferenceWithPicture(assignedParticipant.id, assignedParticipant.user.displayName,
                assignedParticipant.user.picture),
            company: new ResourceReference(assignedCompany.id, assignedCompany.name),
        });

        spyOn(projectParticipantsService, 'findAllByCompany').and.returnValue(of(participantList));
        spyOn(projectCompanyService, 'findAll').and.returnValue(of(companyList));

        when(projectTaskQueriesMock.observeTaskById(task.id)).thenReturn(of(task));

        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.form.get('company').value).toBe(task.company.id);
        expect(comp.form.get('person').value.id).toBe(task.assignee.id);
    });

    it('should not fill company and person controls when default values are not available in the options', () => {
        const assignedParticipant = MOCK_PARTICIPANT;
        const assignedCompany = MOCK_COMPANY_1;
        const companyList = {
            companies: [
                MOCK_COMPANY_2,
                MOCK_COMPANY_3,
            ],
        };
        const participantList = {
            participants: [
                MOCK_PARTICIPANT_2,
                MOCK_PARTICIPANT_3,
            ],
        };
        const task = Object.assign({}, MOCK_TASK, {
            assignee: new ResourceReferenceWithPicture(assignedParticipant.id, assignedParticipant.user.displayName, null),
            company: new ResourceReference(assignedCompany.id, assignedCompany.name),
        });

        spyOn(projectCompanyService, 'findAll').and.returnValue(of(companyList));
        spyOn(projectParticipantsService, 'findAllByCompany').and.returnValue(of(participantList));

        when(projectTaskQueriesMock.observeTaskById(task.id)).thenReturn(of(task));

        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.form.get('company').value).toBeNull();
        expect(comp.form.get('person').value).toBeNull();
    });

    it('should use first Task value from the store to populate form and ignore subsequent changes to that value', () => {
        const updatedTask = Object.assign({}, MOCK_TASK, {location: 'Lorem ipsum'});
        const expectedResult = MOCK_TASK;
        const taskSource = new ReplaySubject<Task>(1);

        taskSource.next(MOCK_TASK);

        when(projectTaskQueriesMock.observeTaskById(MOCK_TASK.id)).thenReturn(taskSource);

        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.form.get('location').value).toEqual(expectedResult.location);

        taskSource.next(updatedTask);

        expect(comp.form.get('location').value).toEqual(expectedResult.location);
    });

    it('should set focus on "name" field when creating new task', () => {
        spyOn(comp.nameInput, 'setFocus');

        comp.mode = CaptureModeEnum.create;
        comp.ngOnInit();

        expect(comp.nameInput.setFocus).toHaveBeenCalled();
    });

    it('should set focus on "company" field when defined on currentModalData', () => {
        spyOn(comp.companyInput, 'setFocus');
        spyOnProperty(modalService, 'currentModalData', 'get').and.returnValue({
            taskId: MOCK_TASK.id,
            focus: ProjectTaskCaptureFormInputEnum.Company,
        });
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.companyInput.setFocus).toHaveBeenCalled();
    });

    it('should set focus on "work area" field when defined on currentModalData', () => {
        spyOn(comp.workareaInput, 'setFocus');
        spyOnProperty(modalService, 'currentModalData', 'get').and.returnValue({
            taskId: MOCK_TASK.id,
            focus: ProjectTaskCaptureFormInputEnum.Workarea,
        });
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.workareaInput.setFocus).toHaveBeenCalled();
    });

    it('should set focus on "end" field when defined on currentModalData', () => {
        spyOn(comp.dateRangeInput, 'setFocus');
        spyOnProperty(modalService, 'currentModalData', 'get').and.returnValue({
            taskId: MOCK_TASK.id,
            focus: ProjectTaskCaptureFormInputEnum.EndDate,
        });
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.dateRangeInput.setFocus).toHaveBeenCalledWith(DatepickerCalendarSelectionTypeEnum.EndDate);
    });

    it('should set focus on "start" field when defined on currentModalData', () => {
        spyOn(comp.dateRangeInput, 'setFocus');
        spyOnProperty(modalService, 'currentModalData', 'get').and.returnValue({
            taskId: MOCK_TASK.id,
            focus: ProjectTaskCaptureFormInputEnum.StartDate,
        });
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.dateRangeInput.setFocus).toHaveBeenCalledWith(DatepickerCalendarSelectionTypeEnum.StartDate);
    });

    it('should set focus on "description" field when defined on currentModalData', () => {
        spyOn(comp.description, 'setFocus');
        spyOnProperty(modalService, 'currentModalData', 'get').and.returnValue({
            taskId: MOCK_TASK.id,
            focus: ProjectTaskCaptureFormInputEnum.Description,
        });
        comp.mode = CaptureModeEnum.update;
        comp.ngOnInit();

        expect(comp.description.setFocus).toHaveBeenCalled();
    });

    it('should not require assignment when user is editing and has permission to unassign', () => {
        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.isAssignmentRequired()).toBe(false);
    });

    it('should require assignment when user is editing and has no permission to unassign', () => {
        const taskWithoutUnassignPermission = Object.assign({}, MOCK_TASK, {
            permissions: Object.assign({}, MOCK_TASK.permissions, {
                canAssign: true,
                canUnassign: false,
            }),
        });

        when(projectTaskQueriesMock.observeTaskById(taskWithoutUnassignPermission.id)).thenReturn(of(taskWithoutUnassignPermission));

        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.isAssignmentRequired()).toBe(true);
    });

    it('should not require assignment when user is editing a task without assignee' +
        'and has permission to unassign', () => {
        const taskUnassignedWithPermission = Object.assign({}, MOCK_TASK_NOT_ASSIGNED, {
            permissions: Object.assign({}, MOCK_TASK.permissions, {
                canAssign: true,
                canUnassign: true,
            }),
        });

        when(projectTaskQueriesMock.observeTaskById(taskUnassignedWithPermission.id)).thenReturn(of(taskUnassignedWithPermission));

        comp.mode = CaptureModeEnum.update;
        comp.hasDefaultValues = true;
        comp.ngOnInit();

        expect(comp.isAssignmentRequired()).toBe(false);
    });

    it('should not require assignment when user is creating a task', () => {
        comp.mode = CaptureModeEnum.create;
        comp.hasDefaultValues = false;
        comp.ngOnInit();

        expect(comp.isAssignmentRequired()).toBe(false);
    });

    it('should add position to each work area text', () => {
        const [workArea] = comp.workAreaList;

        expect(workArea.label).toBe(`${MOCK_WORKAREA_B.position}. ${MOCK_WORKAREA_B.name}`);
    });
});
