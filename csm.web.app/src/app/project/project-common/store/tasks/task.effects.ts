/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {
    chunk,
    flatten,
    omit,
    uniq,
    uniqBy
} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    Observable,
    of,
    zip,
} from 'rxjs';
import {
    buffer,
    catchError,
    debounceTime,
    distinctUntilChanged,
    filter,
    first,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {AbstractIdsSaveResource} from '../../../../shared/misc/api/resources/abstract-ids-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {UUID} from '../../../../shared/misc/identification/uuid';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {CreateTaskScheduleListItemResource} from '../../api/task-schedueles/resources/create-task-schedule-list-item.resource';
import {SaveTaskScheduleListItemResource} from '../../api/task-schedueles/resources/save-task-schedule-list-item.resource';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {CreateTaskListItemResource} from '../../api/tasks/resources/create-task-list-item.resource';
import {SaveTaskResource} from '../../api/tasks/resources/save-task.resource';
import {SaveTaskListItemResource} from '../../api/tasks/resources/save-task-list-item.resource';
import {SaveTaskScheduleResource} from '../../api/tasks/resources/save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from '../../api/tasks/resources/save-task-schedule-slot.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {ProjectTaskListResource} from '../../api/tasks/resources/task-list.resource';
import {
    TaskScheduleResource,
    TaskScheduleSlotResource,
} from '../../api/tasks/resources/task-schedule.resource';
import {
    TaskService,
    TasksSortField,
} from '../../api/tasks/task.service';
import {TaskAttachmentService} from '../../api/tasks/task-attachment.service';
import {TaskCalendarSortingModeEnum} from '../../enums/task-calendar-sorting-mode.enum';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {Task} from '../../models/tasks/task';
import {
    ActivityActions,
    RequestAllActivitiesPayload
} from '../activities/activity.actions';
import {AttachmentActions} from '../attachments/attachment.actions';
import {CalendarQueries} from '../calendar/calendar/calendar.queries';
import {CalendarScopeActionEnum} from '../calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../calendar/calendar-selection/calendar-selection.queries';
import {DayCardActions} from '../day-cards/day-card.actions';
import {NewsActions} from '../news/news.actions';
import {ProjectQueries} from '../projects/project.queries';
import {ProjectSliceService} from '../projects/project-slice.service';
import {TaskScheduleQueries} from '../task-schedules/task-schedule.queries';
import {TopicActions} from '../topics/topic.actions';
import {SaveProjectTaskFilters} from './slice/save-project-task-filters';
import {
    CreateOrUpdateTaskFulfilledPayload,
    MoveTaskPayload,
    ProjectTaskActions,
    TaskActionEnum,
} from './task.actions';
import {ProjectTaskQueries} from './task-queries';

type UpdateTaskStatusActions =
    ProjectTaskActions.Start.One |
    ProjectTaskActions.Send.One |
    ProjectTaskActions.Accept.One |
    ProjectTaskActions.Close.One |
    ProjectTaskActions.Reset.One;

type UpdateAllTasksStatusActions =
    ProjectTaskActions.Start.All |
    ProjectTaskActions.Send.All |
    ProjectTaskActions.Accept.All |
    ProjectTaskActions.Close.All |
    ProjectTaskActions.Reset.All;

export type UpdateTaskStatusFulfilledActions =
    ProjectTaskActions.Start.OneFulfilled |
    ProjectTaskActions.Send.OneFulfilled |
    ProjectTaskActions.Accept.OneFulfilled |
    ProjectTaskActions.Close.OneFulfilled |
    ProjectTaskActions.Reset.OneFulfilled;

type TaskStatusConfig = {
    [key in TaskActionEnum]?: {
        service: (id: string) => Observable<TaskResource>;
        fulfilledAction: (projectTaskResource: TaskResource) => Action;
        rejectedAction: () => Action;
    }
};

type AllTasksStatusConfig = {
    [key in TaskActionEnum]?: {
        service: (ids: AbstractIdsSaveResource, projectId: string) => Observable<AbstractItemsResource<TaskResource>>;
        fulfilledAction: (taskList: TaskResource[]) => Action;
        rejectedAction: () => Action;
    }
};

export const TASK_UPDATE_EVENTS_DEBOUNCE_TIME = 1000;

export const UPDATE_TASK_STATUS_FULFILLED_ACTIONS: TaskActionEnum[] = [
    TaskActionEnum.StartOneFulfilled,
    TaskActionEnum.AcceptOneFulfilled,
    TaskActionEnum.CloseOneFulfilled,
    TaskActionEnum.SendOneFulfilled,
    TaskActionEnum.ResetOneFulfilled,
];

@Injectable()
export class ProjectTasksEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries();
    private _taskQueries: ProjectTaskQueries = new ProjectTaskQueries(this._store);

    /**
     * @description Stream of events filtered for the current context
     * @description Since the backend does not offer a subscription mechanism, we receive all the events and we have to filter them
     */
    private _updateEventsForCurrentContext$: Observable<RealtimeEventUpdateDataResource> = this._realtimeService.getUpdateEvents()
        .pipe(
            withLatestFrom(this._realtimeQueries.observeContext()),
            filter(([data, context]) => context && data.root.isSame(context)),
            map(([data]) => data),
        );

    /**
     * @description Filter stream of events for tasks in the current context
     */
    private _filterEventsByTasksForCurrentContext$: Observable<Task> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Task),
            filter((data: RealtimeEventUpdateDataResource) => this._taskUpdateEventTypes.includes(data.event)),
            mergeMap((data: RealtimeEventUpdateDataResource) => this._taskUpdateEventsMergeMap(data)),
            filter(([data, task]) => task && data.object.version > task.version),
            map(([, task]) => task),
        );

    private _filteredTaskDeleteEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Task),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Deleted));

    private readonly TRIGGER_REQUEST_TASKS_ACTIONS: string[] = [
        TaskActionEnum.SetPage,
        TaskActionEnum.SetItems,
        TaskActionEnum.SetSort,
        TaskActionEnum.SetFilters,
        TaskActionEnum.CreateOneFulfilled,
    ];

    private readonly TRIGGER_REQUEST_CALENDAR_TASKS_ACTIONS: string[] = [
        CalendarScopeActionEnum.SetScopeParameters,
        CalendarScopeActionEnum.SetStart,
        CalendarScopeActionEnum.SetMode,
        TaskActionEnum.SetCalendarSort,
        TaskActionEnum.SetCalendarFilters,
        TaskActionEnum.CopyAllFulfilled,
        TaskActionEnum.CreateOneFulfilled,
        TaskActionEnum.CreateAllFulfilled,
        TaskActionEnum.MoveAllFulfilled,
    ];

    private _sortFieldMap: { [key in TaskCalendarSortingModeEnum]: TasksSortField } = {
        [TaskCalendarSortingModeEnum.Default]: 'calendarDefault',
        [TaskCalendarSortingModeEnum.CraftsSameLine]: 'calendarCraft',
        [TaskCalendarSortingModeEnum.CraftsNextLine]: 'calendarCraft',
    };
    private _taskUpdateStatusConfig: TaskStatusConfig = {
        [TaskActionEnum.StartOne]: {
            service: (taskId: string) => this._taskService.start(taskId),
            fulfilledAction: (projectTaskResource: TaskResource) => new ProjectTaskActions.Start.OneFulfilled(projectTaskResource),
            rejectedAction: () => new ProjectTaskActions.Start.OneRejected(),
        },
        [TaskActionEnum.SendOne]: {
            service: (taskId: string) => this._taskService.send(taskId),
            fulfilledAction: (projectTaskResource: TaskResource) => new ProjectTaskActions.Send.OneFulfilled(projectTaskResource),
            rejectedAction: () => new ProjectTaskActions.Send.OneRejected(),
        },
        [TaskActionEnum.AcceptOne]: {
            service: (taskId: string) => this._taskService.accept(taskId),
            fulfilledAction: (projectTaskResource: TaskResource) => new ProjectTaskActions.Accept.OneFulfilled(projectTaskResource),
            rejectedAction: () => new ProjectTaskActions.Accept.OneRejected(),
        },
        [TaskActionEnum.CloseOne]: {
            service: (taskId: string) => this._taskService.close(taskId),
            fulfilledAction: (projectTaskResource: TaskResource) => new ProjectTaskActions.Close.OneFulfilled(projectTaskResource),
            rejectedAction: () => new ProjectTaskActions.Close.OneRejected(),
        },
        [TaskActionEnum.ResetOne]: {
            service: (taskId: string) => this._taskService.reset(taskId),
            fulfilledAction: (projectTaskResource: TaskResource) => new ProjectTaskActions.Reset.OneFulfilled(projectTaskResource),
            rejectedAction: () => new ProjectTaskActions.Reset.OneRejected(),
        },
    };

    private _allTasksUpdateStatusConfig: AllTasksStatusConfig = {
        [TaskActionEnum.StartAll]: {
            service: (tasksId: AbstractIdsSaveResource, projectId: string) =>this._taskService.startAll(tasksId, projectId),
            fulfilledAction: (taskList: TaskResource[]) => new ProjectTaskActions.Start.AllFulfilled(taskList),
            rejectedAction: () => new ProjectTaskActions.Start.AllRejected(),
        },
        [TaskActionEnum.SendAll]: {
            service: (tasksId: AbstractIdsSaveResource, projectId: string) => this._taskService.sendAll(tasksId, projectId),
            fulfilledAction: (taskList: TaskResource[]) => new ProjectTaskActions.Send.AllFulfilled(taskList),
            rejectedAction: () => new ProjectTaskActions.Send.AllRejected(),
        },
        [TaskActionEnum.AcceptAll]: {
            service: (tasksId: AbstractIdsSaveResource, projectId: string) => this._taskService.acceptAll(tasksId, projectId),
            fulfilledAction: (taskList: TaskResource[]) => new ProjectTaskActions.Accept.AllFulfilled(taskList),
            rejectedAction: () => new ProjectTaskActions.Accept.AllRejected(),
        },
        [TaskActionEnum.CloseAll]: {
            service: (tasksId: AbstractIdsSaveResource, projectId: string) => this._taskService.closeAll(tasksId, projectId),
            fulfilledAction: (taskList: TaskResource[]) => new ProjectTaskActions.Close.AllFulfilled(taskList),
            rejectedAction: () => new ProjectTaskActions.Close.AllRejected(),
        },
        [TaskActionEnum.ResetAll]: {
            service: (tasksId: AbstractIdsSaveResource, projectId: string) => this._taskService.resetAll(tasksId, projectId),
            fulfilledAction: (taskList: TaskResource[]) => new ProjectTaskActions.Reset.AllFulfilled(taskList),
            rejectedAction: () => new ProjectTaskActions.Reset.AllRejected(),
        },
    };

    private _taskUpdateEventTypes: EventTypeEnum[] = [
        EventTypeEnum.Accepted,
        EventTypeEnum.Assigned,
        EventTypeEnum.Closed,
        EventTypeEnum.Sent,
        EventTypeEnum.Started,
        EventTypeEnum.Unassigned,
        EventTypeEnum.Updated,
        EventTypeEnum.Reset,
    ];

    constructor(private _actions$: Actions,
                private _calendarQueries: CalendarQueries,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _realtimeQueries: RealtimeQueries,
                private _realtimeService: RealtimeService,
                private _projectSliceService: ProjectSliceService,
                private _taskService: TaskService,
                private _taskScheduleService: TaskScheduleService,
                private _taskAttachmentService: TaskAttachmentService,
                private _taskScheduleQueries: TaskScheduleQueries,
                private _store: Store<State>) {
    }

    /**
     * @description News update realtime event interceptor
     * @type {Observable<Action>}
     */
    public newsUpdateEvents$: Observable<Action> = createEffect(() => this._filterEventsByTasksForCurrentContext$
        .pipe(
            buffer(this._filterEventsByTasksForCurrentContext$.pipe(debounceTime(TASK_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((tasks: Task[]) =>
                uniqBy(tasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)), 'id')
            ),
            map(taskOIPs => new NewsActions.Request.AllNews(taskOIPs))
        ));

    /**
     * @description Task update realtime event interceptor
     * @type {Observable<Action>}
     */
    public taskUpdateEvents$: Observable<Action> = createEffect(() => this._filterEventsByTasksForCurrentContext$
        .pipe(
            buffer(this._filterEventsByTasksForCurrentContext$.pipe(debounceTime(TASK_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((tasks: Task[]) => uniq(tasks.map(task => task.id))),
            map(ids => new ProjectTaskActions.Request.AllByIds(ids))
        ));

    /**
     * @description Task create/delete realtime event interceptor
     * @type {Observable<Action>}
     */
    public taskCreateOrDeleteEvents$: Observable<Action> = createEffect(() => this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.Task),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Created || data.event === EventTypeEnum.Deleted),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Created ?
                !this._taskQueries.hasTaskById(data.object.id) :
                this._taskQueries.hasTaskById(data.object.id)
            ),
            switchMap(() => of(new ProjectTaskActions.Request.AllCalendar())),
        ));

    public taskDeleteEvents$: Observable<Action> = createEffect(() => this._filteredTaskDeleteEvents$
        .pipe(
            map((data: RealtimeEventUpdateDataResource) => data.object.id),
            withLatestFrom(this._calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.Task)),
            filter(([deletedId, selectedIds]: [string, string[]]) => selectedIds.includes(deletedId)),
            map(([deletedId]: [string, string[]]) =>
                new CalendarSelectionActions.Toggle.SelectionItem(new ObjectIdentifierPair(ObjectTypeEnum.Task, deletedId))
            ),
        ));

    /**
     * @description Task constraints create/update realtime event interceptor
     * @type {Observable<Action>}
     */
    public taskConstraintsCreateOrUpdateEvents$: Observable<Action> = createEffect(() => this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.TaskConstraints),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Created || data.event === EventTypeEnum.Updated),
            mergeMap((data: RealtimeEventUpdateDataResource) => this._taskUpdateEventsMergeMap(data)),
            filter(([data, task]) => task && (data.event === EventTypeEnum.Created
                ? !task.constraints
                : (data.object.version > task.constraints.version))),
            map(([, task]) => task),
            switchMap((task: Task) => of(new ProjectTaskActions.Request.One(task.id)))));

    /**
     * @description Request set current task interceptor
     * @type {Observable<Action>}
     */
    public triggerRequestActions$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.SetCurrent),
            mergeMap((action: ProjectTaskActions.Set.Current) => [
                new ProjectTaskActions.Request.One(action.payload),
                new TopicActions.Request.All(),
                new NewsActions.Request.AllNews([new ObjectIdentifierPair(ObjectTypeEnum.Task, action.payload)]),
            ])));

    /**
     * @description Request task interceptor to request task by id
     * @type {Observable<Action>}
     */
    public requestById$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestOne),
            switchMap((action: ProjectTaskActions.Request.One) =>
                this._taskService
                    .findOne(action.payload)
                    .pipe(
                        mergeMap(taskResource => [
                            new ProjectTaskActions.Request.OneFulfilled(taskResource),
                            new AttachmentActions.Request.AllByTaskFulfilled({
                                attachmentList: taskResource._embedded.attachments,
                                objectIdentifier: new ObjectListIdentifierPair(ObjectTypeEnum.Task, taskResource.id),
                            }),
                        ]),
                        catchError(() => of(new ProjectTaskActions.Request.OneRejected()))))));

    /**
     * @description Request task schedule interceptor to request current task schedule
     * @type {Observable<Action>}
     */
    public requestTaskScheduleByTaskId$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestOneTaskScheduleByTaskId),
            switchMap((action: ProjectTaskActions.Request.OneTaskScheduleByTaskId) =>
                this._taskScheduleService
                    .findOneByTaskId(action.payload)
                    .pipe(
                        map(taskSchedule => new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(taskSchedule)),
                        catchError(() => of(new ProjectTaskActions.Request.OneTaskScheduleByTaskIdRejected()))))));

    /**
     * @description Global interceptor for project tasks requests
     * @type {Observable<Action>}
     */
    public triggerRequestTasksActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(...this.TRIGGER_REQUEST_TASKS_ACTIONS),
            filter((action: any) => !action.context || action.context === 'list'),
            debounceTime(HTTP_GET_REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new ProjectTaskActions.Request.All()))));

    /**
     * @description Global interceptor for project calendar tasks requests
     * @type {Observable<Action>}
     */
    public triggerRequestCalendarTasksActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(...this.TRIGGER_REQUEST_CALENDAR_TASKS_ACTIONS),
            filter((action: any) => !action.context || action.context === 'calendar'),
            debounceTime(HTTP_GET_REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new ProjectTaskActions.Request.AllCalendar()))));

    /**
     * @description Initialize all the tasks in the task list
     * @type {Observable<Action>}
     */
    public initializeListTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAll),
            withLatestFrom(this._taskQueries.observeTaskListFilters()),
            filter(([, projectTaskFilters]) => !projectTaskFilters.useCriteria),
            switchMap(() => of(new ProjectTaskActions.Initialize.ListItems()))));

    /**
     * @description Request tasks interceptor to requests tasks
     * @type {Observable<Action>}
     */
    public requestTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAll),
            withLatestFrom(
                this._store.pipe(select(this._projectQueries.getSlice())),
                this._store.pipe(select(this._taskQueries.getSlice()))
            ),
            filter(([, , slice]) => slice.list.filters.useCriteria),
            mergeMap(([, projectSlice, projectTaskSlice]) => {
                const projectId = projectSlice.currentItem.id;
                const {page, items} = projectTaskSlice.list.pagination;
                const {field, direction} = projectTaskSlice.list.sort;
                const filters = SaveProjectTaskFilters.fromProjectTaskFilters(projectTaskSlice.list.filters);
                const fieldString = SorterData.getFieldString(direction, field);
                const directionString = SorterData.getDirectionString(direction);

                return this._taskService
                    .findAll(projectId, fieldString, directionString, page, items, filters)
                    .pipe(
                        map(projectTaskResource => new ProjectTaskActions.Request.AllFulfilled(projectTaskResource)),
                        catchError(() => of(new ProjectTaskActions.Request.AllRejected())));
            })));

    /**
     * @description Initialize all the tasks in the calendar
     * @type {Observable<Action>}
     */
    public initializeCalendarTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAllCalendar),
            withLatestFrom(this._taskQueries.observeCalendarFilters()),
            filter(([, projectTaskFilters]) => !projectTaskFilters.useCriteria && !projectTaskFilters.highlight),
            switchMap(() => of(new ProjectTaskActions.Initialize.CalendarItems()))));

    /**
     * @description Request calendar tasks interceptor to requests tasks
     * @type {Observable<Action>}
     */
    public requestCalendarTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAllCalendar),
            withLatestFrom(
                this._store.pipe(select(this._projectQueries.getSlice())),
                this._store.pipe(select(this._taskQueries.getSlice())),
                this._calendarScopeQueries.observeCalendarTaskFiltersWithTruncatedDates(),
                this._calendarScopeQueries.observeDefaultCalendarTaskFiltersWithTruncatedDates(),
            ),
            filter(([, projectSlice]) => !!projectSlice.currentItem.id),
            filter(([, , slice]) => slice.calendar.filters.useCriteria || slice.calendar.filters.highlight),
            switchMap(([, projectSlice, projectTaskSlice, projectTaskFilters, defaultProjectTaskFilters]) => {
                const projectId = projectSlice.currentItem.id;
                const {page, items} = projectTaskSlice.calendar.pagination;
                const {field, direction} = projectTaskSlice.calendar.sort;
                const calendarFilters = projectTaskFilters.highlight ? defaultProjectTaskFilters : projectTaskFilters;

                const filters = SaveProjectTaskFilters.fromProjectTaskFilters(calendarFilters);
                const fieldString = SorterData.getFieldString(direction, field);
                const directionString = SorterData.getDirectionString(direction);

                return this._taskService
                    .findAll(projectId, fieldString, directionString, page, items, filters)
                    .pipe(
                        switchMap((taskList: ProjectTaskListResource) => {
                            const requests = [of(taskList)];

                            for (let pageNumber = page + 1; pageNumber < taskList.totalPages; pageNumber++) {
                                requests.push(this._taskService.findAll(projectId, fieldString, directionString, pageNumber, items, filters));
                            }

                            return zip(...requests);
                        }),
                        map((taskLists: ProjectTaskListResource[]) => {
                            const tasks = taskLists.map(taskList => taskList.tasks);
                            return Object.assign({}, taskLists[0], {tasks: flatten(tasks)});
                        }),
                        map((taskList: ProjectTaskListResource) => new ProjectTaskActions.Request.AllCalendarFulfilled(taskList)),
                        catchError(() => of(new ProjectTaskActions.Request.AllCalendarRejected())));
            })));

    /**
     * @description Assign tasks interceptor
     * @type {Observable<Action>}
     */
    public assignTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.AssignAll),
            mergeMap((action: ProjectTaskActions.Assign.All) => {
                const {taskIds, participantId} = action.payload;
                const requests = chunk(taskIds, 100).map((ids: string[]) =>
                    this._taskService.assign(ids, participantId)
                );
                return zip(...requests).pipe(
                    map((taskLists: ProjectTaskListResource[]) => {
                        const tasks = taskLists.map(taskList => taskList.tasks);
                        return Object.assign({}, taskLists[0], {tasks: flatten(tasks)});
                    }),
                    map(projectTaskResource =>
                        new ProjectTaskActions.Assign.AllFulfilled(projectTaskResource)),
                    catchError(() => of(new ProjectTaskActions.Assign.AllRejected())));
            })));

    /**
     * @description Assign tasks success interceptor
     * @type {Observable<Action>}
     */
    public assignTasksSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.AssignAllFulfilled),
            switchMap((action: ProjectTaskActions.Assign.AllFulfilled) =>
                this._getObservableOfSuccessAlert(action.payload.tasks.length, 'Task_Assign_SuccessMessageSingular', 'Task_Assign_SuccessMessagePlural'))));

    /**
     * @description Update status task interceptor
     * @type {Observable<Action>}
     */
    public updateStatusTask$ = createEffect(() => this._actions$
        .pipe(
            ofType(
                TaskActionEnum.StartOne,
                TaskActionEnum.SendOne,
                TaskActionEnum.CloseOne,
                TaskActionEnum.ResetOne,
                TaskActionEnum.AcceptOne),
            switchMap((action: UpdateTaskStatusActions) => {
                const {service, fulfilledAction, rejectedAction} = this._taskUpdateStatusConfig[action.type];

                return service(action.payload)
                    .pipe(
                        map(projectTaskResource => fulfilledAction(projectTaskResource)),
                        catchError(() => of(rejectedAction()))
                    );
            })
        ));

    /**
     * @description Update status of a list of tasks
     * @type {Observable<Action>}
     */
    public updateStatusAllTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(
                TaskActionEnum.CloseAll,
                TaskActionEnum.SendAll,
                TaskActionEnum.ResetAll,
                TaskActionEnum.AcceptAll,
                TaskActionEnum.StartAll),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([action, projectId]: [UpdateAllTasksStatusActions, string]) => {
                const {service, fulfilledAction, rejectedAction} = this._allTasksUpdateStatusConfig[action.type];
                const reqs = chunk(action.payload, 500).map((ids: string[]) => service(new AbstractIdsSaveResource(ids), projectId));

                return zip(...reqs).pipe(
                    map((taskLists: AbstractItemsResource<TaskResource>[]) => {
                        const tasks = taskLists.map(taskList => taskList.items);
                        return flatten(tasks);
                    }),
                    map(projectTaskResource => fulfilledAction(projectTaskResource)),
                    catchError(() => of(rejectedAction())));
            })));

    /**
     * @description Update status of a list of tasks success interceptor
     * @type {Observable<Action>}
     */
    public updateStatusAllTasksSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                TaskActionEnum.SendAllFulfilled,
                TaskActionEnum.ResetAllFulfilled,
                TaskActionEnum.AcceptAllFulfilled,
                TaskActionEnum.StartAllFulfilled,
                TaskActionEnum.CloseAllFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')}))));

    /**
     * @description Update status task success interceptor
     * The task schedule permissions are bound to the status of a task, so a request to make sure that the schedule is up-to-date is needed
     * @type {Observable<Action>}
     */
    public updateStatusTaskSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(...UPDATE_TASK_STATUS_FULFILLED_ACTIONS),
            filter((action: UpdateTaskStatusFulfilledActions) => !!action.payload._embedded.schedule),
            map((action: UpdateTaskStatusFulfilledActions) => new ProjectTaskActions.Request.OneTaskScheduleByTaskId(action.payload.id))
        ));

    /**
     * @description Create task interceptor
     * @type {Observable<Action>}
     */
    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.CreateOne),
            switchMap((action: ProjectTaskActions.Create.One) => {
                const {start, end, files} = action.payload;
                const hasSchedule = start || end;
                const hasAttachments = files && !!files.length;
                const subsequentRequests: Observable<any>[] = [];

                return this._taskService
                    .create(this._parseTask(action.payload))
                    .pipe(
                        switchMap((task: TaskResource) => {
                            if (hasSchedule) {
                                subsequentRequests.push(this._getCreateScheduleSource(task.id, new SaveTaskScheduleResource(start, end)));
                            }

                            if (hasAttachments) {
                                subsequentRequests.push(this._getAttachmentsSource(task.id, files));
                            }

                            if (subsequentRequests.length) {
                                return zip(
                                    ...subsequentRequests
                                ).pipe(
                                    map(() => new ProjectTaskActions.Create.OneFulfilled(action.context)),
                                    catchError(() => of(new ProjectTaskActions.Create.OnePartiallyFulfilled()))
                                );
                            } else {
                                return of(new ProjectTaskActions.Create.OneFulfilled(action.context));
                            }
                        }),
                        catchError(() => of(new ProjectTaskActions.Create.OneRejected())));
            })));

    /**
     * @description Copy all tasks interceptor
     * @type {Observable<Action>}
     */
    public copyAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.CopyAll),
            map((action: ProjectTaskActions.Copy.All) => action.payload),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            switchMap(([tasksToCopy, projectId]) => {
                return this._taskService.copyAll(tasksToCopy, projectId)
                    .pipe(
                        mergeMap(({items}) => {
                            const taskObjectIdentifiers = items.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
                            const taskIds = items.map(item => item.id);

                            return [
                                new ProjectTaskActions.Copy.AllFulfilled(items),
                                new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
                                new DayCardActions.Request.AllFromTasks(taskIds),
                            ];
                        }),
                        catchError(() => of(new ProjectTaskActions.Copy.AllRejected()))
                    )
            })));

    /**
     * @description Create task success interceptor
     * @type {Observable<AlertActions.Add.SuccessAlert|AlertActions.Add.WarningAlert>}
     */
    public createSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                TaskActionEnum.CreateOneFulfilled,
                TaskActionEnum.CreateOnePartiallyFulfilled
            ),
            map((action: Action) =>
                action.type === TaskActionEnum.CreateOneFulfilled ?
                    new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Create_SuccessMessage')}) :
                    new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage')}))));

    /**
     * @description Create all tasks interceptor
     * @type {Observable<Action>}
     */
    public createAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.CreateAll),
            map((action: ProjectTaskActions.Create.All) => this._combineTasksAndSchedulesToCreate(action.payload)),
            switchMap(([tasks, taskSchedules]) =>
                this._observeTasksCreate(tasks).pipe(switchMap(taskResources => {

                    if (!taskResources) {
                        return of(new ProjectTaskActions.Create.AllRejected());
                    }

                    return this._observeSchedulesCreate(taskSchedules).pipe(switchMap(scheduleResources => {
                        taskResources = taskResources as TaskResource[] || [];

                        const taskIds = taskResources.map(taskResource => taskResource.id);
                        const taskObjectIdentifiers = taskResources.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));
                        const payloadFulfilled = this._buildCreateOrUpdateTaskFulfilledPayload(taskIds, taskResources, scheduleResources as TaskScheduleResource[] || []);
                        const actions: Action[] = [
                            new ProjectTaskActions.Create.AllFulfilled(payloadFulfilled),
                            new CalendarSelectionActions.Set.Items(taskObjectIdentifiers),
                        ];

                        if (scheduleResources === false) {
                            actions.push(new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Tasks_CreateOrUpdate_PartialSuccessMessage')}));
                        } else {
                            actions.push(new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Create_SuccessMessage')}));
                        }

                        return actions;
                    }));
                })))));

    /**
     * @description Edit task interceptor
     * @type {Observable<Action>}
     */
    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.UpdateOne),
            mergeMap((action: ProjectTaskActions.Update.One) => this._withTask<ProjectTaskActions.Update.One>(action)),
            mergeMap(([action, currentTask]) => {
                const {payload: {files}, payload, taskId, taskVersion, taskScheduleVersion} = action.payload;
                const hasAttachments = files && !!files.length;
                const subsequentRequests: Observable<any>[] = [];
                const scheduleSource = this._getUpdateScheduleSource(currentTask, payload, taskScheduleVersion);

                return this._taskService
                    .update(taskId, this._parseTask(payload), taskVersion)
                    .pipe(
                        switchMap(() => {

                            if (scheduleSource) {
                                subsequentRequests.push(scheduleSource);
                            }

                            if (hasAttachments) {
                                subsequentRequests.push(this._getAttachmentsSource(taskId, files));
                            }

                            if (subsequentRequests.length) {
                                return zip(
                                    ...subsequentRequests
                                ).pipe(
                                    map(() => new ProjectTaskActions.Update.OneFulfilled(taskId)),
                                    catchError(() => of(new ProjectTaskActions.Update.OnePartiallyFulfilled(taskId)))
                                );
                            } else {
                                return of(new ProjectTaskActions.Update.OneFulfilled(taskId));
                            }
                        }),
                        catchError(() => of(new ProjectTaskActions.Update.OneRejected())));
            })));

    /**
     * @description Update task success interceptor
     * @type {Observable<AlertActions.Add.SuccessAlert|AlertActions.Add.WarningAlert>, Observable<ProjectTaskActions.Request.Current>}
     */
    public updateSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                TaskActionEnum.UpdateOneFulfilled,
                TaskActionEnum.UpdateOnePartiallyFulfilled
            ),
            mergeMap((action: ProjectTaskActions.Update.OneFulfilled | ProjectTaskActions.Update.OnePartiallyFulfilled) => {
                const taskId = action.payload;
                const requestAllActivitiesPayload: RequestAllActivitiesPayload = {taskId};
                const alertAction = action.type === TaskActionEnum.UpdateOneFulfilled ?
                    new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}) :
                    new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage')});

                this._store.dispatch(new ActivityActions.Initialize.All());
                this._store.dispatch(new ActivityActions.Request.All(requestAllActivitiesPayload));

                return [
                    alertAction,
                    new ProjectTaskActions.Request.One(taskId),
                ];
            })));

    /**
     * @description Delete task interceptor
     * @type {Observable<Action>}
     */
    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.DeleteOne),
            mergeMap((action: ProjectTaskActions.Delete.One) =>
                combineLatest([
                    of(action),
                    this._taskQueries.observeTaskById(action.payload),
                ]).pipe(first())),
            mergeMap(([action, currentTask]) => {
                const taskId = action.payload;
                const version = currentTask.version;

                return this._taskService
                    .delete(taskId, version)
                    .pipe(
                        map(() => new ProjectTaskActions.Delete.OneFulfilled(taskId)),
                        catchError(() => of(new ProjectTaskActions.Delete.OneRejected())));
            })));

    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.DeleteOneFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Delete_SuccessMessage')}))));

    public deleteAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.DeleteAll),
            mergeMap((action: ProjectTaskActions.Delete.All) =>
                combineLatest([
                    of(action),
                    this._projectSliceService.observeCurrentProjectId(),
                ]).pipe(first())),
            mergeMap(([action, projectId]) => {
                const taskIds = action.payload;
                const abstractTaskIds = new AbstractIdsSaveResource(action.payload);

                return this._taskService
                    .deleteAll(abstractTaskIds, projectId)
                    .pipe(
                        mergeMap(() => [
                            new CalendarSelectionActions.Initialize.All(),
                            new ProjectTaskActions.Delete.AllFulfilled(taskIds),
                        ]),
                        catchError(() => of(new ProjectTaskActions.Delete.AllRejected())));
            })));

    public deleteAllSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.DeleteAllFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Delete_SuccessMessage')}))));

    /**
     * @description Request task fulfilled interceptor to requests tasks news
     * @type {Observable<Action>}
     */
    public requestTasksNews$ = createEffect(() =>
        this._actions$.pipe(
            ofType(TaskActionEnum.RequestAllFulfilled, TaskActionEnum.RequestAllCalendarFulfilled),
            filter((action: ProjectTaskActions.Request.AllFulfilled | ProjectTaskActions.Request.AllCalendarFulfilled) =>
                action.payload.tasks.length),
            switchMap((action: ProjectTaskActions.Request.AllFulfilled | ProjectTaskActions.Request.AllCalendarFulfilled) => {
                const identifiers: ObjectIdentifierPair[] = action.payload.tasks
                    .map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id));

                return of(new NewsActions.Request.AllNews(identifiers));
            })
        ));

    /**
     * @description Move task interceptor
     * @type {Observable<Action>}
     */
    public moveTask$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.MoveOne),
            mergeMap((action: ProjectTaskActions.Move.One) => this._withTask(action)),
            switchMap(([action, currentTask]) => {
                const saveTaskResource = this._getSaveTaskResourceForMove(action.payload, SaveTaskResource.fromTask(currentTask));
                const taskUpdate = this._observeTaskUpdateOnMove(currentTask, saveTaskResource);
                const scheduleUpdate = this._observeScheduleUpdateOnMove(currentTask, saveTaskResource);

                return zip(taskUpdate, scheduleUpdate).pipe(
                    switchMap(([task, schedule]) => {
                        const bothRequestsFailed = !schedule && !task;
                        const bothRequestsWorked = task !== false && schedule !== false;

                        const actions: Action[] = [];

                        if (bothRequestsFailed) {
                            actions.push(new ProjectTaskActions.Move.OneRejected(currentTask.id));
                        } else {
                            const payloadFulfilled: CreateOrUpdateTaskFulfilledPayload = {
                                taskId: currentTask.id,
                                schedule: schedule ? schedule as TaskScheduleResource : null,
                                task: task ? task as TaskResource : null,
                            };

                            actions.push(new ProjectTaskActions.Move.OneFulfilled(payloadFulfilled));

                            if (bothRequestsWorked) {
                                actions.push(new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}));
                            } else {
                                actions.push(new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Task_CreateOrUpdate_PartialSuccessMessage')}));
                            }
                        }

                        return actions;
                    })
                );
            })
        ));

    /**
     * @description Move all tasks interceptor
     * @type {Observable<Action>}
     */
    public moveAllTasks$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.MoveAll),
            mergeMap((action: ProjectTaskActions.Move.All) => this._withTasks(action)),
            map(([action, tasks]) => [action, ...this._combineTasksAndSchedulesToMove(tasks, action.payload)]),
            switchMap(([action, tasksToMove, taskSchedulesToMove]: [ProjectTaskActions.Move.All, SaveTaskListItemResource[], SaveTaskScheduleListItemResource[]]) => {
                const taskIds = action.payload.map(payload => payload.taskId);
                const tasksUpdate = this._observeTasksUpdateOnMove(tasksToMove);
                const schedulesUpdate = this._observeSchedulesUpdateOnMove(taskSchedulesToMove);

                return zip(tasksUpdate, schedulesUpdate).pipe(
                    switchMap(([taskResources, scheduleResources]) => {
                        const bothRequestsFailed = !scheduleResources && !taskResources;
                        const bothRequestsWorked = taskResources !== false && scheduleResources !== false;
                        const actions: Action[] = [];

                        if (bothRequestsFailed) {
                            actions.push(new ProjectTaskActions.Move.AllRejected(taskIds));
                        } else {
                            taskResources = taskResources as TaskResource[] || [];
                            scheduleResources = scheduleResources as TaskScheduleResource[] || [];

                            const payloadFulfilled = this._buildCreateOrUpdateTaskFulfilledPayload(taskIds, taskResources, scheduleResources);

                            actions.push(new ProjectTaskActions.Move.AllFulfilled(payloadFulfilled));

                            if (bothRequestsWorked) {
                                actions.push(new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Tasks_Update_SuccessMessage')}));
                            } else {
                                actions.push(new AlertActions.Add.WarningAlert({message: new AlertMessageResource('Tasks_CreateOrUpdate_PartialSuccessMessage')}));
                            }
                        }

                        return actions;
                    })
                );
            })
        ));

    /**
     * @description Resize task interceptor
     * @type {Observable<Action>}
     */
    public resizeTask$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.ResizeOne),
            mergeMap((action: ProjectTaskActions.Resize.One) => this._withSchedule(action)),
            switchMap(([action, schedule]) => {
                const {taskId, start, end} = action.payload;
                const saveTaskScheduleResource = SaveTaskScheduleResource.fromTimeScopeAndTaskSchedule({
                    start,
                    end,
                }, schedule);
                const version = schedule.version;

                return this._taskScheduleService.update(taskId, saveTaskScheduleResource, version)
                    .pipe(
                        mergeMap(taskSchedule =>
                            [
                                new ProjectTaskActions.Resize.OneFulfilled(taskSchedule),
                                new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Task_Update_SuccessMessage')}),
                            ]),
                        catchError(() => of(new ProjectTaskActions.Resize.OneRejected(taskId)))
                    );
            })
        ));

    /**
     * @description Request all tasks by ids interceptor
     * @type {Observable<Action>}
     */
    public requestTasksByIds$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAllByIds),
            withLatestFrom(
                this._projectSliceService.observeCurrentProjectId(),
            ),
            mergeMap(([action, projectId]: [ProjectTaskActions.Request.AllByIds, string]) => {
                const requests = chunk(action.ids, 100)
                    .map(ids => this._taskService.findAllByIds(projectId, ids));

                return zip(...requests)
                    .pipe(
                        map((taskList: TaskResource[][]) => flatten(taskList)),
                        map((taskList: TaskResource[]) => new ProjectTaskActions.Request.AllByIdsFulfilled(taskList)),
                        catchError(() => of(new ProjectTaskActions.Request.AllByIdsRejected())));
            })));

    /**
     * @description Dispatch CalendarSort action when sortingMode change
     * @type {Observable<Action>}
     */
    public setCalendarSort$ = createEffect(() => this._calendarQueries.observeCalendarUserSettings()
        .pipe(
            map(userSettings => userSettings.sortingMode),
            distinctUntilChanged(),
            map(sortingMode => new SorterData<TasksSortField>(this._sortFieldMap[sortingMode])),
            switchMap(sorterData => of(new ProjectTaskActions.Set.CalendarSort(sorterData))))
    );

    public resetCalendarSelection$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.SetCalendarFilters),
            map(() => new CalendarSelectionActions.Initialize.All()),
        ));

    private _buildCreateOrUpdateTaskFulfilledPayload(taskIds: string[], tasks: TaskResource[], schedules: TaskScheduleResource[]): CreateOrUpdateTaskFulfilledPayload[] {
        const taskResourcesMap = new Map<string, TaskResource>(tasks.map(taskResource => [taskResource.id, taskResource]));
        const taskSchedulesResourcesMap = new Map<string, TaskScheduleResource>(schedules.map(scheduleResource => [scheduleResource.task.id, scheduleResource]));

        return taskIds.map(taskId => ({
            taskId,
            schedule: taskSchedulesResourcesMap.get(taskId) || null,
            task: taskResourcesMap.get(taskId) || null,
        }));
    }

    private _combineTasksAndSchedulesToCreate(tasks: SaveTaskResource[]): [CreateTaskListItemResource[], CreateTaskScheduleListItemResource[]] {
        const taskToCreate: CreateTaskListItemResource[] = [];
        const taskSchedulesToCreate: CreateTaskScheduleListItemResource[] = [];

        tasks.forEach(task => {
            const id = UUID.v4();
            const {start, end} = task;
            const hasSchedule = start || end;

            taskToCreate.push(this._parseTask({...task, id}));

            if (hasSchedule) {
                taskSchedulesToCreate.push(new CreateTaskScheduleListItemResource(id, start, end));
            }
        });

        return [taskToCreate, taskSchedulesToCreate];
    }

    private _combineTasksAndSchedulesToMove(tasks: Task[], moveTaskPayload: MoveTaskPayload[]): [SaveTaskListItemResource[], SaveTaskScheduleListItemResource[]] {
        const tasksToUpdate: SaveTaskListItemResource[] = [];
        const taskSchedulesToUpdate: SaveTaskScheduleListItemResource[] = [];

        tasks.forEach((task, index) => {
            const saveTaskListItemResource = this._getSaveTaskResourceForMove(moveTaskPayload[index], SaveTaskListItemResource.fromTask(task));
            const needToUpdateTask = this._needToUpdateTask(task, saveTaskListItemResource);
            const {start, slots, version} = task.schedule;
            const shift = this._getDifferenceInDays(new Date(start), new Date(saveTaskListItemResource.start));

            if (needToUpdateTask) {
                const parsedTask = this._parseTask(saveTaskListItemResource);

                tasksToUpdate.push(parsedTask);
            }

            if (shift !== 0) {
                const updatedSlots = this._getUpdatedSlots(slots, shift);
                const schedule = new SaveTaskScheduleListItemResource(task.id, version, saveTaskListItemResource.start, saveTaskListItemResource.end, updatedSlots);

                taskSchedulesToUpdate.push(schedule);
            }

        });

        return [tasksToUpdate, taskSchedulesToUpdate];
    }

    private _observeTasksCreate(tasks: CreateTaskListItemResource[]): Observable<TaskResource[] | boolean> {
        return tasks.length ?
            this._taskService.createAll(tasks).pipe(catchError(() => [false]))
            : of(null);
    }

    private _observeTaskUpdateOnMove(currentTask: Task, saveTaskResource: SaveTaskResource): Observable<TaskResource | boolean> {
        const needToUpdateTask = this._needToUpdateTask(currentTask, saveTaskResource);

        return !needToUpdateTask ? of(null) : this._taskService.update(currentTask.id, this._parseTask(saveTaskResource), currentTask.version).pipe(
            catchError(() => [false])
        );
    }

    private _observeTasksUpdateOnMove(tasks: SaveTaskListItemResource[]): Observable<TaskResource[] | boolean> {
        return tasks.length ?
            this._taskService.updateAll(tasks).pipe(catchError(() => [false]))
            : of(null);
    }

    private _observeSchedulesCreate(taskSchedules: CreateTaskScheduleListItemResource[]): Observable<TaskScheduleResource[] | boolean> {
        return taskSchedules.length ?
            this._taskScheduleService.createAll(taskSchedules).pipe(catchError(() => [false]))
            : of(null);
    }

    private _observeScheduleUpdateOnMove(currentTask: Task, saveTaskResource: SaveTaskResource): Observable<TaskScheduleResource | boolean> {
        const {start, slots, version} = currentTask.schedule;
        const shift = this._getDifferenceInDays(new Date(start), new Date(saveTaskResource.start));

        if (shift === 0) {
            return of(null);
        }

        const updatedSlots = this._getUpdatedSlots(slots, shift);
        const schedule = new SaveTaskScheduleResource(saveTaskResource.start, saveTaskResource.end, updatedSlots);
        return this._taskScheduleService.update(currentTask.id, schedule, version).pipe(
            catchError(() => [false])
        );
    }

    private _observeSchedulesUpdateOnMove(taskSchedules: SaveTaskScheduleListItemResource[]): Observable<TaskScheduleResource[] | boolean> {
        return taskSchedules.length ?
            this._taskScheduleService.updateAll(taskSchedules).pipe(catchError(() => [false]))
            : of(null);
    }

    private _needToUpdateTask(currentTask: Task, saveTaskResource: SaveTaskResource): boolean {
        const currentWorkAreaId = currentTask?.workArea?.id || null;

        return saveTaskResource.workAreaId !== currentWorkAreaId;
    }

    private _parseTask<A extends SaveTaskResource>(task: A): A {
        let parsedTask: A;
        const {description, location, workAreaId, assigneeId} = task;
        const parsedData: Object = {
            description: description === '' ? null : description,
            location: location === '' ? null : location,
            assigneeId: typeof assigneeId === 'undefined' ? null : assigneeId,
            workAreaId: workAreaId === null ? null : workAreaId,
        };

        parsedTask = Object.assign({}, task, parsedData);
        parsedTask = omit(parsedTask, 'files') as A;

        return parsedTask;
    }

    private _getAttachmentsSource(taskId: string, files: File[]): Observable<AttachmentResource[]> {
        return zip(...files.map((file: File) => this._taskAttachmentService.upload(taskId, file)));
    }

    private _getCreateScheduleSource(taskId: string, schedule: SaveTaskScheduleResource): Observable<TaskScheduleResource> {
        return this._taskScheduleService.create(taskId, schedule);
    }

    private _getSaveTaskResourceForMove<A extends SaveTaskResource>(moveTaskPayload: MoveTaskPayload, saveTaskResource: A): A {
        const {workAreaId, start, end} = moveTaskPayload;

        saveTaskResource.workAreaId = workAreaId;
        saveTaskResource.start = start.format(API_DATE_YEAR_MONTH_DAY_FORMAT);
        saveTaskResource.end = end.format(API_DATE_YEAR_MONTH_DAY_FORMAT);

        return saveTaskResource;
    }

    private _getUpdateScheduleSource(currentTask: Task,
                                     saveTask: SaveTaskResource,
                                     taskScheduleVersion: number): Observable<TaskScheduleResource> | Observable<void> {
        const {start: finalStart, end: finalEnd} = saveTask;
        const {id, schedule: taskSchedule} = currentTask;
        const hasSchedule = !!taskSchedule;
        let version = 0;
        let slots: SaveTaskScheduleSlotResource[] = [];
        let source: Observable<TaskScheduleResource> | Observable<void>;

        if (hasSchedule) {
            const {start: currentStart, end: currentEnd, slots: currentSlots} = taskSchedule;
            slots = this._getUpdatedSlots(currentSlots, this._getShiftAmount(new Date(currentStart), new Date(currentEnd), new Date(finalStart), new Date(finalEnd)));
            version = taskScheduleVersion;
        }

        const schedule: SaveTaskScheduleResource = new SaveTaskScheduleResource(finalStart, finalEnd, slots);

        if (this._shouldDeleteSchedule(hasSchedule, saveTask)) {
            source = this._taskScheduleService.deleteById(id, version);
        } else if (this._shouldCreateSchedule(hasSchedule, saveTask)) {
            source = this._taskScheduleService.create(id, schedule);
        } else if (this._shouldUpdateSchedule(hasSchedule, saveTask)) {
            source = this._taskScheduleService.update(id, schedule, version);
        }

        return source;
    }

    private _getShiftAmount(currentStart: Date, currentEnd: Date, finalStart: Date, finalEnd: Date): number {
        const currentDuration: number = this._getDifferenceInDays(currentStart, currentEnd);
        const finalDuration: number = this._getDifferenceInDays(finalStart, finalEnd);
        const shiftAmount: number = this._getDifferenceInDays(currentStart, finalStart);

        return this._isShift(currentDuration, finalDuration) ? shiftAmount : 0;
    }

    private _getDifferenceInDays(start: Date, end: Date): number {
        const startDay = moment(start).startOf('d');
        const endDay = moment(end).startOf('d');
        return endDay.diff(startDay, 'd');
    }

    private _isShift(currentDuration: number, finalDuration: number): boolean {
        return currentDuration === finalDuration;
    }

    private _shouldDeleteSchedule(hasSchedule: boolean, saveTask: SaveTaskResource): boolean {
        const {start, end} = saveTask;
        return hasSchedule && !start && !end;
    }

    private _shouldCreateSchedule(hasSchedule: boolean, saveTask: SaveTaskResource): boolean {
        const {start, end} = saveTask;
        return !hasSchedule && !!(start || end);
    }

    private _shouldUpdateSchedule(hasSchedule: boolean, saveTask: SaveTaskResource): boolean {
        const {start, end} = saveTask;
        return hasSchedule && !!(start || end);
    }

    private _getUpdatedSlots(slots: TaskScheduleSlotResource[], shiftAmount = 0): SaveTaskScheduleSlotResource[] {
        return slots.map((slot: TaskScheduleSlotResource) => {
            const {dayCard, date} = slot;
            return new SaveTaskScheduleSlotResource(dayCard.id, moment(date).add(shiftAmount, 'd'));
        });
    }

    private _getObservableOfSuccessAlert(taskNumber: number,
                                         singularKey: string,
                                         pluralKey: string): Observable<AlertActions.Add.SuccessAlert> {
        const messageKey: string = taskNumber > 1 ? pluralKey : singularKey;

        return of(
            new AlertActions.Add.SuccessAlert({
                message: new AlertMessageResource(messageKey, {taskNumber}),
            })
        );
    }

    private _taskUpdateEventsMergeMap(data: RealtimeEventUpdateDataResource): Observable<[RealtimeEventUpdateDataResource, Task]> {
        return combineLatest([
            of(data),
            this._taskQueries.observeTaskById(data.object.id),
        ]).pipe(first());
    }

    private _withTask<A extends ProjectTaskActions.Update.One | ProjectTaskActions.Move.One>(action: A): Observable<[A, Task]> {
        const taskId = action.payload.taskId;

        return combineLatest([
            of(action),
            this._taskQueries.observeTaskById(taskId),
        ]).pipe(first());
    }

    private _withTasks<A extends ProjectTaskActions.Move.All>(action: A): Observable<[A, Task[]]> {
        return combineLatest([
            of(action),
            zip(...action.payload.map((moveTaskPayload) =>
                this._taskQueries.observeTaskById(moveTaskPayload.taskId)
            )),
        ]).pipe(first());
    }

    private _withSchedule<A extends ProjectTaskActions.Resize.One>(action: A): Observable<[A, TaskSchedule]> {
        const taskId = action.payload.taskId;

        return combineLatest([
            of(action),
            this._taskScheduleQueries.observeTaskScheduleByTaskId(taskId),
        ]).pipe(first());
    }
}
