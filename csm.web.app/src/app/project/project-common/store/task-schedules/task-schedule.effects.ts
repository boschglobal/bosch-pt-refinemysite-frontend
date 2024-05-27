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
    Store
} from '@ngrx/store';
import {
    chunk,
    flatten,
} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    merge,
    Observable,
    of,
    zip,
} from 'rxjs';
import {
    buffer,
    debounceTime,
    filter,
    first,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {TaskScheduleResource} from '../../api/tasks/resources/task-schedule.resource';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {CalendarScopeQueries} from '../calendar/calendar-scope/calendar-scope.queries';
import {DayCardActions} from '../day-cards/day-card.actions';
import {NewsActions} from '../news/news.actions';
import {
    ProjectTaskActions,
    TaskActionEnum
} from '../tasks/task.actions';
import {TaskScheduleQueries} from './task-schedule.queries';

const EMPTY_ACTION = {
    type: 'EMPTY_ACTION',
};

export const TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME = 1000;

@Injectable()
export class TaskScheduleEffects {

    private _taskScheduleQueries = new TaskScheduleQueries(this._store);

    private _updateEventsForCurrentContext$: Observable<RealtimeEventUpdateDataResource> = this._realtimeService.getUpdateEvents()
        .pipe(
            withLatestFrom(this._realtimeQueries.observeContext()),
            filter(([data, context]) => context && data.root.isSame(context)),
            map(([data]) => data),
        );

    private _storedTaskScheduleUpdateEvents$: Observable<TaskSchedule> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.TaskSchedule),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Updated),
            mergeMap((data: RealtimeEventUpdateDataResource) =>
                combineLatest([
                    of(data),
                    this._taskScheduleQueries.observeTaskScheduleById(data.object.id),
                ]).pipe(first())
            ),
            filter(([data, taskSchedule]) => taskSchedule && data.object.version > taskSchedule.version),
            map(([, taskSchedule]) => taskSchedule),
        );

    private _storedInScopeTaskScheduleUpdateEvents$: Observable<TaskSchedule> = this._storedTaskScheduleUpdateEvents$.pipe(
        withLatestFrom(this._calendarScopeQueries.observeCalendarScope()),
        filter(([taskSchedule, timeScope]) => this._isScheduleInScope(taskSchedule, timeScope)),
        map(([taskSchedule]) => taskSchedule),
    );

    private _storedNotInScopeTaskScheduleUpdateEvents$: Observable<string> = this._storedTaskScheduleUpdateEvents$.pipe(
        withLatestFrom(this._calendarScopeQueries.observeCalendarScope()),
        filter(([taskSchedule, timeScope]) => !this._isScheduleInScope(taskSchedule, timeScope)),
        map(([taskSchedule]) => taskSchedule.id),
    );

    private _notStoredTaskScheduleUpdateEvents$: Observable<string> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.TaskSchedule),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Updated),
            filter((data: RealtimeEventUpdateDataResource) => !this._taskScheduleQueries.hasTaskScheduleById(data.object.id)),
            map((data: RealtimeEventUpdateDataResource) => data.object.id),
        );

    private _unknownTaskScheduleUpdateEvents$: Observable<string> = merge(
        this._notStoredTaskScheduleUpdateEvents$,
        this._storedNotInScopeTaskScheduleUpdateEvents$,
    );

    constructor(private _actions$: Actions,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _realtimeQueries: RealtimeQueries,
                private _realtimeService: RealtimeService,
                private _store: Store<State>,
                private _taskScheduleService: TaskScheduleService) {
    }

    /**
     * @description Request the schedule when a realtime event is received for an outdated schedule that is in the calendar scope
     * @type {Observable<Action>}
     */
    public dayCardsListUpdateEvents$: Observable<Action> = createEffect(() => this._storedInScopeTaskScheduleUpdateEvents$
        .pipe(
            buffer(this._storedInScopeTaskScheduleUpdateEvents$.pipe(debounceTime(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map(schedules => schedules.map(schedule => schedule.task.id)),
            switchMap((taskIds: string[]) => of(new DayCardActions.Request.AllFromTasks(taskIds))),
        ));

    /**
     * @description Request the news when a realtime event is received for an outdated schedule that is in the calendar scope
     * @type {Observable<Action>}
     */
    public newsUpdateEvents$: Observable<Action> = createEffect(() => this._storedInScopeTaskScheduleUpdateEvents$
        .pipe(
            buffer(this._storedInScopeTaskScheduleUpdateEvents$.pipe(debounceTime(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map(schedules => schedules.map(schedule => schedule.task.id)),
            switchMap((taskIds: string[]) => {
                const objectIdentifierPair: ObjectIdentifierPair[] = taskIds.map(
                    taskId => new ObjectIdentifierPair(ObjectTypeEnum.Task, taskId)
                );
                return of(new NewsActions.Request.AllNews(objectIdentifierPair));
            }),
        ));

    /**
     * @description Request the schedule and trigger a request for calendar data when realtime service event emits with a schedule
     * update that does not exist in the current store
     * @type {Observable<Action>}
     */
    public taskScheduleUpdateEventsForNonExistingStoreSchedules$: Observable<Action> = createEffect(() =>
        this._unknownTaskScheduleUpdateEvents$
            .pipe(
                buffer(this._unknownTaskScheduleUpdateEvents$.pipe(debounceTime(TASK_SCHEDULE_UPDATE_EVENTS_DEBOUNCE_TIME))),
                mergeMap((taskScheduleIds: string[]) => {
                    const requests = chunk(taskScheduleIds, 500)
                        .map((ids: string[]) => this._taskScheduleService.findAllByIds(ids));

                    return combineLatest([
                        zip(...requests),
                        this._calendarScopeQueries.observeCalendarScope(),
                    ]).pipe(first());
                }),
                map(([taskSchedules, calendarScope]) => [flatten(taskSchedules), calendarScope]),
                filter(([taskSchedules, timeScope]: [TaskScheduleResource[], TimeScope]) =>
                    taskSchedules.some(taskSchedule => this._isScheduleInScope(taskSchedule, timeScope))),
                map(() => new ProjectTaskActions.Request.AllCalendar())));

    /**
     * @description Request calendar tasks interceptor to requests tasks
     * @type {Observable<Action>}
     */
    public requestCalendarTasks$ = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestAllCalendarFulfilled),
            map((action: ProjectTaskActions.Request.AllCalendarFulfilled) => {
                const tasks = action.payload.tasks;
                return tasks.length > 0 ? new DayCardActions.Request.AllFromTasks(tasks.map(task => task.id)) : EMPTY_ACTION;
            })
        ));

    /**
     * @description Request task by id fulfilled interceptor to request task schedule
     * @type {Observable<Action>}
     */
    public requestScheduleByTaskFulfilled$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(TaskActionEnum.RequestOneFulfilled),
            switchMap((action: ProjectTaskActions.Request.OneFulfilled) =>
                action.payload._embedded.schedule ?
                    of(new DayCardActions.Request.AllByTask(action.payload.id)) :
                    of({type: 'NO_ACTION'}))));

    private _isScheduleInScope({start, end}: TaskScheduleResource | TaskSchedule, {start: scopeStart, end: scopeEnd}: TimeScope): boolean {
        return moment(start, API_DATE_YEAR_MONTH_DAY_FORMAT).isBetween(scopeStart, scopeEnd, 'd', '[]')
            || moment(end, API_DATE_YEAR_MONTH_DAY_FORMAT).isBetween(scopeStart, scopeEnd, 'd', '[]');
    }
}
