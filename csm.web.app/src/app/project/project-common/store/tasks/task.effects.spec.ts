/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Action,
    Store
} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {
    chunk,
    cloneDeep
} from 'lodash';
import * as moment from 'moment';
import {
    BehaviorSubject,
    Observable,
    of,
    ReplaySubject,
    Subject,
    throwError
} from 'rxjs';
import {take} from 'rxjs/operators';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {getExpectedAlertAction} from '../../../../../test/helpers';
import {MOCK_DAY_CARD_RESOURCE_A} from '../../../../../test/mocks/day-cards';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {MOCK_TASK_CONSTRAINTS_RESOURCE} from '../../../../../test/mocks/task-constraints';
import {
    MOCK_SCHEDULE_ITEM_A,
    MOCK_TASK_SCHEDULE_A,
    MOCK_TASK_SCHEDULE_ENTITY_A,
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_RESOURCES,
} from '../../../../../test/mocks/task-schedules';
import {
    MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_PLURAL,
    MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_SINGULAR,
    MOCK_CREATE_OR_EDIT_TASK_PARTIALLY_FULFILLED_ALERT_PAYLOAD,
    MOCK_CREATE_TASK,
    MOCK_CREATE_TASK_FULFILLED_ALERT_PAYLOAD,
    MOCK_CREATE_TASK_WITH_ATTACHMENTS,
    MOCK_CREATE_TASK_WITHOUT_SCHEDULE,
    MOCK_EDIT_TASK_FULFILLED_ALERT_PAYLOAD,
    MOCK_SAVE_COPY_TASK_RESOURCES,
    MOCK_TASK,
    MOCK_TASK_ENTITY,
    MOCK_TASK_ENTITY_WITHOUT_SCHEDULE,
    MOCK_TASK_LIST,
    MOCK_TASK_LIST_EMPTY,
    MOCK_TASK_LIST_ONE_OF_ONE_PAGE,
    MOCK_TASK_LIST_ONE_OF_TWO_PAGE,
    MOCK_TASK_LIST_TWO_OF_TWO_PAGE,
    MOCK_TASK_RESOURCE,
    MOCK_TASK_RESOURCE_2,
    MOCK_TASK_RESOURCE_NOT_ASSIGNED,
    MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE,
    MOCK_TASK_WITH_FILE,
    MOCK_TASKS,
    MOCK_TASKS_ENTITIES,
    MOCK_TASKS_RESOURCES,
    MOCK_UPDATE_TASK,
} from '../../../../../test/mocks/tasks';
import {DateParserStrategyStub} from '../../../../../test/stubs/date-parser.strategy.stub';
import {RealtimeQueriesStub} from '../../../../../test/stubs/realtime-queries.stub';
import {RealtimeServiceStub} from '../../../../../test/stubs/realtime-service.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeHelper} from '../../../../shared/misc/helpers/calendar-scope.helper';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectTasksCreateContext} from '../../../project-children/project-tasks/containers/tasks-create/project-tasks-create.component';
import {CalendarUserSettings} from '../../api/calendar/resources/calendar-user-settings';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {SaveCopyTaskResource} from '../../api/tasks/resources/save-copy-task.resource';
import {SaveTaskResource} from '../../api/tasks/resources/save-task.resource';
import {SaveTaskScheduleResource} from '../../api/tasks/resources/save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from '../../api/tasks/resources/save-task-schedule-slot.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {ProjectTaskListResource} from '../../api/tasks/resources/task-list.resource';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {
    TaskService,
    TasksSortField,
} from '../../api/tasks/task.service';
import {TaskAttachmentService} from '../../api/tasks/task-attachment.service';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {TaskCalendarSortingModeEnum} from '../../enums/task-calendar-sorting-mode.enum';
import {TasksCalendarModeEnum} from '../../enums/tasks-calendar-mode.enum';
import {AttachmentActions} from '../attachments/attachment.actions';
import {CalendarQueries} from '../calendar/calendar/calendar.queries';
import {CALENDAR_MODULE_INITIAL_STATE} from '../calendar/calendar-module.initial-state';
import {CalendarScopeActions} from '../calendar/calendar-scope/calendar-scope.actions';
import {CALENDAR_SCOPE_SLICE_INITIAL_STATE} from '../calendar/calendar-scope/calendar-scope.initial-state';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../calendar/calendar-selection/calendar-selection.queries';
import {CalendarScopeParameters} from '../calendar/slice/calendar.scope-parameters';
import {DayCardActions} from '../day-cards/day-card.actions';
import {NewsActions} from '../news/news.actions';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {PROJECT_SLICE_INITIAL_STATE} from '../projects/project.initial-state';
import {ProjectSliceService} from '../projects/project-slice.service';
import {TASK_SCHEDULE_SLICE_INITIAL_STATE} from '../task-schedules/task-schedule.initial-state';
import {TopicActions} from '../topics/topic.actions';
import {ProjectTaskFilters} from './slice/project-task-filters';
import {SaveProjectTaskFilters} from './slice/save-project-task-filters';
import {
    CreateOrUpdateTaskFulfilledPayload,
    MoveTaskPayload,
    ProjectTaskActions,
    ResizeTaskPayload,
    UpdateTaskPayload
} from './task.actions';
import {
    ProjectTasksEffects,
    TASK_UPDATE_EVENTS_DEBOUNCE_TIME,
    UPDATE_TASK_STATUS_FULFILLED_ACTIONS,
} from './task.effects';
import {PROJECT_TASK_SLICE_INITIAL_STATE} from './task.initial-state';
import SpyObj = jasmine.SpyObj;

