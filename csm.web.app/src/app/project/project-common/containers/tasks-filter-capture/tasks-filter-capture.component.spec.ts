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
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    cloneDeep,
    flatten,
    omit,
    uniqBy
} from 'lodash';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {MOCK_PROJECT_CRAFT_LIST} from '../../../../../test/mocks/crafts';
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2,
    MOCK_PARTICIPANT_3,
    MOCK_PARTICIPANT_4,
} from '../../../../../test/mocks/participants';
import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {CollapsibleSelectValue} from '../../../../shared/ui/collapsible-select/collapsible-select.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {
    ParticipantByCompany,
    ProjectParticipantQueries
} from '../../store/participants/project-participant.queries';
import {ProjectFiltersCaptureContextEnum} from '../project-filter-capture/project-filter-capture.component';
import {
    TASK_STATUS_DEFAULT_CONTEXT_OPTIONS,
    TASK_STATUS_RESCHEDULE_CONTEXT_OPTIONS,
    TASKS_FILTER_FORM_DEFAULT_VALUE,
    TasksFilterCaptureComponent,
    TasksFilterFormData,
    TasksFilterFormDataParsed
} from './tasks-filter-capture.component';
import {TasksFilterCaptureTestComponent} from './tasks-filter-capture.test.component';

describe('Tasks Filter Capture Component', () => {
    let component: TasksFilterCaptureComponent;
    let testHostComponent: TasksFilterCaptureTestComponent;
    let fixture: ComponentFixture<TasksFilterCaptureTestComponent>;
    let de: DebugElement;

    const projectCraftQueriesMock: ProjectCraftQueries = mock(ProjectCraftQueries);
    const participantQueriesMock: ProjectParticipantQueries = mock(ProjectParticipantQueries);
    const userQueriesMock: UserQueries = mock(UserQueries);

    const currentUser: UserResource = TEST_USER_RESOURCE_REGISTERED;
    const companyA: ResourceReference = new ResourceReference('companyA', 'companyA');
    const companyB: ResourceReference = new ResourceReference('companyB', 'companyB');
    const companyC: ResourceReference = new ResourceReference('companyC', 'companyC');
    const baseProjectParticipant: ProjectParticipantResource = {
        ...MOCK_PARTICIPANT,
        company: {...companyA},
        user: {...MOCK_PARTICIPANT.user, id: currentUser.id},
    };
    const mockedParticipantsCompanyA: ProjectParticipantResource[] = [
        baseProjectParticipant,
    ];
    const mockedParticipantsCompanyB: ProjectParticipantResource[] = [
        {...MOCK_PARTICIPANT_2, company: companyB},
        {...MOCK_PARTICIPANT_3, company: companyB},
    ];
    const mockedParticipantsCompanyC: ProjectParticipantResource[] = [
        {...MOCK_PARTICIPANT_4, company: companyC},
    ];
    const mockProjectParticipantByCompany: ParticipantByCompany[] = [
        {
            ...companyA,
            participants: mockedParticipantsCompanyA,
        },
        {
            ...companyB,
            participants: mockedParticipantsCompanyB,
        },
    ];

    const participantIdsFromCompanyA = mockedParticipantsCompanyA.map(participant => participant.id);
    const participantIdsFromCompanyB = mockedParticipantsCompanyB.map(participant => participant.id);
    const craftIdSelected = MOCK_PROJECT_CRAFT_LIST.projectCrafts[0].id;
    const allCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
    const defaultTasksFiltersFormData: TasksFilterFormData = {
        ...omit(TASKS_FILTER_FORM_DEFAULT_VALUE, 'assigneeIds'),
        assignees: {
            participantIds: [],
            companyIds: [],
        },
        hasTopics: null,
    };
    const allStatusesSelected: { [key in TaskStatusEnum]: boolean } = {
        [TaskStatusEnum.CLOSED]: true,
        [TaskStatusEnum.DRAFT]: true,
        [TaskStatusEnum.OPEN]: true,
        [TaskStatusEnum.STARTED]: true,
        [TaskStatusEnum.ACCEPTED]: true,
    };
    const someStatusesSelected: { [key in TaskStatusEnum]: boolean } = {
        [TaskStatusEnum.CLOSED]: false,
        [TaskStatusEnum.DRAFT]: false,
        [TaskStatusEnum.OPEN]: false,
        [TaskStatusEnum.STARTED]: true,
        [TaskStatusEnum.ACCEPTED]: true,
    };
    const tasksFilterFormData: TasksFilterFormData = {
        assignees: {
            participantIds: [],
            companyIds: [baseProjectParticipant.company.id],
        },
        projectCraftIds: [craftIdSelected],
        hasTopics: true,
        allDaysInDateRange: true,
        topicCriticality: {
            [TopicCriticalityEnum.CRITICAL]: true,
        },
        status: allStatusesSelected,
    };
    const parsedTasksFilterFormData: TasksFilterFormDataParsed = {
        assigneeIds: [...participantIdsFromCompanyA],
        ...omit(tasksFilterFormData, 'assignees'),
    };
    const defaultFormValuesForSelectedCollapsibleSelectValue: TasksFilterFormData = {
        ...tasksFilterFormData,
        projectCraftIds: allCraftIds,
        assignees: {
            participantIds: [...participantIdsFromCompanyA, ...participantIdsFromCompanyB],
            companyIds: [],
        },
        hasTopics: false,
        allDaysInDateRange: false,
        topicCriticality: {
            [TopicCriticalityEnum.CRITICAL]: false,
        },
    };
    const updateTasksFilterFormDataParsed = (initialFormFields: TasksFilterFormDataParsed,
                                             newFormFields: Partial<TasksFilterFormDataParsed>): TasksFilterFormDataParsed => ({
        ...initialFormFields,
        ...newFormFields,
    });

    const currentUserSubject = new BehaviorSubject<UserResource>(currentUser);
    const craftsSubject = new BehaviorSubject<ProjectCraftResource[]>(MOCK_PROJECT_CRAFT_LIST.projectCrafts);
    const mockProjectParticipantByCompanySubject = new BehaviorSubject<ParticipantByCompany[]>(mockProjectParticipantByCompany);

    const tasksFilterCaptureComponentSelector = 'ss-tasks-filter-capture';
    const dataAutomationAllDaysInDateRangeInputSelector = '[data-automation="all-days-in-date-range"]';
    const dataAutomationRescheduleTaskStatusCalloutSelector = '[data-automation="task-status-reschedule-callout"]';
    const dataAutomationTopicsFilterSectionSelector = '[data-automation="topics-filter-section"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
        ],
        declarations: [
            TasksFilterCaptureComponent,
            TasksFilterCaptureTestComponent,
        ],
        providers: [
            {
                provide: ProjectCraftQueries,
                useFactory: () => instance(projectCraftQueriesMock),
            },
            {
                provide: ProjectParticipantQueries,
                useFactory: () => instance(participantQueriesMock),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(TasksFilterCaptureTestComponent);
        testHostComponent = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(tasksFilterCaptureComponentSelector));
        component = de.componentInstance;

        craftsSubject.next(MOCK_PROJECT_CRAFT_LIST.projectCrafts);
        mockProjectParticipantByCompanySubject.next(mockProjectParticipantByCompany);

        when(projectCraftQueriesMock.observeCraftsSortedByName()).thenReturn(craftsSubject);
        when(userQueriesMock.observeCurrentUser()).thenReturn(currentUserSubject);
        when(participantQueriesMock.observeActiveParticipantsByCompanies()).thenReturn(mockProjectParticipantByCompanySubject);

        fixture.detectChanges();
    });

    it('should set the default form value when the default values were not provided', () => {
        expect(component.form.value).toEqual(TASKS_FILTER_FORM_DEFAULT_VALUE);
    });

    it('should set the form value based on the provided default value', () => {
        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormData;

        fixture.detectChanges();

        expect(component.form.value).toEqual(parsedTasksFilterFormData);
    });

    it('should retrieve correct default form value', () => {
        expect(component.getFormValue()).toEqual(defaultTasksFiltersFormData);
    });

    it('should update assignees from control value based on the default values only when participant data has been resolved', () => {
        mockProjectParticipantByCompanySubject.next([]);

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormData;
        fixture.detectChanges();

        expect(component.form.controls.assigneeIds.value).toEqual([]);

        mockProjectParticipantByCompanySubject.next(mockProjectParticipantByCompany);
        expect(component.form.controls.assigneeIds.value).toEqual(parsedTasksFilterFormData.assigneeIds);
    });

    it('should not update assignees from control value if the default values where already applied and participant data changed', () => {
        const newAssignees = [...participantIdsFromCompanyA, ...participantIdsFromCompanyB];
        const newProjectParticipantsByCompany: ParticipantByCompany[] = [
            ...mockProjectParticipantByCompany,
            {
                ...companyC,
                participants: mockedParticipantsCompanyC,
            },
        ];

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormData;
        fixture.detectChanges();

        mockProjectParticipantByCompanySubject.next(mockProjectParticipantByCompany);
        expect(component.form.controls.assigneeIds.value).toEqual(parsedTasksFilterFormData.assigneeIds);

        component.form.controls.assigneeIds.setValue(newAssignees);

        mockProjectParticipantByCompanySubject.next(newProjectParticipantsByCompany);
        expect(component.form.controls.assigneeIds.value).toEqual(newAssignees);
    });

    it('should compute collapsibleSelectValue to TRUE when default values are the same has the default component values ' +
        'and useCriteria is set to TRUE', () => {
        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultTasksFiltersFormData;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should compute collapsibleSelectValue to TRUE when default values have all the valid properties set ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultFormValuesForSelectedCollapsibleSelectValue;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should compute collapsibleSelectValue to TRUE when default values have all the valid properties set ' +
        'and useCriteria is set to TRUE but the participants data is yet not available', () => {
        mockProjectParticipantByCompanySubject.next([]);

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultFormValuesForSelectedCollapsibleSelectValue;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should compute collapsibleSelectValue to TRUE when default values have all the valid properties set ' +
        'and useCriteria is set to TRUE but the participants data is later available', () => {
        mockProjectParticipantByCompanySubject.next([]);

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultFormValuesForSelectedCollapsibleSelectValue;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe(true);

        mockProjectParticipantByCompanySubject.next(mockProjectParticipantByCompany);
        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have all the valid properties set ' +
        'and useCriteria is set to TRUE but the crafts data is yet not available', () => {
        craftsSubject.next([]);

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultFormValuesForSelectedCollapsibleSelectValue;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have only some participants selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            assignees: {
                participantIds: participantIdsFromCompanyA,
                companyIds: [],
            },
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have only some crafts selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            projectCraftIds: [craftIdSelected],
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have only some task status selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            status: someStatusesSelected,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have topic criticality selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            topicCriticality: {
                [TopicCriticalityEnum.CRITICAL]: true,
            },
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have hasTopics selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            hasTopics: true,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should compute collapsibleSelectValue to \'indeterminate\' when default values have all days in date range selected ' +
        'and useCriteria is set to TRUE and all the required data is available', () => {
        const defaultValues: TasksFilterFormData = {
            ...defaultFormValuesForSelectedCollapsibleSelectValue,
            allDaysInDateRange: true,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe('indeterminate');
    });

    it('should update collapsibleSelectValue value when defaultValues changes', () => {
        component.collapsibleSelectValue = false;

        testHostComponent.defaultValues = defaultTasksFiltersFormData;
        testHostComponent.useCriteria = true;
        fixture.detectChanges();
        expect(component.collapsibleSelectValue).toBe(true);

        component.collapsibleSelectValue = false;

        testHostComponent.defaultValues = tasksFilterFormData;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to FALSE when useCriteria is set to FALSE', () => {
        testHostComponent.useCriteria = false;
        testHostComponent.defaultValues = defaultTasksFiltersFormData;
        fixture.detectChanges();

        expect(component.collapsibleSelectValue).toBe(false);
    });

    it('should set collapsibleSelectValue to TRUE and set the default form value when handleSelect is called with true', () => {
        component.collapsibleSelectValue = false;

        component.handleSelect(true);

        expect(component.collapsibleSelectValue).toBe(true);
        expect(component.form.value).toEqual(TASKS_FILTER_FORM_DEFAULT_VALUE);
    });

    it('should set collapsibleSelectValue to FALSE and set the default form value when handleSelect is called with false', () => {
        component.collapsibleSelectValue = true;

        component.handleSelect(false);

        expect(component.collapsibleSelectValue).toBe(false);
        expect(component.form.value).toEqual(TASKS_FILTER_FORM_DEFAULT_VALUE);
    });

    it('should return the current form value with companyIds when getFormValue is called and ' +
        'all the participants of the companies are selected', () => {
        const companyIds = mockProjectParticipantByCompany.map(participantByCompany => participantByCompany.id);
        const allAssignees = uniqBy(
            flatten(mockProjectParticipantByCompany
                .map(participantByCompany => participantByCompany.participants)),
            (participant: ProjectParticipantResource) => participant.id);
        const allAssigneesIds = allAssignees.map(participant => participant.id);
        const expectedResult: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            assignees: {
                companyIds,
                participantIds: [],
            },
        };

        component.form.controls.assigneeIds.setValue(allAssigneesIds);

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should return the current form value without companyIds when getFormValue is called and ' +
        'not all the participants of a company are selected', () => {
        const currentAssigneeSelected = mockedParticipantsCompanyB[0].id;
        const expectedResult: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            assignees: {
                companyIds: [],
                participantIds: [currentAssigneeSelected],
            },
        };

        component.form.controls.assigneeIds.setValue([currentAssigneeSelected]);

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should return the current form value when getFormValue is called and hasTopics is false', () => {
        const expectedResult = defaultTasksFiltersFormData;

        component.form.controls.hasTopics.setValue(false);

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should return the current form value when getFormValue is called and hasTopics is true', () => {
        const expectedResult: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            hasTopics: true,
        };

        component.form.controls.hasTopics.setValue(true);

        expect(component.getFormValue()).toEqual(expectedResult);
    });

    it('should parse the provided companyId to assigneeIds when it is provided in the defaultValues', () => {
        const companyId = companyB.id;
        const companyBAssigneeIds = mockedParticipantsCompanyB.map(participant => participant.id);
        const tasksFilterFormDataWithAssigneeCompany: TasksFilterFormData = {
            ...TASKS_FILTER_FORM_DEFAULT_VALUE,
            assignees: {
                companyIds: [companyId],
                participantIds: [],
            },
        };
        const expectedResult: TasksFilterFormDataParsed = {
            ...TASKS_FILTER_FORM_DEFAULT_VALUE,
            assigneeIds: companyBAssigneeIds,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormDataWithAssigneeCompany;
        fixture.detectChanges();

        expect(component.form.value).toEqual(expectedResult);
    });

    it('should parse the hasTopics to false when it is provided in the defaultValues as null', () => {
        const tasksFilterFormDataWithNullHasTopics = defaultTasksFiltersFormData;
        const expectedResult: TasksFilterFormDataParsed = {
            ...TASKS_FILTER_FORM_DEFAULT_VALUE,
            hasTopics: false,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormDataWithNullHasTopics;
        fixture.detectChanges();

        expect(component.form.value).toEqual(expectedResult);
    });

    it('should parse the hasTopics to true when it is provided in the defaultValues as true', () => {
        const tasksFilterFormDataWithTrueHasTopics: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            hasTopics: true,
        };
        const expectedResult: TasksFilterFormDataParsed = {
            ...TASKS_FILTER_FORM_DEFAULT_VALUE,
            hasTopics: true,
        };

        testHostComponent.useCriteria = true;
        testHostComponent.defaultValues = tasksFilterFormDataWithTrueHasTopics;
        fixture.detectChanges();

        expect(component.form.value).toEqual(expectedResult);
    });

    it('should parse and sort participantsByCompanyList correctly', () => {
        const reversedParticipantsByCompany = mockProjectParticipantByCompany.reverse();
        const newProjectParticipantsByCompany = [
            Object.assign({}, new ResourceReference('companyC', 'companyC'), {participants: []}),
            ...reversedParticipantsByCompany,
        ];

        mockProjectParticipantByCompanySubject.next(newProjectParticipantsByCompany);

        expect(component.participantsByCompanyList.length).toEqual(newProjectParticipantsByCompany.length);
        expect(component.participantsByCompanyList[0].groupText).toBe('Generic_MyCompanyLabel');
        expect(component.participantsByCompanyList[1].groupText).toBeNull();
        expect(component.participantsByCompanyList[2].groupText).toBeNull();
    });

    it('should recalculate collapsibleSelectValue when there are changes in form controls', () => {
        component.collapsibleSelectValue = true;

        component.form.controls.status.controls[TaskStatusEnum.STARTED].setValue(true);
        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');

        component.form.controls.status.controls[TaskStatusEnum.STARTED].setValue(false);
        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should set collapsibleSelectValue to TRUE when form values are updated with all statuses, crafts and assignees are selected ' +
        'and all days in date range, has topics and criticality are not selected', () => {
        const projectCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
        const assigneeIds = [...mockedParticipantsCompanyA, ...mockedParticipantsCompanyB].map(participant => participant.id);
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const status = allStatusesSelected;
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            assigneeIds,
            projectCraftIds,
            status,
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue).toBe(true);
    });

    it('should set collapsibleSelectValue to \'indeterminate\' when form values are updated with all statuses, craft and ' +
        'assignees are selected but all days in date range, has topics and criticality are selected', () => {
        const projectCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
        const assigneeIds = [...mockedParticipantsCompanyA, ...mockedParticipantsCompanyB].map(participant => participant.id);
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const status = allStatusesSelected;
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            assigneeIds,
            projectCraftIds,
            status,
            hasTopics: true,
            allDaysInDateRange: true,
            topicCriticality: {
                [TopicCriticalityEnum.CRITICAL]: true,
            },
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to \'indeterminate\' when form values are updated with all crafts and assignees ' +
        'are selected and all days in date range, has topics and criticality are not selected but not all statuses are selected', () => {
        const projectCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
        const assigneeIds = [...mockedParticipantsCompanyA, ...mockedParticipantsCompanyB].map(participant => participant.id);
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const status: { [key in TaskStatusEnum]: boolean } = {
            [TaskStatusEnum.CLOSED]: false,
            [TaskStatusEnum.DRAFT]: true,
            [TaskStatusEnum.OPEN]: true,
            [TaskStatusEnum.STARTED]: true,
            [TaskStatusEnum.ACCEPTED]: true,
        };
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            assigneeIds,
            projectCraftIds,
            status,
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to \'indeterminate\' when form values are updated with all statuses and assignees ' +
        'are selected and all days in date range, has topics and criticality are not selected but not all crafts are selected', () => {
        const projectCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
        const filteredProjectCraftIds = projectCraftIds[0];
        const assigneeIds = [...mockedParticipantsCompanyA, ...mockedParticipantsCompanyB].map(participant => participant.id);
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const status = allStatusesSelected;
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            assigneeIds,
            status,
            projectCraftIds: [filteredProjectCraftIds],
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to \'indeterminate\' when form values are updated with all statuses and crafts are selected ' +
        'and all days in date range, has topics and criticality are not selected but not all assignees are selected', () => {
        const projectCraftIds = MOCK_PROJECT_CRAFT_LIST.projectCrafts.map(craft => craft.id);
        const assigneeIds = [...mockedParticipantsCompanyA, ...mockedParticipantsCompanyB].map(participant => participant.id);
        const filteredAssigneeIds = assigneeIds[0];
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const status = allStatusesSelected;
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            projectCraftIds,
            status,
            assigneeIds: [filteredAssigneeIds],
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to \'indeterminate\' when form values are updated with all statuses, crafts and ' +
        'assignees are not selected and all days in date range, has topics and criticality are selected', () => {
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            hasTopics: true,
            allDaysInDateRange: true,
            topicCriticality: {
                [TopicCriticalityEnum.CRITICAL]: true,
            },
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.collapsibleSelectValue = false;

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');
    });

    it('should set collapsibleSelectValue to TRUE when form returns to it\'s initial state', () => {
        const defaultFormValues = cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE);
        const newFormValues: Partial<TasksFilterFormDataParsed> = {
            hasTopics: true,
        };
        const updatedFormValue = updateTasksFilterFormDataParsed(defaultFormValues, newFormValues);

        component.form.patchValue(updatedFormValue);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBe('indeterminate');

        component.form.patchValue(TASKS_FILTER_FORM_DEFAULT_VALUE);

        expect(component.collapsibleSelectValue as CollapsibleSelectValue).toBeTruthy();
    });

    it('should filter assignees when default values have a unknown company id', () => {
        const defaultValues: TasksFilterFormData = {
            ...tasksFilterFormData, assignees: {
                companyIds: ['INVALID-COMPANY'],
                participantIds: [],
            },
        };

        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.form.controls.assigneeIds.value).toEqual([]);
    });

    it('should filter assignees when default values have participants that are not associated with any known company', () => {
        const participants = participantIdsFromCompanyA;
        const defaultValues: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            assignees: {
                companyIds: [],
                participantIds: [...participants, 'UNKNOWN-PARTICIPANT'],
            },
        };

        testHostComponent.defaultValues = defaultValues;
        fixture.detectChanges();

        expect(component.form.controls.assigneeIds.value).toEqual(participants);
    });

    it(`should set isRescheduleContext to TRUE when context is ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();

        expect(component.isRescheduleContext).toBeTruthy();
    });

    it(`should not set isRescheduleContext to TRUE when context is not ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(component.isRescheduleContext).toBeFalsy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(component.isRescheduleContext).toBeFalsy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(component.isRescheduleContext).toBeFalsy();
    });

    it(`should not render task status reschedule callout when context is not ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).not.toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).not.toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).not.toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).not.toBeDefined();
    });

    it(`should render task status reschedule callout when context is ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).not.toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();

        expect(getElement(dataAutomationRescheduleTaskStatusCalloutSelector)).toBeDefined();
    });

    it(`should not update task status list options and controls when context is not ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(component.statusOptions).toEqual(TASK_STATUS_DEFAULT_CONTEXT_OPTIONS);
        expect(component.form.controls.status.controls[TaskStatusEnum.CLOSED].disabled).toBeFalsy();
        expect(component.form.controls.status.controls[TaskStatusEnum.ACCEPTED].disabled).toBeFalsy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(component.statusOptions).toEqual(TASK_STATUS_DEFAULT_CONTEXT_OPTIONS);
        expect(component.form.controls.status.controls[TaskStatusEnum.CLOSED].disabled).toBeFalsy();
        expect(component.form.controls.status.controls[TaskStatusEnum.ACCEPTED].disabled).toBeFalsy();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(component.statusOptions).toEqual(TASK_STATUS_DEFAULT_CONTEXT_OPTIONS);
        expect(component.form.controls.status.controls[TaskStatusEnum.CLOSED].disabled).toBeFalsy();
        expect(component.form.controls.status.controls[TaskStatusEnum.ACCEPTED].disabled).toBeFalsy();
    });

    it(`should update task status list options and controls when context is ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();

        expect(component.statusOptions).toEqual(TASK_STATUS_RESCHEDULE_CONTEXT_OPTIONS);
        expect(component.form.controls.status.controls[TaskStatusEnum.CLOSED].disabled).toBeTruthy();
        expect(component.form.controls.status.controls[TaskStatusEnum.ACCEPTED].disabled).toBeTruthy();
    });

    it('should set allDaysInDateRange input to disabled, set it\'s value to FALSE and not emit event when ' +
        'allDaysInDateRangeDisabled is TRUE and collapsibleSelectValue is currently FALSE', () => {
        component.form.controls.allDaysInDateRange.setValue(true);

        spyOn(component.form.controls.allDaysInDateRange, 'setValue').and.callThrough();

        component.collapsibleSelectValue = false;

        testHostComponent.allDaysInDateRangeDisabled = true;
        fixture.detectChanges();

        expect(component.form.controls.allDaysInDateRange.value).toBeFalsy();
        expect(component.form.controls.allDaysInDateRange.setValue).toHaveBeenCalledWith(false, {emitEvent: false});
        expect(getElement(dataAutomationAllDaysInDateRangeInputSelector).attributes['disabled']).toBeDefined();
    });

    it('should set allDaysInDateRange input to disabled, set it\'s value to FALSE and emit event when ' +
        'allDaysInDateRangeDisabled is TRUE and collapsibleSelectValue is currently TRUE', () => {
        component.form.controls.allDaysInDateRange.setValue(true);

        spyOn(component.form.controls.allDaysInDateRange, 'setValue').and.callThrough();

        component.collapsibleSelectValue = true;

        testHostComponent.allDaysInDateRangeDisabled = true;
        fixture.detectChanges();

        expect(component.form.controls.allDaysInDateRange.value).toBeFalsy();
        expect(component.form.controls.allDaysInDateRange.setValue).toHaveBeenCalledWith(false, {emitEvent: true});
        expect(getElement(dataAutomationAllDaysInDateRangeInputSelector).attributes['disabled']).toBeDefined();
    });

    it('should set allDaysInDateRange input to disabled, set it\'s value to FALSE and emit event when ' +
        'allDaysInDateRangeDisabled is TRUE and collapsibleSelectValue is currently indeterminate', () => {
        component.form.controls.allDaysInDateRange.setValue(true);

        spyOn(component.form.controls.allDaysInDateRange, 'setValue').and.callThrough();

        component.collapsibleSelectValue = 'indeterminate';

        testHostComponent.allDaysInDateRangeDisabled = true;
        fixture.detectChanges();

        expect(component.form.controls.allDaysInDateRange.value).toBeFalsy();
        expect(component.form.controls.allDaysInDateRange.setValue).toHaveBeenCalledWith(false, {emitEvent: true});
        expect(getElement(dataAutomationAllDaysInDateRangeInputSelector).attributes['disabled']).toBeDefined();
    });

    it('should not set allDaysInDateRange input to disabled when allDaysInDateRangeDisabled is FALSE', () => {
        testHostComponent.allDaysInDateRangeDisabled = false;
        fixture.detectChanges();

        expect(getElement(dataAutomationAllDaysInDateRangeInputSelector).attributes['disabled']).not.toBeDefined();
    });

    it('should set allDaysInDateRange to FALSE when it\'s value changes to TRUE but allDaysInDateRangeDisabled is set to TRUE', () => {
        const defaultFiltersWithAllDaysInDateRangeSetToFalse: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            allDaysInDateRange: false,
        };
        const defaultFiltersWithAllDaysInDateRangeSetToTrue: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            allDaysInDateRange: true,
        };

        testHostComponent.allDaysInDateRangeDisabled = true;

        testHostComponent.defaultValues = defaultFiltersWithAllDaysInDateRangeSetToFalse;
        fixture.detectChanges();
        expect(component.form.controls.allDaysInDateRange.value).toBe(false);

        testHostComponent.defaultValues = defaultFiltersWithAllDaysInDateRangeSetToTrue;
        fixture.detectChanges();
        expect(component.form.controls.allDaysInDateRange.value).toBe(false);
    });

    it('should set allDaysInDateRange with the correct value when it\'s value changes but allDaysInDateRangeDisabled is ' +
        'set to FALSE', () => {
        const defaultFiltersWithAllDaysInDateRangeSetToFalse: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            allDaysInDateRange: false,
        };
        const defaultFiltersWithAllDaysInDateRangeSetToTrue: TasksFilterFormData = {
            ...defaultTasksFiltersFormData,
            allDaysInDateRange: true,
        };

        testHostComponent.allDaysInDateRangeDisabled = false;

        testHostComponent.defaultValues = defaultFiltersWithAllDaysInDateRangeSetToFalse;
        fixture.detectChanges();
        expect(component.form.controls.allDaysInDateRange.value).toBe(false);

        testHostComponent.defaultValues = defaultFiltersWithAllDaysInDateRangeSetToTrue;
        fixture.detectChanges();
        expect(component.form.controls.allDaysInDateRange.value).toBe(true);
    });

    it('should return TRUE when calling getUseCriteria when collapsibleSelectValue is TRUE or \'indeterminate\'', () => {
        component.collapsibleSelectValue = true;
        expect(component.getUseCriteria()).toBeTruthy();

        component.collapsibleSelectValue = 'indeterminate';
        expect(component.getUseCriteria()).toBeTruthy();
    });

    it('should return FALSE when calling getUseCriteria when collapsibleSelectValue is false', () => {
        component.collapsibleSelectValue = false;
        expect(component.getUseCriteria()).toBeFalsy();
    });

    it(`should render topics filter section when context is not ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Calendar;
        fixture.detectChanges();
        expect(getElement(dataAutomationTopicsFilterSectionSelector)).toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.TaskList;
        fixture.detectChanges();
        expect(getElement(dataAutomationTopicsFilterSectionSelector)).toBeDefined();

        testHostComponent.context = ProjectFiltersCaptureContextEnum.QuickFilters;
        fixture.detectChanges();
        expect(getElement(dataAutomationTopicsFilterSectionSelector)).toBeDefined();
    });

    it(`should not render topics filter section when context is ${ProjectFiltersCaptureContextEnum.Reschedule}`, () => {
        testHostComponent.context = ProjectFiltersCaptureContextEnum.Reschedule;
        fixture.detectChanges();
        expect(getElement(dataAutomationTopicsFilterSectionSelector)).not.toBeDefined();
    });

    it('should emit a valueChanged event when emitValueChanged is true and the form value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = true;
        component.form.controls.assigneeIds.setValue(['foo']);

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should emit a valueChanged event when emitValueChanged is true and the collapsible select value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = true;
        component.handleSelect(true);

        expect(component.valueChanged.emit).toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is false and the form value has changed', () => {
        spyOn(component.valueChanged, 'emit');

        component.emitValueChanged = false;
        component.form.controls.assigneeIds.setValue(['foo']);

        expect(component.valueChanged.emit).not.toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is true but the form value changed to an equivalent value', () => {
        component.emitValueChanged = true;
        component.form.controls.assigneeIds.setValue(['foo']);

        spyOn(component.valueChanged, 'emit');

        component.form.controls.assigneeIds.setValue(['foo']);

        expect(component.valueChanged.emit).not.toHaveBeenCalled();
    });
});