describe('Project Task Effects', () => {
    let projectTasksEffects: ProjectTasksEffects;
    let actions: ReplaySubject<any>;
    let taskService: SpyObj<TaskService>;
    let taskAttachmentService: any;
    let taskScheduleService: any;
    let store: any;

    const context: ReplaySubject<ObjectIdentifierPair> = new Subject() as ReplaySubject<ObjectIdentifierPair>;
    const updates: ReplaySubject<RealtimeEventUpdateDataResource> = new ReplaySubject(1);

    const calendarScopeHelper = new CalendarScopeHelper(new DateParserStrategyStub());
    const taskVersion = 1;
    const taskScheduleVersion = 2;
    const projectId = MOCK_PROJECT_1.id;
    const pageNumber = 0;
    const pageSize = 100;
    const {direction, field} = new SorterData();
    const fieldString = SorterData.getFieldString(direction, field);
    const directionString = SorterData.getDirectionString(direction);
    const scopeParameters = Object.assign(new CalendarScopeParameters(), {start: moment(), mode: TasksCalendarModeEnum.SixWeeks});
    const calendarFilters = new ProjectTaskFilters();
    calendarFilters.criteria.projectCraftIds = ['bar', 'baz'];
    const defaultCalendarFilters = new ProjectTaskFilters();
    const taskFilters = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(calendarFilters, scopeParameters);
    const defaultTaskFilters = calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(defaultCalendarFilters, scopeParameters);
    const calendarSelectionItemsIdsByTypeSubject = new BehaviorSubject<string[]>([]);
    const taskFiltersSubject = new BehaviorSubject<ProjectTaskFilters>(taskFilters);
    const defaultTaskFiltersSubject = new BehaviorSubject<ProjectTaskFilters>(defaultTaskFilters);
    const saveTaskFilters: SaveProjectTaskFilters = SaveProjectTaskFilters.fromProjectTaskFilters(taskFilters);
    const saveDefaultTaskFilters: SaveProjectTaskFilters = SaveProjectTaskFilters.fromProjectTaskFilters(defaultTaskFilters);
    const taskUpdateEventTypes: EventTypeEnum[] = [
        EventTypeEnum.Accepted,
        EventTypeEnum.Assigned,
        EventTypeEnum.Closed,
        EventTypeEnum.Sent,
        EventTypeEnum.Started,
        EventTypeEnum.Unassigned,
        EventTypeEnum.Updated,
        EventTypeEnum.Reset,
    ];
    const sortFieldMap: { [key in TaskCalendarSortingModeEnum]: TasksSortField } = {
        [TaskCalendarSortingModeEnum.Default]: 'calendarDefault',
        [TaskCalendarSortingModeEnum.CraftsSameLine]: 'calendarCraft',
        [TaskCalendarSortingModeEnum.CraftsNextLine]: 'calendarCraft',
    };
    const taskCreateContext: ProjectTasksCreateContext = 'calendar';

    const mockAbstractTaskList: AbstractItemsResource<TaskResource> = {
        items: MOCK_TASK_LIST.tasks,
        _links: MOCK_TASK_LIST._links,
    };

    const errorResponse: Observable<any> = throwError('error');
    const getAbstractItemsTasksResponse: Observable<AbstractItemsResource<TaskResource>> = of(mockAbstractTaskList);
    const getTasksResponse: Observable<ProjectTaskListResource> = of(MOCK_TASK_LIST);
    const getTasksOneOfOnePageResponse: Observable<ProjectTaskListResource> = of(MOCK_TASK_LIST_ONE_OF_ONE_PAGE);
    const getTasksOneOfTwoPageResponse: Observable<ProjectTaskListResource> = of(MOCK_TASK_LIST_ONE_OF_TWO_PAGE);
    const getTasksTwoOfTwoPageResponse: Observable<ProjectTaskListResource> = of(MOCK_TASK_LIST_TWO_OF_TWO_PAGE);
    const getTasksEmptyPageResponse: Observable<ProjectTaskListResource> = of(MOCK_TASK_LIST_EMPTY);
    const findOneTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const findOneTaskScheduleResponse: Observable<TaskScheduleResource> = of(MOCK_TASK_SCHEDULE_RESOURCE_A);
    const createTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const createAllTasksResponse: Observable<TaskResource[]> = of(MOCK_TASKS_RESOURCES);
    const createTaskScheduleResponse: Observable<TaskScheduleResource> = of(MOCK_TASK_SCHEDULE_RESOURCE_A);
    const createAllTaskSchedulesResponse: Observable<TaskScheduleResource[]> = of(MOCK_TASK_SCHEDULE_RESOURCES);
    const deleteTaskResponse: Observable<void> = of(null);
    const deleteAllTaskResponse: Observable<void> = of(null);
    const updateTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const updateAllTasksResponse: Observable<TaskResource[]> = of(MOCK_TASKS_RESOURCES);
    const startTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const sendTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const acceptTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const closeTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const resetTaskResponse: Observable<TaskResource> = of(MOCK_TASK_RESOURCE);
    const updateTaskScheduleResponse: Observable<TaskScheduleResource> = of(MOCK_TASK_SCHEDULE_RESOURCE_A);
    const updateAllTaskSchedulesResponse: Observable<TaskScheduleResource[]> = of(MOCK_TASK_SCHEDULE_RESOURCES);
    const updateTaskWithFileResponse: Observable<TaskResource> = of(MOCK_TASK_WITH_FILE);
    const assignTasksFulfilledPayload: any = {tasks: [MOCK_TASK_RESOURCE]};
    const assignTasksFulfilledPayloadWithTwoTasks: any = {tasks: [MOCK_TASK_RESOURCE, MOCK_TASK_RESOURCE]};
    const testDataFilters: ProjectTaskFilters = new ProjectTaskFilters();
    const testDataSorter = new SorterData<TasksSortField>();
    const observeCalendarUserSettings = new Subject<CalendarUserSettings>();
    const taskIdsArray = ['1', '2', '3'];
    const tasksPayload = {
        taskIds: taskIdsArray,
        companyId: '123',
        participantId: '456',
    };
    const arrayToForceTwoChunks: string[] = Array.from({length: 101}, (_, index) => (index + 1).toString());
    const arrayToForceTwoChunksTasksStatus: string[] = Array.from({length: 501}, (_, index) => (index + 1).toString());

    const calendarQueriesMock: CalendarQueries = mock(CalendarQueries);
    const calendarScopeQueriesMock: CalendarScopeQueries = mock(CalendarScopeQueries);
    const calendarSelectionQueriesMock: CalendarSelectionQueries = mock(CalendarSelectionQueries);
    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const updateTaskPayload: UpdateTaskPayload = {
        taskId: 'foo',
        taskVersion,
        taskScheduleVersion,
        payload: MOCK_CREATE_TASK,
    };

    const storeInitialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            projectSlice: {
                ...PROJECT_SLICE_INITIAL_STATE,
                currentItem: {
                    ...PROJECT_SLICE_INITIAL_STATE.currentItem,
                    id: projectId,
                },
            },
            projectTaskSlice: {
                ...PROJECT_TASK_SLICE_INITIAL_STATE,
                currentItem: {
                    ...PROJECT_TASK_SLICE_INITIAL_STATE.currentItem,
                    id: MOCK_TASK_RESOURCE.id,
                },
                list: {
                    filters: new ProjectTaskFilters(),
                    isFilterPanelOpen: true,
                    pages: [],
                    pagination: new PaginatorData(),
                    sort: new SorterData(),
                    requestStatus: RequestStatusEnum.empty,
                },
                calendar: {
                    filters: calendarFilters,
                    isFilterPanelOpen: true,
                    pages: [],
                    pagination: new PaginatorData(),
                    sort: new SorterData(),
                    requestStatus: RequestStatusEnum.empty,
                },
                assignList: new AbstractSelectionList(),
                sendList: new AbstractSelectionList(),
                items: cloneDeep(MOCK_TASKS_ENTITIES),
            },
            calendarModule: {
                ...CALENDAR_MODULE_INITIAL_STATE,
                calendarScopeSlice: {
                    ...CALENDAR_SCOPE_SLICE_INITIAL_STATE,
                    scopeParameters,
                },
            },
            taskScheduleSlice: {
                ...TASK_SCHEDULE_SLICE_INITIAL_STATE,
                items:
                    cloneDeep(MOCK_TASKS_RESOURCES.map(taskResource => TaskScheduleEntity.fromResource(taskResource._embedded.schedule))),
            },
        },
    };

    const mockStore = new MockStore(storeInitialState);

    const updateTaskWithAttachmentsPayload: UpdateTaskPayload = {
        taskId: 'foo',
        taskVersion,
        taskScheduleVersion,
        payload: MOCK_CREATE_TASK_WITH_ATTACHMENTS,
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectTasksEffects,
            provideMockActions(() => actions),
            {
                provide: CalendarQueries,
                useValue: instance(calendarQueriesMock),
            },
            {
                provide: CalendarScopeQueries,
                useValue: instance(calendarScopeQueriesMock),
            },
            {
                provide: CalendarSelectionQueries,
                useValue: instance(calendarSelectionQueriesMock),
            },
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            {
                provide: TaskService,
                useValue: jasmine.createSpyObj('TaskService', [
                    'copyAll',
                    'create',
                    'createAll',
                    'delete',
                    'deleteAll',
                    'findOne',
                    'findAll',
                    'findAllByIds',
                    'assign',
                    'sendAll',
                    'update',
                    'updateAll',
                    'start',
                    'send',
                    'close',
                    'accept',
                    'reset',
                    'resetAll',
                    'closeAll',
                    'startAll',
                    'acceptAll',
                ]),
            },
            {
                provide: TaskAttachmentService,
                useValue: jasmine.createSpyObj('TaskAttachmentService', [
                    'upload',
                    'findAll',
                    'findPreview',
                ]),
            },
            {
                provide: TaskScheduleService,
                useValue: jasmine.createSpyObj('TaskScheduleService', [
                    'create',
                    'createAll',
                    'deleteById',
                    'findOneByTaskId',
                    'update',
                    'updateAll',
                ]),
            },
            {
                provide: RealtimeQueries,
                useValue: new RealtimeQueriesStub(context),
            },
            {
                provide: RealtimeService,
                useValue: new RealtimeServiceStub(updates),
            },
            {
                provide: Store,
                useValue: mockStore,
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
        ],
    };

    when(calendarScopeQueriesMock.observeCalendarTaskFiltersWithTruncatedDates()).thenReturn(taskFiltersSubject);
    when(calendarSelectionQueriesMock.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task))
        .thenReturn(calendarSelectionItemsIdsByTypeSubject);
    when(calendarQueriesMock.observeCalendarUserSettings()).thenReturn(observeCalendarUserSettings);
    when(calendarScopeQueriesMock.observeDefaultCalendarTaskFiltersWithTruncatedDates()).thenReturn(defaultTaskFiltersSubject);
    when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        projectTasksEffects = TestBed.inject(ProjectTasksEffects);
        taskService = TestBed.inject(TaskService) as SpyObj<TaskService>;
        taskAttachmentService = TestBed.inject(TaskAttachmentService);
        taskScheduleService = TestBed.inject(TaskScheduleService);
        store = TestBed.inject(Store);
        actions = new ReplaySubject(1);

        mockStore.nextMock(cloneDeep(storeInitialState));
        taskService.copyAll.calls.reset();
        taskService.createAll.calls.reset();
        taskService.update.calls.reset();
        taskService.updateAll.calls.reset();
        taskScheduleService.createAll.calls.reset();
        taskScheduleService.update.calls.reset();
        taskScheduleService.updateAll.calls.reset();
        taskService.findAll.calls.reset();
        taskService.assign.calls.reset();
        taskService.sendAll.calls.reset();
        taskService.startAll.calls.reset();
        taskService.closeAll.calls.reset();
        taskService.resetAll.calls.reset();
        taskService.acceptAll.calls.reset();
    });

    afterEach(() => {
        taskFiltersSubject.next(taskFilters);
        defaultTaskFiltersSubject.next(defaultTaskFilters);
    });

    it('should trigger a ProjectTaskActions.Request.One and TopicActions.Request.All and NewsActions.Request.AllNews action ' +
        'after the current task changes', () => {
        const taskId: string = MOCK_TASK_RESOURCE.id;
        const resultFromEffect: Action[] = [];
        const expectedResult: Action[] = [
            new ProjectTaskActions.Request.One(taskId),
            new TopicActions.Request.All(),
            new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)]),
        ];

        actions.next(new ProjectTaskActions.Set.Current(taskId));
        projectTasksEffects.triggerRequestActions$.subscribe(result => {
            resultFromEffect.push(result);
        });
        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a ProjectTaskActions.Request.OneFulfilled and AttachmentActions.Request.AllByTaskFulfilled action ' +
        'after requesting current task successfully', () => {
        const resultFromEffect: Action[] = [];
        const expectedResult: Action[] = [
            new ProjectTaskActions.Request.OneFulfilled(MOCK_TASK_RESOURCE),
            new AttachmentActions.Request.AllByTaskFulfilled({
                attachmentList: MOCK_TASK_RESOURCE._embedded.attachments,
                objectIdentifier: new ObjectListIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id),
            }),
        ];

        taskService.findOne.and.returnValue(findOneTaskResponse);
        actions.next(new ProjectTaskActions.Request.One(null));
        projectTasksEffects.requestById$.subscribe(result => {
            resultFromEffect.push(result);
        });
        expect(resultFromEffect).toEqual(expectedResult);
    });

    it('should trigger a ProjectTaskActions.Request.OneRejected action after requesting current task has failed', () => {
        const expectedResult = new ProjectTaskActions.Request.OneRejected();

        taskService.findOne.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Request.One(null));
        projectTasksEffects.requestById$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled action after requesting ' +
        'current task schedule successfully', () => {
        const expectedResult = new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(MOCK_TASK_SCHEDULE_RESOURCE_A);

        taskScheduleService.findOneByTaskId.and.returnValue(findOneTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Request.OneTaskScheduleByTaskId(null));
        projectTasksEffects.requestTaskScheduleByTaskId$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.OneTaskScheduleByTaskIdRejected action after requesting ' +
        'current task schedule has failed', () => {
        const expectedResult = new ProjectTaskActions.Request.OneTaskScheduleByTaskIdRejected();

        taskScheduleService.findOneByTaskId.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Request.OneTaskScheduleByTaskId(null));
        projectTasksEffects.requestTaskScheduleByTaskId$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.All action after the pagination page changes', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.All();

        actions.next(new ProjectTaskActions.Set.Page(1));
        projectTasksEffects.triggerRequestTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.All action after the filters change', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.All();

        actions.next(new ProjectTaskActions.Set.Filters(testDataFilters));
        projectTasksEffects.triggerRequestTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.All action when task is created with context of list', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.All();
        const createTaskContext: ProjectTasksCreateContext = 'list';

        actions.next(new ProjectTaskActions.Create.OneFulfilled(createTaskContext));
        projectTasksEffects.triggerRequestTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should not trigger a ProjectTaskActions.Request.All action when task is created without context of list', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.All();
        const createTaskContext: ProjectTasksCreateContext = 'calendar';

        actions.next(new ProjectTaskActions.Create.OneFulfilled(createTaskContext));
        projectTasksEffects.triggerRequestTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).not.toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllFulfilled action after requesting tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Request.AllFulfilled(MOCK_TASK_LIST);

        taskService.findAll.and.returnValue(getTasksResponse);
        actions.next(new ProjectTaskActions.Request.All());
        projectTasksEffects.requestTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.AllRejected action after requesting tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Request.AllRejected();

        taskService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Request.All());
        projectTasksEffects.requestTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the copy all fullfilled', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new ProjectTaskActions.Copy.AllFulfilled(MOCK_TASKS_RESOURCES));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the calendar sort change', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new ProjectTaskActions.Set.CalendarSort(testDataSorter));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the calendar filters change', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new ProjectTaskActions.Set.CalendarFilters(testDataFilters));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the calendar scope parameters change', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new CalendarScopeActions.Set.ScopeParameters(new CalendarScopeParameters()));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the calendar start parameter changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new CalendarScopeActions.Set.Start(moment()));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after the calendar mode changed', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();

        actions.next(new CalendarScopeActions.Set.Mode(TasksCalendarModeEnum.EighteenWeeks));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(1);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action task is created with context calendar', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const taskCreateContextCalendar: ProjectTasksCreateContext = 'calendar';

        actions.next(new ProjectTaskActions.Create.OneFulfilled(taskCreateContextCalendar));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should not trigger a ProjectTaskActions.Request.AllCalendar action task is created without context calendar', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const taskCreateContextCalendar: ProjectTasksCreateContext = 'list';

        actions.next(new ProjectTaskActions.Create.OneFulfilled(taskCreateContextCalendar));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).not.toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after multiple tasks are created', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));

        actions.next(new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectTaskActions.Request.AllCalendar action after multiple tasks are moved', fakeAsync(() => {
        let resultFromEffect = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));

        actions.next(new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled));
        projectTasksEffects.triggerRequestCalendarTasksActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should request calendar tasks with default filters when highlight filter results is enabled', () => {
        const newTaskFilters: ProjectTaskFilters = Object.assign({}, cloneDeep(taskFilters), {highlight: true});

        taskFiltersSubject.next(newTaskFilters);

        taskService.findAll.and.returnValue(getTasksOneOfOnePageResponse);
        actions.next(new ProjectTaskActions.Request.AllCalendar());
        projectTasksEffects.requestCalendarTasks$.subscribe(() => {
            expect(taskService.findAll).toHaveBeenCalledWith(projectId, fieldString, directionString, pageNumber, pageSize,
                saveDefaultTaskFilters);
            expect(taskService.findAll).toHaveBeenCalledTimes(1);
        });
    });

    it('should trigger ProjectTaskActions.Request.AllCalendarFulfilled action after requesting calendar tasks ' +
        'successfully and there\'s only one page of tasks', () => {
        const expectedResult = new ProjectTaskActions.Request.AllCalendarFulfilled(MOCK_TASK_LIST_ONE_OF_ONE_PAGE);

        taskService.findAll.and.returnValue(getTasksOneOfOnePageResponse);
        actions.next(new ProjectTaskActions.Request.AllCalendar());
        projectTasksEffects.requestCalendarTasks$.subscribe(result => {
            expect(taskService.findAll).toHaveBeenCalledWith(projectId, fieldString, directionString, pageNumber, pageSize,
                saveTaskFilters);
            expect(taskService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger ProjectTaskActions.Request.AllCalendarFulfilled action after requesting calendar tasks ' +
        'successfully and there\'s two pages of tasks', () => {
        const expectedPayload = Object.assign({}, MOCK_TASK_LIST_ONE_OF_TWO_PAGE,
            {tasks: [...MOCK_TASK_LIST_ONE_OF_TWO_PAGE.tasks, ...MOCK_TASK_LIST_TWO_OF_TWO_PAGE.tasks]});
        const expectedResult = new ProjectTaskActions.Request.AllCalendarFulfilled(expectedPayload);

        taskService.findAll.and.returnValues(getTasksOneOfTwoPageResponse, getTasksTwoOfTwoPageResponse);
        actions.next(new ProjectTaskActions.Request.AllCalendar());
        projectTasksEffects.requestCalendarTasks$.subscribe(result => {
            expect(taskService.findAll).toHaveBeenCalledTimes(2);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger ProjectTaskActions.Request.AllCalendarFulfilled action after requesting calendar tasks ' +
        'successfully and no tasks are returned', () => {
        const expectedResult = new ProjectTaskActions.Request.AllCalendarFulfilled(MOCK_TASK_LIST_EMPTY);

        taskService.findAll.and.returnValue(getTasksEmptyPageResponse);
        actions.next(new ProjectTaskActions.Request.AllCalendar());
        projectTasksEffects.requestCalendarTasks$.subscribe(result => {
            expect(taskService.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Request.AllCalendarRejected action after requesting calendar tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Request.AllCalendarRejected();

        taskService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Request.AllCalendar());
        projectTasksEffects.requestCalendarTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Assign.AllFulfilled action after assigning tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Assign.AllFulfilled(MOCK_TASK_LIST);

        taskService.assign.and.returnValue(getTasksResponse);
        actions.next(new ProjectTaskActions.Assign.All(tasksPayload));
        projectTasksEffects.assignTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger assign once when there is up to 100 tasks ids', () => {
        taskService.assign.and.returnValue(getTasksResponse);
        actions.next(new ProjectTaskActions.Assign.All(tasksPayload));
        projectTasksEffects.assignTasks$.subscribe(() => {
            expect(taskService.assign).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger assign twice when there are more than one hundred task IDs and fewer than two hundred.', () => {
        const tasksPayloadForcedChunk = {...tasksPayload, taskIds: arrayToForceTwoChunks};
        taskService.assign.and.returnValue(getTasksResponse);
        actions.next(new ProjectTaskActions.Assign.All(tasksPayloadForcedChunk));
        projectTasksEffects.assignTasks$.subscribe(() => {
            expect(taskService.assign).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Assign.AllRejected action after assigning tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Assign.AllRejected();

        taskService.assign.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Assign.All(tasksPayload));
        projectTasksEffects.assignTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Send.AllFulfilled action after sending tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Send.AllFulfilled(MOCK_TASK_LIST.tasks);

        taskService.sendAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Send.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('Should trigger sendAll once when there are up to five hundred taskIds', () => {
        taskService.sendAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Send.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.sendAll).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger sendAll twice when there are more than five hundred task IDs and fewer than one thousand', () => {
        taskService.sendAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Send.All(arrayToForceTwoChunksTasksStatus));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.sendAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Send.AllRejected action after sending tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Send.AllRejected();

        taskService.sendAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Send.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Start.OneFulfilled action after starting a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Start.OneFulfilled(MOCK_TASK_RESOURCE);

        taskService.start.and.returnValue(startTaskResponse);
        actions.next(new ProjectTaskActions.Start.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Start.OneRejected action after starting a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Start.OneRejected();

        taskService.start.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Start.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Send.OneFulfilled action after sending a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Send.OneFulfilled(MOCK_TASK_RESOURCE);

        taskService.send.and.returnValue(sendTaskResponse);
        actions.next(new ProjectTaskActions.Send.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Send.OneRejected action after sending a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Send.OneRejected();

        taskService.send.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Send.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Accept.OneFulfilled action after accepting a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Accept.OneFulfilled(MOCK_TASK_RESOURCE);

        taskService.accept.and.returnValue(acceptTaskResponse);
        actions.next(new ProjectTaskActions.Accept.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Close.OneFulfilled action after closing a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Close.OneFulfilled(MOCK_TASK_RESOURCE);

        taskService.close.and.returnValue(closeTaskResponse);
        actions.next(new ProjectTaskActions.Close.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Reset.OneFulfilled action after resetting a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Reset.OneFulfilled(MOCK_TASK_RESOURCE);

        taskService.reset.and.returnValue(resetTaskResponse);
        actions.next(new ProjectTaskActions.Reset.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Close.OneRejected action after closing a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Close.OneRejected();

        taskService.close.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Close.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Accept.OneRejected action after accepting a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Accept.OneRejected();

        taskService.accept.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Accept.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Reset.OneRejected action after resetting a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Reset.OneRejected();

        taskService.reset.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Reset.One(MOCK_TASK_RESOURCE.id));
        projectTasksEffects.updateStatusTask$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right payload after ' +
        'a ProjectTaskActions.Assign.AllFulfilled', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_SINGULAR);

        actions.next(new ProjectTaskActions.Assign.AllFulfilled(assignTasksFulfilledPayload));
        projectTasksEffects.assignTasksSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right payload after ' +
        'a ProjectTaskActions.Assign.AllFulfilled with more than 1 task', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_ASSIGN_TASKS_FULFILLED_ALERT_PAYLOAD_PLURAL);

        actions.next(new ProjectTaskActions.Assign.AllFulfilled(assignTasksFulfilledPayloadWithTwoTasks));
        projectTasksEffects.assignTasksSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right payload after a ProjectTaskActions.Send.AllFulfilled', () => {
        const expectedResult = getExpectedAlertAction(
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')})
        );

        actions.next(new ProjectTaskActions.Send.AllFulfilled(MOCK_TASK_LIST.tasks));
        projectTasksEffects.updateStatusAllTasksSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action with the right type after a ProjectTaskActions.Create.OneFulfilled', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_CREATE_TASK_FULFILLED_ALERT_PAYLOAD);

        actions.next(new ProjectTaskActions.Create.OneFulfilled(taskCreateContext));
        projectTasksEffects.createSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.WarningAlert action with the right type after ' +
        'a ProjectTaskActions.Create.OnePartiallyFulfilled', () => {
        const expectedResult = new AlertActions.Add.WarningAlert(MOCK_CREATE_OR_EDIT_TASK_PARTIALLY_FULFILLED_ALERT_PAYLOAD);

        actions.next(new ProjectTaskActions.Create.OnePartiallyFulfilled());
        projectTasksEffects.createSuccess$.subscribe((result: AlertActions.Add.WarningAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert and a ProjectTaskActions.Request.One ' +
        'action with the right type and message after a ProjectTaskActions.Update.OneFulfilled', () => {
        const results = [];
        const expectedFirstResult = new AlertActions.Add.SuccessAlert(MOCK_EDIT_TASK_FULFILLED_ALERT_PAYLOAD);
        const expectedSecondResult = new ProjectTaskActions.Request.One(null);

        actions.next(new ProjectTaskActions.Update.OneFulfilled(null));
        projectTasksEffects.updateSuccess$.subscribe(result => {
            results.push(result);
        });

        expect(results[0].payload.message).toEqual(expectedFirstResult.payload.message);
        expect(results[0].payload.type).toEqual(expectedFirstResult.payload.type);
        expect(results[1]).toEqual(expectedSecondResult);
    });

    it('should trigger a AlertActions.Add.WarningAlert and a ProjectTaskActions.Request.One ' +
        'action with the right type and message after a ProjectTaskActions.Update.OnePartiallyFulfilled', () => {
        const results = [];
        const expectedFirstResult = new AlertActions.Add.WarningAlert(MOCK_CREATE_OR_EDIT_TASK_PARTIALLY_FULFILLED_ALERT_PAYLOAD);
        const expectedSecondResult = new ProjectTaskActions.Request.One(null);

        actions.next(new ProjectTaskActions.Update.OnePartiallyFulfilled(null));
        projectTasksEffects.updateSuccess$.subscribe(result => {
            results.push(result);
        });

        expect(results[0].payload.message).toEqual(expectedFirstResult.payload.message);
        expect(results[0].payload.type).toEqual(expectedFirstResult.payload.type);
        expect(results[1]).toEqual(expectedSecondResult);
    });

    it('should trigger a ProjectTaskActions.Create.OneRejected action after creating a task failed', () => {
        const expectedResult = new ProjectTaskActions.Create.OneRejected();

        taskService.create.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Create.One(MOCK_CREATE_TASK, taskCreateContext));
        projectTasksEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Create.OneFulfilled action after create a task successfully', () => {
        const expectedResult = new ProjectTaskActions.Create.OneFulfilled(taskCreateContext);

        taskService.create.and.returnValue(createTaskResponse);
        taskScheduleService.create.and.returnValue(createTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Create.One(MOCK_CREATE_TASK, taskCreateContext));
        projectTasksEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Create.OneFulfilled action after create a task successfully without dates', () => {
        const expectedResult = new ProjectTaskActions.Create.OneFulfilled(taskCreateContext);

        taskService.create.and.returnValue(createTaskResponse);
        actions.next(new ProjectTaskActions.Create.One(MOCK_CREATE_TASK_WITHOUT_SCHEDULE, taskCreateContext));
        projectTasksEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Create.OneFulfilled action after create a task successfully with attachments', () => {
        const expectedResult = new ProjectTaskActions.Create.OneFulfilled(taskCreateContext);

        taskService.create.and.returnValue(createTaskResponse);
        taskAttachmentService.upload.and.returnValue(updateTaskWithFileResponse);
        actions.next(new ProjectTaskActions.Create.One(MOCK_CREATE_TASK_WITH_ATTACHMENTS, taskCreateContext));
        projectTasksEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Create.OnePartiallyFulfilled action after create a task successfully ' +
        'but the schedule creation fails', () => {
        const expectedResult = new ProjectTaskActions.Create.OnePartiallyFulfilled();

        taskService.create.and.returnValue(createTaskResponse);
        taskScheduleService.create.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Create.One(MOCK_CREATE_TASK, taskCreateContext));
        projectTasksEffects.create$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OneRejected action after updating a task has failed', () => {
        const expectedResult = new ProjectTaskActions.Update.OneRejected();

        taskService.update.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Update.One(updateTaskPayload));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OneFulfilled action after updating a task successfully', () => {
        const taskId = 'foo';
        const expectedResult = new ProjectTaskActions.Update.OneFulfilled(taskId);

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One(updateTaskPayload));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OneFulfilled action after updating a task successfully without dates', () => {
        const taskId = 'foo';
        const expectedResult = new ProjectTaskActions.Update.OneFulfilled(taskId);

        taskService.update.and.returnValue(updateTaskResponse);
        actions.next(new ProjectTaskActions.Update.One(updateTaskPayload));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OneFulfilled action after updating a task successfully with attachments', () => {
        const taskId = 'foo';
        const expectedResult = new ProjectTaskActions.Update.OneFulfilled(taskId);

        taskService.update.and.returnValue(updateTaskResponse);
        taskAttachmentService.upload.and.returnValue(updateTaskWithFileResponse);
        actions.next(new ProjectTaskActions.Update.One(updateTaskWithAttachmentsPayload));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OnePartiallyFulfilled action after updating a task successfully ' +
        'but the schedule updating fails', () => {
        const taskId = 'foo';
        const expectedResult = new ProjectTaskActions.Update.OnePartiallyFulfilled(taskId);

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Update.One(updateTaskPayload));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should shift day cards the right amount when DST starts', () => {
        const taskId = 'foo';
        const finalStart = '2019-04-01';
        const finalEnd = '2019-04-14';
        const currentStart = new Date('2019-03-18');
        const currentEnd = new Date('2019-03-31');
        const updateTaskShift = {...MOCK_UPDATE_TASK, start: finalStart, end: finalEnd};
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(finalStart, finalEnd, [
            new SaveTaskScheduleSlotResource(MOCK_DAY_CARD_RESOURCE_A.id, moment(finalStart)),
        ]);
        store._value.projectModule.taskScheduleSlice.items = [{
            ...MOCK_TASK_SCHEDULE_ENTITY_A,
            slots: [
                {
                    dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.title),
                    date: currentStart,
                },
            ],
            start: currentStart,
            end: currentEnd,
        }];

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One({
            taskId,
            taskVersion,
            taskScheduleVersion: MOCK_TASK_SCHEDULE_RESOURCE_A.version,
            payload: updateTaskShift,
        }));
        projectTasksEffects.update$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_RESOURCE_A.version]);
        });
    });

    it('should shift day cards the right amount when DST ends', () => {
        const taskId = 'foo';
        const finalStart = '2019-10-21';
        const finalEnd = '2019-10-27';
        const currentStart = new Date('2019-10-28');
        const currentEnd = new Date('2019-11-03');
        const updateTaskShift = {...MOCK_UPDATE_TASK, start: finalStart, end: finalEnd};
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(finalStart, finalEnd, [
            new SaveTaskScheduleSlotResource(MOCK_DAY_CARD_RESOURCE_A.id, moment(finalStart)),
        ]);
        store._value.projectModule.taskScheduleSlice.items = [{
            ...MOCK_TASK_SCHEDULE_ENTITY_A,
            slots: [
                {
                    dayCard: new ResourceReference(MOCK_DAY_CARD_RESOURCE_A.id, MOCK_DAY_CARD_RESOURCE_A.title),
                    date: currentStart,
                },
            ],
            start: currentStart,
            end: currentEnd,
        }];

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One({
            taskId,
            taskVersion,
            taskScheduleVersion: MOCK_TASK_SCHEDULE_ENTITY_A.version,
            payload: updateTaskShift,
        }));
        projectTasksEffects.update$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_ENTITY_A.version]);
        });
    });

    it('should shift day cards when updating the task schedule and it\'s duration doesn\'t change', () => {
        const taskId = 'foo';
        const finalStart = '2018-01-05';
        const finalEnd = '2018-02-05';
        const currentStart = new Date('2018-01-01');
        const currentEnd = new Date('2018-02-01');
        const updateTaskShift = {...MOCK_UPDATE_TASK, start: finalStart, end: finalEnd};
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(finalStart, finalEnd, [
            new SaveTaskScheduleSlotResource(MOCK_SCHEDULE_ITEM_A.dayCard.id, moment('2018-01-24')),
        ]);
        store._value.projectModule.taskScheduleSlice.items = [{
            ...MOCK_TASK_SCHEDULE_ENTITY_A,
            start: currentStart,
            end: currentEnd,
        }];

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One({
            taskId,
            taskVersion,
            taskScheduleVersion: MOCK_TASK_SCHEDULE_ENTITY_A.version,
            payload: updateTaskShift,
        }));
        projectTasksEffects.update$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_ENTITY_A.version]);
        });
    });

    it('should not shift day cards when updating the task schedule and it\'s duration changes', () => {
        const taskId = 'foo';
        const finalStart = '2018-01-02';
        const finalEnd = '2018-02-05';
        const currentStart = new Date('2018-01-01');
        const currentEnd = new Date('2018-02-01');
        const updateTaskExtend = {...MOCK_UPDATE_TASK, start: finalStart, end: finalEnd};
        const expectedResult: SaveTaskScheduleResource = new SaveTaskScheduleResource(finalStart, finalEnd, [
            new SaveTaskScheduleSlotResource(MOCK_SCHEDULE_ITEM_A.dayCard.id, moment('2018-01-20')),
        ]);
        store._value.projectModule.taskScheduleSlice.items = [{
            ...MOCK_TASK_SCHEDULE_ENTITY_A,
            start: currentStart,
            end: currentEnd,
        }];

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One({
            taskId,
            taskVersion,
            taskScheduleVersion: MOCK_TASK_SCHEDULE_ENTITY_A.version,
            payload: updateTaskExtend,
        }));
        projectTasksEffects.update$.subscribe(() => {
            expect(taskScheduleService.update.calls.mostRecent().args)
                .toEqual([taskId, expectedResult, MOCK_TASK_SCHEDULE_ENTITY_A.version]);
        });
    });

    it('should trigger a ProjectTaskActions.Update.OneFulfilled action after updating a task successfully', () => {
        const taskId = MOCK_TASK_RESOURCE_WITHOUT_SCHEDULE.id;
        const expectedResult = new ProjectTaskActions.Update.OneFulfilled(taskId);
        store._value.projectModule.projectTaskSlice.items = [MOCK_TASK_ENTITY_WITHOUT_SCHEDULE];
        store._value.projectModule.projectTaskSlice.currentItem.id = MOCK_TASK_ENTITY_WITHOUT_SCHEDULE.id;

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.create.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Update.One({
            taskId,
            taskVersion,
            taskScheduleVersion,
            payload: MOCK_CREATE_TASK,
        }));
        projectTasksEffects.update$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a NewsActions.Request.AllNews action after requesting tasks page successfully', () => {
        const identifiers = MOCK_TASK_LIST.tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const expectedResult = new NewsActions.Request.AllNews(identifiers);

        actions.next(new ProjectTaskActions.Request.AllFulfilled(MOCK_TASK_LIST));
        projectTasksEffects.requestTasksNews$.subscribe(result => {
            expect(result.type).toEqual(expectedResult.type);
        });
    });

    it('should trigger a NewsActions.Request.AllNews action after requesting calendar tasks successfully', (done) => {
        const identifiers = MOCK_TASK_LIST.tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const expectedResult = new NewsActions.Request.AllNews(identifiers);

        actions.next(new ProjectTaskActions.Request.AllCalendarFulfilled(MOCK_TASK_LIST));

        projectTasksEffects.requestTasksNews$.subscribe(result => {
            expect(result.type).toEqual(expectedResult.type);
            done();
        });
    });

    it('should not trigger a NewsActions.Request.AllNews action after requesting tasks page successfully that has no items', () => {
        let hasBeenTriggered = false;

        actions.next(new ProjectTaskActions.Request.AllFulfilled(MOCK_TASK_LIST_EMPTY));
        projectTasksEffects.requestTasksNews$.subscribe(() => {
            hasBeenTriggered = true;
        });

        expect(hasBeenTriggered).toBeFalsy();
    });

    it('should trigger a ProjectTaskActions.Delete.OneRejected action after deleting a task failed', () => {
        const taskId = MOCK_TASK_RESOURCE.id;
        const expectedResult = new ProjectTaskActions.Delete.OneRejected();

        store._value.projectModule.projectTaskSlice.items = [MOCK_TASK_ENTITY];

        taskService.delete.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Delete.One(taskId));
        projectTasksEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Delete.OneFulfilled action after deleting a task successfully', () => {
        const taskId = MOCK_TASK_RESOURCE.id;
        const expectedResult = new ProjectTaskActions.Delete.OneFulfilled(taskId);

        store._value.projectModule.projectTaskSlice.items = [MOCK_TASK_ENTITY];

        taskService.delete.and.returnValue(deleteTaskResponse);
        actions.next(new ProjectTaskActions.Delete.One(taskId));
        projectTasksEffects.delete$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Delete.AllRejected action after deleting all tasks failed', () => {
        const taskIds = [MOCK_TASK_RESOURCE.id];
        const expectedResult = new ProjectTaskActions.Delete.AllRejected();

        store._value.projectModule.projectTaskSlice.items = [MOCK_TASK_RESOURCE];

        taskService.deleteAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Delete.All(taskIds));
        projectTasksEffects.deleteAll$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should trigger a CalendarSelectionActions.Initialize.All and a ProjectTaskActions.Delete.AllFulfilled action' +
        ' after deleting all tasks successfully', () => {
        const results: Action[] = [];
        const taskIds = [MOCK_TASK_RESOURCE.id];
        const expectedResult = [
            new CalendarSelectionActions.Initialize.All(),
            new ProjectTaskActions.Delete.AllFulfilled(taskIds),
        ];

        store._value.projectModule.projectTaskSlice.items = [MOCK_TASK_RESOURCE];

        taskService.deleteAll.and.returnValue(deleteAllTaskResponse);
        actions.next(new ProjectTaskActions.Delete.All(taskIds));
        projectTasksEffects.deleteAll$.subscribe(result => results.push(result));

        expect(results[0]).toEqual(expectedResult[0]);
        expect(results[1]).toEqual(expectedResult[1]);
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectTaskActions.Delete.OneFulfilled action is triggered', () => {
        const taskId = MOCK_TASK_RESOURCE.id;
        const key = 'Task_Delete_SuccessMessage';
        const expectedResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new ProjectTaskActions.Delete.OneFulfilled(taskId));
        projectTasksEffects.deleteSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payload.type).toBe(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert after a ProjectTaskActions.Delete.AllFulfilled action is triggered', () => {
        const taskIds = [MOCK_TASK_RESOURCE.id];
        const key = 'Tasks_Delete_SuccessMessage';
        const expectedResult: AlertActions.Add.SuccessAlert = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});

        actions.next(new ProjectTaskActions.Delete.AllFulfilled(taskIds));
        projectTasksEffects.deleteAllSuccess$.subscribe((result: AlertActions.Add.SuccessAlert) => {
            expect(result.type).toEqual(expectedResult.type);
            expect(result.payload.type).toEqual(expectedResult.payload.type);
            expect(result.payload.message).toEqual(expectedResult.payload.message);
        });
    });

    taskUpdateEventTypes.forEach(eventType => {
        it(`should trigger a ProjectTaskActions.Request.AllByIds when an ${eventType} event from an task is received`, fakeAsync(() => {
            let currentResult: Action = null;
            const expectedResult = new ProjectTaskActions.Request.AllByIds([MOCK_TASK_RESOURCE.id]);
            const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
            const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version + 1);
            const event = new RealtimeEventUpdateDataResource(eventType, root, object);

            projectTasksEffects.taskUpdateEvents$.subscribe(result => {
                currentResult = result;
            });

            context.next(root);
            updates.next(event);

            tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

            expect(currentResult).toEqual(expectedResult);
        }));

        it(`should trigger a ProjectTaskActions.Request.AllByIds only once when an ${eventType} event from ` +
            `tasks with the same id are received`, fakeAsync(() => {
            let currentResult: Action = null;
            const expectedResult = new ProjectTaskActions.Request.AllByIds([MOCK_TASK_RESOURCE.id]);
            const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
            const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version + 1);
            const event = new RealtimeEventUpdateDataResource(eventType, root, object);

            projectTasksEffects.taskUpdateEvents$.subscribe(result => {
                currentResult = result;
            });

            context.next(root);
            updates.next(event);
            updates.next(event);

            tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

            expect(currentResult).toEqual(expectedResult);
        }));

        it(`should not trigger a ProjectTaskActions.Request.AllByIds before buffer when an ${eventType} event from` +
            `a task is received`, () => {
            let currentResult: Action = null;
            const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
            const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version + 1);
            const event = new RealtimeEventUpdateDataResource(eventType, root, object);

            projectTasksEffects.taskUpdateEvents$.subscribe(result => {
                currentResult = result;
            });

            context.next(root);
            updates.next(event);

            expect(currentResult).toBeNull();
        });

        it(`should trigger a ProjectTaskActions.Request.AllByIds when an ${eventType} event from multiple tasks are received`,
            fakeAsync(() => {
                let currentResult: Action = null;
                const taskId1 = MOCK_TASK_RESOURCE.id;
                const taskId2 = MOCK_TASK_RESOURCE_NOT_ASSIGNED.id;
                const expectedResult = new ProjectTaskActions.Request.AllByIds([taskId1, taskId2]);
                const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
                const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, taskId1, MOCK_TASK_RESOURCE.version + 1);
                const object2 = new ObjectIdentifierPairWithVersion(
                    ObjectTypeEnum.Task, taskId2, MOCK_TASK_RESOURCE_NOT_ASSIGNED.version + 1
                );
                const event = new RealtimeEventUpdateDataResource(eventType, root, object);
                const event2 = new RealtimeEventUpdateDataResource(eventType, root, object2);

                projectTasksEffects.taskUpdateEvents$.subscribe(result => {
                    currentResult = result;
                });

                context.next(root);
                updates.next(event);
                updates.next(event2);
                tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

                expect(currentResult).toEqual(expectedResult);
            }));

        it(`should not buffer the task update events and trigger a ProjectTaskActions.Request.AllByIds when they match the ` +
            `required criteria but they are received with a time gap of ${TASK_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
            const currentResult: Action[] = [];
            const taskId1 = MOCK_TASK_RESOURCE.id;
            const taskId2 = MOCK_TASK_RESOURCE_NOT_ASSIGNED.id;
            const expectedResult = [
                new ProjectTaskActions.Request.AllByIds([taskId1]),
                new ProjectTaskActions.Request.AllByIds([taskId2]),
            ];
            const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
            const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, taskId1, MOCK_TASK_RESOURCE.version + 1);
            const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);
            const object2 = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, taskId2, MOCK_TASK_RESOURCE_NOT_ASSIGNED.version + 1);
            const event2 = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object2);

            projectTasksEffects.taskUpdateEvents$.subscribe(result => currentResult.push(result));

            context.next(root);
            updates.next(event);
            tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);
            updates.next(event2);
            tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

            expect(currentResult).toEqual(expectedResult);
        }));

        it(`should not trigger a ProjectTaskActions.Request.TaskById when an ${eventType} event from an task is received ` +
            'but version is the same', () => {
            let currentResult: Action = null;
            const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
            const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version);
            const event = new RealtimeEventUpdateDataResource(eventType, root, object);

            context.next(root);
            updates.next(event);

            projectTasksEffects.taskUpdateEvents$.subscribe(result => {
                currentResult = result;
            });

            expect(currentResult).toBeNull();
        });
    });

    it('should trigger a ProjectTaskActions.Request.AllCalendar when an event from a deleted task is received', () => {
        let currentResult: Action = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, object);

        projectTasksEffects.taskCreateOrDeleteEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a ProjectTaskActions.Request.CalendarTasks when an event from a deleted task is received ' +
        'but task does not exist in store', () => {
        let currentResult: Action = null;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE_2.id, MOCK_TASK_RESOURCE_2.version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, object);

        context.next(root);
        updates.next(event);

        projectTasksEffects.taskCreateOrDeleteEvents$.subscribe(result => {
            currentResult = result;
        });

        expect(currentResult).toBeNull();
    });

    it('should trigger a ProjectTaskActions.Request.AllCalendar when an event from a created task is received', () => {
        let currentResult: Action = null;
        const expectedResult = new ProjectTaskActions.Request.AllCalendar();
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE_2.id, MOCK_TASK_RESOURCE_2.version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        projectTasksEffects.taskCreateOrDeleteEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a ProjectTaskActions.Request.CalendarTasks when an event from a created task is received ' +
        'but task already exists', () => {
        let currentResult: Action = null;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        projectTasksEffects.taskCreateOrDeleteEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toBeNull();
    });

    it('should trigger a ProjectTaskActions.Request.One when an event from an updated task constraint is received', () => {
        let currentResult: Action = null;
        const expectedResult = new ProjectTaskActions.Request.One(MOCK_TASK_RESOURCE.id);
        const root: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const version = MOCK_TASK_RESOURCE._embedded.constraints.version + 1;
        const object: ObjectIdentifierPairWithVersion =
            new ObjectIdentifierPairWithVersion(ObjectTypeEnum.TaskConstraints, MOCK_TASK_RESOURCE.id, version);
        const event: RealtimeEventUpdateDataResource = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        projectTasksEffects.taskConstraintsCreateOrUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a ProjectTaskActions.Request.TaskById when an event from an updated task constraint is received ' +
        'but version is the same', () => {
        let currentResult: Action = null;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const version = MOCK_TASK_RESOURCE._embedded.constraints.version;
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.TaskConstraints, MOCK_TASK_RESOURCE.id, version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        projectTasksEffects.taskConstraintsCreateOrUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toBeNull();
    });

    it('should trigger a ProjectTaskActions.Request.One when an event from a created task constraint is received', () => {
        let currentResult: Action = null;
        const expectedResult = new ProjectTaskActions.Request.One(MOCK_TASK_RESOURCE.id);
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const version = MOCK_TASK_RESOURCE._embedded.constraints.version;
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.TaskConstraints, MOCK_TASK_RESOURCE.id, version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        store._value.projectModule.projectTaskSlice.items[0]._embedded.constraints = null;

        projectTasksEffects.taskConstraintsCreateOrUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a ProjectTaskActions.Request.TaskById when an event from a created task constraint is received ' +
        'but task constraints already exist for the task', () => {
        store._value.projectModule.projectTaskSlice.items[0]._embedded.constraints = MOCK_TASK_CONSTRAINTS_RESOURCE;

        let currentResult: Action = null;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const version = MOCK_TASK_RESOURCE._embedded.constraints.version;
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.TaskConstraints, MOCK_TASK_RESOURCE.id, version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Created, root, object);

        projectTasksEffects.taskConstraintsCreateOrUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        expect(currentResult).toBeNull();
    });

    it('should trigger a ProjectTaskActions.Move.OneRejected when moving task to other workarea fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneRejected(MOCK_TASK_RESOURCE.id),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(errorResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).not.toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.OneRejected when moving task to other week fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneRejected(MOCK_TASK_RESOURCE.id),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: null,
        };

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).not.toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.OneRejected when moving task to other week and workarea fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneRejected(MOCK_TASK_RESOURCE.id),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(errorResponse);
        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.OneFulfilled when moving task to other workarea', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            task: MOCK_TASK_RESOURCE,
            schedule: null,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).not.toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Move.OneFulfilled when moving task to other week', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
            task: null,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: null,
        };

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).not.toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Move.OneFulfilled when moving task to other week and workarea', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
            task: MOCK_TASK_RESOURCE,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a AlertActions.Add.WarningAlert when moving task to other week and workarea and ' +
        'schedule update request fails', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            task: MOCK_TASK_RESOURCE,
            schedule: null,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage')}),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(updateTaskResponse);
        taskScheduleService.update.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a AlertActions.Add.WarningAlert when moving task to other week and workarea and task update request fails', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            schedule: MOCK_TASK_SCHEDULE_RESOURCE_A,
            task: null,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage')}),
        ];
        const payload: MoveTaskPayload = {
            taskId: MOCK_TASK_RESOURCE.id,
            start: moment(MOCK_TASK_RESOURCE._embedded.schedule.start).add(1, 'w'),
            end: moment(MOCK_TASK_RESOURCE._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        };

        taskService.update.and.returnValue(errorResponse);
        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);
        actions.next(new ProjectTaskActions.Move.One(payload));
        projectTasksEffects.moveTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalled();
        expect(taskService.update).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Resize.OneFulfilled and AlertActions.Add.SuccessAlert on a successful Task resize', () => {
        const results: any[] = [];
        const taskId = MOCK_TASK.id;
        const version = MOCK_TASK_SCHEDULE_A.version;
        const start = moment(MOCK_TASK_SCHEDULE_A.start);
        const end = moment(MOCK_TASK_SCHEDULE_A.end);
        const payloadFulfilled = MOCK_TASK_SCHEDULE_RESOURCE_A;
        const saveTaskScheduleResource = SaveTaskScheduleResource.fromTimeScopeAndTaskSchedule({
            start,
            end,
        }, MOCK_TASK_SCHEDULE_A);
        const payload: ResizeTaskPayload = {
            taskId,
            start,
            end,
        };
        const expectedResults: any[] = [
            new ProjectTaskActions.Resize.OneFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}),
        ];

        taskScheduleService.update.and.returnValue(updateTaskScheduleResponse);

        actions.next(new ProjectTaskActions.Resize.One(payload));

        projectTasksEffects.resizeTask$.subscribe(result => results.push(result));

        expect(taskScheduleService.update).toHaveBeenCalledWith(taskId, saveTaskScheduleResource, version);
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger ProjectTaskActions.Resize.OneRejected on a unsuccessful Task resize', () => {
        const taskId = MOCK_TASK.id;
        const version = MOCK_TASK_SCHEDULE_A.version;
        const start = moment(MOCK_TASK_SCHEDULE_A.start);
        const end = moment(MOCK_TASK_SCHEDULE_A.end);
        const saveTaskScheduleResource = SaveTaskScheduleResource.fromTimeScopeAndTaskSchedule({
            start,
            end,
        }, MOCK_TASK_SCHEDULE_A);
        const payload: ResizeTaskPayload = {
            taskId,
            start,
            end,
        };
        const expectedResult = new ProjectTaskActions.Resize.OneRejected(MOCK_TASK_RESOURCE.id);

        taskScheduleService.update.and.returnValue(errorResponse);

        actions.next(new ProjectTaskActions.Resize.One(payload));

        projectTasksEffects.resizeTask$.subscribe(result => {
            expect(taskScheduleService.update).toHaveBeenCalledWith(taskId, saveTaskScheduleResource, version);
            expect(result).toEqual(expectedResult);
        });

    });

    it('should trigger a ProjectTaskActions.Move.AllRejected when moving multiple tasks to other workarea fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllRejected(MOCK_TASKS_RESOURCES.map(taskResource => taskResource.id)),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start),
            end: moment(taskResource._embedded.schedule.end),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(errorResponse);
        taskScheduleService.updateAll.and.returnValue(updateAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).not.toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.AllRejected when moving multiple tasks to other week fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllRejected(MOCK_TASKS_RESOURCES.map(taskResource => taskResource.id)),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: null,
        }));

        taskService.updateAll.and.returnValue(updateAllTasksResponse);
        taskScheduleService.updateAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).not.toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.AllRejected when moving multiple tasks to other week and workarea fails', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllRejected(MOCK_TASKS_RESOURCES.map(taskResource => taskResource.id)),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(errorResponse);
        taskScheduleService.updateAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Move.AllFulfilled when moving multiple tasks to other workarea', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start),
            end: moment(taskResource._embedded.schedule.end),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(updateAllTasksResponse);
        taskScheduleService.updateAll.and.returnValue(updateAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).not.toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Move.AllFulfilled when moving multiple tasks to other week', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: null,
            schedule: taskResource._embedded.schedule,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: null,
        }));

        taskService.updateAll.and.returnValue(updateAllTasksResponse);
        taskScheduleService.updateAll.and.returnValue(updateAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).not.toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Move.AllFulfilled when moving multiple tasks to other week and workarea', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: taskResource._embedded.schedule,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')}),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(updateAllTasksResponse);
        taskScheduleService.updateAll.and.returnValue(updateAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a AlertActions.Add.WarningAlert when moving multiple tasks to other week and workarea and ' +
        'schedules update request fails', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled),
            new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Tasks_CreateOrUpdate_PartialSuccessMessage')}),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(updateAllTasksResponse);
        taskScheduleService.updateAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a AlertActions.Add.WarningAlert when moving multiple tasks to other week and workarea and ' +
        'tasks update request fails', () => {
        const results: any[] = [];
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: null,
            schedule: taskResource._embedded.schedule,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled),
            new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Tasks_CreateOrUpdate_PartialSuccessMessage')}),
        ];
        const payload: MoveTaskPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            start: moment(taskResource._embedded.schedule.start).add(1, 'w'),
            end: moment(taskResource._embedded.schedule.end).add(1, 'w'),
            workAreaId: 'dummyArea',
        }));

        taskService.updateAll.and.returnValue(errorResponse);
        taskScheduleService.updateAll.and.returnValue(updateAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Move.All(payload));
        projectTasksEffects.moveAllTasks$.subscribe(result => results.push(result));

        expect(taskScheduleService.updateAll).toHaveBeenCalled();
        expect(taskService.updateAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1].payload.message).toEqual(expectedResults[1].payload.message);
        expect(results[1].payload.type).toEqual(expectedResults[1].payload.type);
    });

    it('should trigger a ProjectTaskActions.Create.AllRejected when creating multiple tasks fails on tasks create', () => {
        const results: any[] = [];
        const expectedResults: any[] = [
            new ProjectTaskActions.Create.AllRejected(),
        ];
        const payload: SaveTaskResource[] = MOCK_TASKS.map(SaveTaskResource.fromTask);

        taskService.createAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Create.All(payload));
        projectTasksEffects.createAll$.subscribe(result => results.push(result));

        expect(taskService.createAll).toHaveBeenCalled();
        expect(taskScheduleService.createAll).not.toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger a ProjectTaskActions.Copy.AllRejected when copying multiple tasks fails on tasks copy', () => {
        const results = [];
        const expectedResults: Action[] = [
            new ProjectTaskActions.Copy.AllRejected(),
        ];
        const payload: SaveCopyTaskResource[] = MOCK_SAVE_COPY_TASK_RESOURCES;

        taskService.copyAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Copy.All(payload));
        projectTasksEffects.copyAll$.subscribe(result => results.push(result));

        expect(taskService.copyAll).toHaveBeenCalled();
        expect(results).toEqual(expectedResults);
    });

    it('should trigger ProjectTaskActions.Copy.AllFulfilled, CalendarSelectionActions.Set.Items and DayCardActions.Request.AllFromTasks' +
        ' action when copying multiple tasks succeeds', () => {
        const results = [];
        const taskObjectIdentifiers = MOCK_TASKS.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const taskIds = MOCK_TASKS.map(item => item.id);
        const expectedResults: Action[] = [
            new ProjectTaskActions.Copy.AllFulfilled(MOCK_TASKS_RESOURCES),
            new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
            new DayCardActions.Request.AllFromTasks(taskIds),
        ];
        const payload: SaveCopyTaskResource[] = MOCK_SAVE_COPY_TASK_RESOURCES;

        taskService.copyAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Copy.All(payload));
        projectTasksEffects.copyAll$.subscribe(result => results.push(result));

        expect(taskService.copyAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1]).toEqual(expectedResults[1]);
        expect(results[2]).toEqual(expectedResults[2]);
    });

    it('should trigger a ProjectTaskActions.Create.AllFulfilled when creating multiple tasks without schedule succeeds', () => {
        const results: any[] = [];
        const taskObjectIdentifiers = MOCK_TASKS.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled),
            new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Create_SuccessMessage')}),
        ];
        const payload: SaveTaskResource[] = MOCK_TASKS.map(task => ({
            ...SaveTaskResource.fromTask(task),
            start: null,
            end: null,
        }));

        taskService.createAll.and.returnValue(createAllTasksResponse);
        actions.next(new ProjectTaskActions.Create.All(payload));
        projectTasksEffects.createAll$.subscribe(result => results.push(result));

        expect(taskService.createAll).toHaveBeenCalled();
        expect(taskScheduleService.createAll).not.toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1]).toEqual(expectedResults[1]);
        expect(results[2].payload.message).toEqual(expectedResults[2].payload.message);
        expect(results[2].payload.type).toEqual(expectedResults[2].payload.type);
    });

    it('should trigger a ProjectTaskActions.Create.AllFulfilled when creating multiple tasks with schedule succeeds', () => {
        const results: any[] = [];
        const taskObjectIdentifiers = MOCK_TASKS.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: taskResource._embedded.schedule,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled),
            new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Create_SuccessMessage')}),
        ];
        const payload: SaveTaskResource[] = MOCK_TASKS.map(SaveTaskResource.fromTask);

        taskService.createAll.and.returnValue(createAllTasksResponse);
        taskScheduleService.createAll.and.returnValue(createAllTaskSchedulesResponse);
        actions.next(new ProjectTaskActions.Create.All(payload));
        projectTasksEffects.createAll$.subscribe(result => results.push(result));

        expect(taskScheduleService.createAll).toHaveBeenCalled();
        expect(taskService.createAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1]).toEqual(expectedResults[1]);
        expect(results[2].payload.message).toEqual(expectedResults[2].payload.message);
        expect(results[2].payload.type).toEqual(expectedResults[2].payload.type);
    });

    it('should trigger a AlertActions.Add.WarningAlert when creating multiple tasks with schedules and schedules creation fails', () => {
        const results: any[] = [];
        const taskObjectIdentifiers = MOCK_TASKS.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
        const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload[] = MOCK_TASKS_RESOURCES.map(taskResource => ({
            taskId: taskResource.id,
            task: taskResource,
            schedule: null,
        }));
        const expectedResults: any[] = [
            new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled),
            new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
            new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Tasks_CreateOrUpdate_PartialSuccessMessage')}),
        ];
        const payload: SaveTaskResource[] = MOCK_TASKS.map(SaveTaskResource.fromTask);

        taskService.createAll.and.returnValue(createAllTasksResponse);
        taskScheduleService.createAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Create.All(payload));
        projectTasksEffects.createAll$.subscribe(result => results.push(result));

        expect(taskScheduleService.createAll).toHaveBeenCalled();
        expect(taskService.createAll).toHaveBeenCalled();
        expect(results[0]).toEqual(expectedResults[0]);
        expect(results[1]).toEqual(expectedResults[1]);
        expect(results[2].payload.message).toEqual(expectedResults[2].payload.message);
        expect(results[2].payload.type).toEqual(expectedResults[2].payload.type);
    });

    it('should trigger ProjectTaskActions.Request.AllByIdsFulfilled action after a successful tasks find all by ids', () => {
        const taskList = new Array(150).fill(MOCK_TASK_RESOURCE);
        const taskIds = taskList.map(item => item.id);
        const results = chunk(taskList, 100);
        const firstResultResponse = of(results[0]);
        const secondResultResponse = of(results[1]);
        const expectedResult = new ProjectTaskActions.Request.AllByIdsFulfilled(taskList);

        taskService.findAllByIds.and.returnValues(firstResultResponse, secondResultResponse);
        actions.next(new ProjectTaskActions.Request.AllByIds(taskIds));
        projectTasksEffects.requestTasksByIds$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(taskService.findAllByIds).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger ProjectTaskActions.Request.AllByIdsRejected action after a unsuccessful request for tasks find all by ids', () => {
        const expectedResult = new ProjectTaskActions.Request.AllByIdsRejected();

        taskService.findAllByIds.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Request.AllByIds(['foo']));
        projectTasksEffects.requestTasksByIds$.subscribe(result => expect(result).toEqual(expectedResult));
    });

    UPDATE_TASK_STATUS_FULFILLED_ACTIONS.forEach(action => {
        it(`should trigger a ProjectTaskActions.Request.OneTaskScheduleByTaskId action after a "${action}" action is triggered`, () => {
            const expectedResult = new ProjectTaskActions.Request.OneTaskScheduleByTaskId(MOCK_TASK_RESOURCE.id);

            actions.next({type: action, payload: MOCK_TASK_RESOURCE});
            projectTasksEffects.updateStatusTaskSuccess$
                .pipe(take(1))
                .subscribe(result => expect(result).toEqual(expectedResult));
        });

        it(`should not trigger a ProjectTaskActions.Request.OneTaskScheduleByTaskId action after a "${action}" action is
        triggered when the schedule is null`, () => {
            const clonedMock = Object.assign({}, cloneDeep(MOCK_TASK_RESOURCE), {_embedded: {schedule: null}});
            let resultFromEffect;

            actions.next({type: action, payload: clonedMock});
            projectTasksEffects.updateStatusTaskSuccess$
                .pipe(take(1))
                .subscribe(result => resultFromEffect = result);

            expect(resultFromEffect).toBeUndefined();
        });
    });

    it('should not trigger a task list request when useCriteria is set to FALSE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.list.filters.useCriteria = false;
        actions.next(new ProjectTaskActions.Request.All());

        projectTasksEffects.requestTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
        expect(taskService.findAll).not.toHaveBeenCalled();
    });

    it('should trigger a task list request when useCriteria is set to TRUE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.list.filters.useCriteria = true;
        actions.next(new ProjectTaskActions.Request.All());

        projectTasksEffects.requestTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(taskService.findAll).toHaveBeenCalled();
    });

    it('should trigger ProjectTaskActions.Initialize.ListItems action when useCriteria is set to FALSE', () => {
        const expectedResult = new ProjectTaskActions.Initialize.ListItems();

        store._value.projectModule.projectTaskSlice.list.filters.useCriteria = false;
        actions.next(new ProjectTaskActions.Request.All());

        projectTasksEffects.initializeListTasks$
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should not trigger ProjectTaskActions.Initialize.ListItems action when useCriteria is set to TRUE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.list.filters.useCriteria = true;
        actions.next(new ProjectTaskActions.Request.All());

        projectTasksEffects.initializeListTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
    });

    it('should not trigger a task calendar request when useCriteria and highlight are set to FALSE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = false;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = false;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.requestCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
        expect(taskService.findAll).not.toHaveBeenCalled();
    });

    it('should trigger a task calendar request when useCriteria and highlight are set to TRUE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = true;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = true;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.requestCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(taskService.findAll).toHaveBeenCalled();
    });

    it('should trigger a task calendar request when useCriteria is set to TRUE and highlight is set to FALSE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = true;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = false;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.requestCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(taskService.findAll).toHaveBeenCalled();
    });

    it('should trigger a task calendar request when useCriteria is set to FALSE and highlight is set to TRUE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = false;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = true;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.requestCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).not.toBe(0);
        expect(taskService.findAll).toHaveBeenCalled();
    });

    it('should trigger ProjectTaskActions.Initialize.CalendarItems action when useCriteria and highlight are set to FALSE', () => {
        const expectedResult = new ProjectTaskActions.Initialize.CalendarItems();

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = false;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = false;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.initializeCalendarTasks$
            .pipe(take(1))
            .subscribe(result => expect(result).toEqual(expectedResult));
    });

    it('should not trigger ProjectTaskActions.Initialize.CalendarItems action when useCriteria is set to TRUE' +
        ' and highlight is set to FALSE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = true;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = false;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.initializeCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
    });

    it('should not trigger ProjectTaskActions.Initialize.CalendarItems action when useCriteria is set to FALSE' +
        ' and highlight is set to TRUE', () => {
        let results = 0;

        store._value.projectModule.projectTaskSlice.calendar.filters.useCriteria = false;
        store._value.projectModule.projectTaskSlice.calendar.filters.highlight = true;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.initializeCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
    });

    it('should not trigger a task calendar request when the current project is not set', () => {
        let results = 0;

        store._value.projectModule.projectSlice.currentItem.id = null;
        actions.next(new ProjectTaskActions.Request.AllCalendar());

        projectTasksEffects.requestCalendarTasks$
            .pipe(take(1))
            .subscribe(() => results++);

        expect(results).toBe(0);
        expect(taskService.findAll).not.toHaveBeenCalled();
    });

    Object.keys(sortFieldMap).forEach(sortingMode => {
        const sortingField: TasksSortField = sortFieldMap[sortingMode];

        it('should trigger a ProjectTaskActions.Set.CalendarSort with ' + sortingField +
            ' action when sorting mode setting change to ' + sortingMode, () => {
            const results = [];
            const settings = Object.assign(new CalendarUserSettings(), {sortingMode});
            const expectedResult = new ProjectTaskActions.Set.CalendarSort(new SorterData<TasksSortField>(sortingField));

            projectTasksEffects.setCalendarSort$.subscribe(result => results.push(result));

            observeCalendarUserSettings.next(settings);

            expect(results[0]).toEqual(expectedResult);
        });
    });

    it('should not trigger a ProjectTaskActions.Set.CalendarSort action when sorting mode change to the same value', () => {
        const results = [];
        const settings = Object.assign(new CalendarUserSettings(), {sortingMode: TaskCalendarSortingModeEnum.Default});

        projectTasksEffects.setCalendarSort$.subscribe(result => results.push(result));

        observeCalendarUserSettings.next(settings);
        observeCalendarUserSettings.next(settings);

        expect(results.length).toBe(1);
    });

    it(`should trigger a NewsActions.Request.AllNews when an update event from a task is received`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id)]);
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version + 1);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        projectTasksEffects.newsUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);

        tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it(`should not buffer the news update events and trigger a NewsActions.Request.AllNews when they match the ` +
        `required criteria but they are received with a time gap of ${TASK_UPDATE_EVENTS_DEBOUNCE_TIME}ms`, fakeAsync(() => {
        const currentResult: Action[] = [];
        const taskId1 = MOCK_TASK_RESOURCE.id;
        const taskId2 = MOCK_TASK_RESOURCE_NOT_ASSIGNED.id;
        const expectedResult = [
            new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId1)]),
            new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId2)]),
        ];
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object1 = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, taskId1, MOCK_TASK_RESOURCE.version + 1);
        const event1 = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object1);
        const object2 = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, taskId2, MOCK_TASK_RESOURCE_NOT_ASSIGNED.version + 1);
        const event2 = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object2);

        projectTasksEffects.newsUpdateEvents$.subscribe(result => currentResult.push(result));

        context.next(root);
        updates.next(event1);
        tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);
        updates.next(event2);
        tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it(`should trigger a NewsActions.Request.AllNews only once when an update event from tasks` +
        `with the same id are received`, fakeAsync(() => {
        let currentResult: Action = null;
        const expectedResult = new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id)]);
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, MOCK_TASK_RESOURCE.id, MOCK_TASK_RESOURCE.version + 1);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Updated, root, object);

        projectTasksEffects.newsUpdateEvents$.subscribe(result => {
            currentResult = result;
        });

        context.next(root);
        updates.next(event);
        updates.next(event);

        tick(TASK_UPDATE_EVENTS_DEBOUNCE_TIME);

        expect(currentResult).toEqual(expectedResult);
    }));

    it('should trigger a CalendarSelectionActions.Initialize.All action after the calendar filters change', (done) => {
        const expectedResult = new CalendarSelectionActions.Initialize.All();

        actions.next(new ProjectTaskActions.Set.CalendarFilters(testDataFilters));
        projectTasksEffects.resetCalendarSelection$
            .pipe(take(1))
            .subscribe(result => {
                expect(result).toEqual(expectedResult);
                done();
            });
    });

    it('should trigger a CalendarSelectionActions.Toggle.SelectionItem action with the deleted task when an event ' +
        'from a deleted task is received and the deleted task was selected', () => {
        let currentResult: Action = null;
        const {id, version} = MOCK_TASK_RESOURCE;
        const deletedItem = new ObjectIdentifierPair(ObjectTypeEnum.Task, id);
        const expectedResult = new CalendarSelectionActions.Toggle.SelectionItem(deletedItem);
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, id, version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, object);
        const selectedIds = [id];

        calendarSelectionItemsIdsByTypeSubject.next(selectedIds);
        projectTasksEffects.taskDeleteEvents$.subscribe(result => currentResult = result);

        context.next(root);
        updates.next(event);

        expect(currentResult).toEqual(expectedResult);
    });

    it('should not trigger a CalendarSelectionActions.Toggle.SelectionItem action with the deleted task when an event ' +
        'from a deleted task is received but the deleted task was not selected', () => {
        let currentResult: Action = null;
        const {id, version} = MOCK_TASK_RESOURCE;
        const root = new ObjectIdentifierPair(ObjectTypeEnum.Project, MOCK_PROJECT_1.id);
        const object = new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Task, id, version);
        const event = new RealtimeEventUpdateDataResource(EventTypeEnum.Deleted, root, object);
        const selectedIds = [];

        calendarSelectionItemsIdsByTypeSubject.next(selectedIds);
        projectTasksEffects.taskDeleteEvents$.subscribe(result => currentResult = result);

        context.next(root);
        updates.next(event);

        expect(currentResult).toBeNull();
    });

    it('should trigger a ProjectTaskActions.Start.AllFulfilled action after starting a list of tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Start.AllFulfilled(MOCK_TASK_LIST.tasks);

        taskService.startAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Start.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('Should trigger startAll once when there are up to five hundred taskIds', () => {
        taskService.startAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Start.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.startAll).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger startAll twice when there are more than five hundred task IDs and fewer than one thousand', () => {
        taskService.startAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Start.All(arrayToForceTwoChunksTasksStatus));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.startAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Start.AllRejected action after starting tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Start.AllRejected();

        taskService.startAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Start.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectTaskActions.Start.AllFulfilled action is triggered', () => {
        const expectedResult = getExpectedAlertAction(
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')})
        );

        actions.next(new ProjectTaskActions.Start.AllFulfilled(MOCK_TASK_LIST.tasks));
        projectTasksEffects.updateStatusAllTasksSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Accept.AllFulfilled action after accepting a list of tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Accept.AllFulfilled(MOCK_TASK_LIST.tasks);

        taskService.acceptAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Accept.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('Should trigger acceptAll once when there are up to five hundred taskIds', () => {
        taskService.acceptAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Accept.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.acceptAll).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger acceptAll twice when there are more than five hundred task IDs and fewer than one thousand', () => {
        taskService.acceptAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Accept.All(arrayToForceTwoChunksTasksStatus));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.acceptAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Accept.AllRejected action after accepting tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Accept.AllRejected();

        taskService.acceptAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Accept.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectTaskActions.Accept.AllFulfilled action is triggered', () => {
        const expectedResult = getExpectedAlertAction(
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')})
        );

        actions.next(new ProjectTaskActions.Accept.AllFulfilled(MOCK_TASK_LIST.tasks));
        projectTasksEffects.updateStatusAllTasksSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Close.AllFulfilled action after closing a list of tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Close.AllFulfilled(MOCK_TASK_LIST.tasks);

        taskService.closeAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Close.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('Should trigger closeAll once when there are up to five hundred taskIds', () => {
        taskService.closeAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Close.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.closeAll).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger closeAll twice when there are more than five hundred task IDs and fewer than one thousand', () => {
        taskService.closeAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Close.All(arrayToForceTwoChunksTasksStatus));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.closeAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Close.AllRejected action after closing tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Close.AllRejected();

        taskService.closeAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Close.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectTaskActions.Close.AllFulfilled action is triggered', () => {
        const expectedResult = getExpectedAlertAction(
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')})
        );

        actions.next(new ProjectTaskActions.Close.AllFulfilled(MOCK_TASK_LIST.tasks));
        projectTasksEffects.updateStatusAllTasksSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectTaskActions.Reset.AllFulfilled action after resetting a list of tasks successfully', () => {
        const expectedResult = new ProjectTaskActions.Reset.AllFulfilled(MOCK_TASK_LIST.tasks);

        taskService.resetAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Reset.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('Should trigger resetAll once when there are up to five hundred taskIds', () => {
        taskService.resetAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Reset.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.resetAll).toHaveBeenCalledTimes(1);
        });
    });

    it('Should trigger resetAll twice when there are more than five hundred task IDs and fewer than one thousand', () => {
        taskService.resetAll.and.returnValue(getAbstractItemsTasksResponse);
        actions.next(new ProjectTaskActions.Reset.All(arrayToForceTwoChunksTasksStatus));
        projectTasksEffects.updateStatusAllTasks$.subscribe(() => {
            expect(taskService.resetAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectTaskActions.Reset.AllRejected action after resetting tasks has failed', () => {
        const expectedResult = new ProjectTaskActions.Reset.AllRejected();

        taskService.resetAll.and.returnValue(errorResponse);
        actions.next(new ProjectTaskActions.Reset.All(taskIdsArray));
        projectTasksEffects.updateStatusAllTasks$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectTaskActions.Reset.AllFulfilled action is triggered', () => {
        const expectedResult = getExpectedAlertAction(
            new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')})
        );

        actions.next(new ProjectTaskActions.Reset.AllFulfilled(MOCK_TASK_LIST.tasks));
        projectTasksEffects.updateStatusAllTasksSuccess$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
