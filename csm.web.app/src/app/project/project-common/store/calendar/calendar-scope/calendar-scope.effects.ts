/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRoute,
    ParamMap,
    Router,
} from '@angular/router';
import {
    Actions,
    createEffect,
    ofType,
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {uniqBy} from 'lodash';
import * as moment from 'moment';
import {Observable} from 'rxjs';
import {
    catchError,
    filter,
    map,
    switchMap,
    take,
    withLatestFrom,
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {MOMENT_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/ui/dates/date.helper.service';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {PROJECT_ROUTE_PATHS} from '../../../../project-routing/project-route.paths';
import {DayCardService} from '../../../api/day-cards/day-card.service';
import {MilestoneService} from '../../../api/milestones/milestone.service';
import {TaskScheduleService} from '../../../api/task-schedueles/task-schedule.service';
import {
    TasksCalendarModeEnum,
    TasksCalendarModeEnumHelper,
} from '../../../enums/tasks-calendar-mode.enum';
import {
    TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR,
    TasksCalendarUrlQueryParamsEnum,
} from '../../../helpers/tasks-calendar-url-query-params.helper';
import {TasksCalendarFocusParams} from '../../../models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {DayCardActions} from '../../day-cards/day-card.actions';
import {MilestoneActions} from '../../milestones/milestone.actions';
import {MilestoneQueries} from '../../milestones/milestone.queries';
import {TaskScheduleQueries} from '../../task-schedules/task-schedule.queries';
import {
    ProjectTaskActions,
    TaskActionEnum,
} from '../../tasks/task.actions';
import {
    CalendarScopeActionEnum,
    CalendarScopeActions,
} from './calendar-scope.actions';
import {CalendarScopeQueries} from './calendar-scope.queries';

export const TASKS_CALENDAR_DEFAULT_MODE = TasksCalendarModeEnum.SixWeeks;

@Injectable()
export class CalendarScopeEffects {

    private _nonExistingFocusDefaultActions: Action[] = [
        new CalendarScopeActions.Set.Start(this._dateParser.startOfWeek()),
        new CalendarScopeActions.Set.Mode(TASKS_CALENDAR_DEFAULT_MODE),
        new CalendarScopeActions.Resolve.FocusFulfilled(null),
    ];

    private _focusResolversMap: { [key in ObjectTypeEnum]?: (o: ObjectIdentifierPair) => Observable<Action> } = {
        [ObjectTypeEnum.Task]: object => this._resolveFocusForTask(object),
        [ObjectTypeEnum.DayCard]: object => this._resolveFocusForDaycard(object),
        [ObjectTypeEnum.Milestone]: object => this._resolveFocusForMilestone(object),
    };

    private _navigateToElementResolversMap: { [key in ObjectTypeEnum]?: (o: ObjectIdentifierPair) => Observable<Action> } = {
        [ObjectTypeEnum.Task]: object => this._resolveNavigateToElementForTask(object),
        [ObjectTypeEnum.Milestone]: object => this._resolveNavigateToElementForMilestone(object),
    };

    private _tasksCalendarQueryParams$: Observable<ParamMap> = this._activatedRoute.queryParamMap
        .pipe(
            filter(() => this._router.url.search(PROJECT_ROUTE_PATHS.calendar) !== -1));

    constructor(private _actions$: Actions,
                private _activatedRoute: ActivatedRoute,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _dateParser: DateParserStrategy,
                private _daycardService: DayCardService,
                private _milestoneQueries: MilestoneQueries,
                private _milestoneService: MilestoneService,
                private _router: Router,
                private _taskScheduleQueries: TaskScheduleQueries,
                private _taskScheduleService: TaskScheduleService) {
    }

    public queryParamsStartChange$: Observable<Action> = createEffect(() =>
        this._observeTasksCalendarQueryParamsAllChangesWithoutFocus(TasksCalendarUrlQueryParamsEnum.Start)
            .pipe(
                withLatestFrom(this._calendarScopeQueries.observeCalendarScopeParameters()),
                map(([urlStart, calendarScopeParams]) => [
                    this._dateParser.startOfWeek(moment(urlStart, MOMENT_YEAR_MONTH_DAY_FORMAT)),
                    calendarScopeParams.start,
                ]),
                filter(([urlStart, storeStart]) => urlStart.isValid() && !urlStart.isSame(storeStart, 'd')),
                map(([urlStart]) => new CalendarScopeActions.Set.Start(urlStart))));

    public queryParamsModeChange$: Observable<Action> = createEffect(() =>
        this._observeTasksCalendarQueryParamsAllChangesWithoutFocus(TasksCalendarUrlQueryParamsEnum.Mode)
            .pipe(
                filter(mode => TasksCalendarModeEnumHelper.getValues().includes(mode)),
                withLatestFrom(this._calendarScopeQueries.observeCalendarScopeParameters()),
                map(([urlMode, calendarScopeParams]) => [
                    urlMode,
                    calendarScopeParams.mode,
                ]),
                filter(([urlMode, storeMode]) => urlMode !== storeMode),
                map(([urlMode]) => new CalendarScopeActions.Set.Mode(urlMode as TasksCalendarModeEnum))));

    public queryParamsExpandedWeeksChange$: Observable<Action> = createEffect(() =>
        this._observeTasksCalendarQueryParamsAllChanges(TasksCalendarUrlQueryParamsEnum.Expanded)
            .pipe(
                withLatestFrom(this._calendarScopeQueries.observeExpandedWeeks()),
                map(([urlExpandedWeeks, storeExpandedWeeks]) => [
                    urlExpandedWeeks
                        .split(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR)
                        .map(week => moment(week))
                        .filter(week => week.isValid()),
                    storeExpandedWeeks,
                ]),
                filter(([urlWeeks]) => !!urlWeeks.length),
                filter(([urlWeeks, storeWeeks]) => urlWeeks.length !== storeWeeks.length
                    || urlWeeks.some(urlWeek => !storeWeeks.some(storeWeek => storeWeek.isSame(urlWeek, 'd')))
                    || storeWeeks.some(storeWeek => !urlWeeks.some(urlWeek => urlWeek.isSame(storeWeek, 'd')))),
                map(([urlWeeks]) => new CalendarScopeActions.Set.ExpandedWeeks(urlWeeks))));

    public queryParamsFocusChange$: Observable<Action> = createEffect(() =>
        this._observeTasksCalendarQueryParamsAllChanges(TasksCalendarUrlQueryParamsEnum.Focus)
            .pipe(
                withLatestFrom(
                    this._calendarScopeQueries.observeFocus(),
                    this._tasksCalendarQueryParams$,
                ),
                filter(([focus, storeFocus, currentQueryParams]) => {
                    const queryParamsHasOnlyFocus = currentQueryParams.keys.length === 1;
                    const urlFocusObject = TasksCalendarFocusParams.fromUrl(focus).toObjectIdentifierPair();
                    const focusChange = !storeFocus || !urlFocusObject.isSame(storeFocus);

                    return queryParamsHasOnlyFocus || focusChange;
                }),
                map(([focus]) => focus),
                map(focus => TasksCalendarFocusParams.fromUrl(focus).toObjectIdentifierPair()),
                map(object => new CalendarScopeActions.Resolve.Focus(object))));

    public storeFocusChangeFromUrl$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarScopeActionEnum.ResolveFocus),
            switchMap((action: CalendarScopeActions.Resolve.Focus) =>
                this._focusResolversMap[action.payload.type](action.payload))));

    public resolveNavigateToElement$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarScopeActionEnum.ResolveNavigateToElement),
            switchMap((action: CalendarScopeActions.Resolve.NavigateToElement) =>
                this._navigateToElementResolversMap[action.payload.type](action.payload))));

    public triggerNavigateToElement$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(CalendarScopeActionEnum.ResolveFocusFulfilled),
            switchMap((action: CalendarScopeActions.Resolve.FocusFulfilled) => this._actions$
                .pipe(
                    ofType(TaskActionEnum.RequestAllCalendarFulfilled),
                    take(1),
                    map(() => new CalendarScopeActions.Resolve.NavigateToElementFulfilled(action.payload))))));

    private _observeTasksCalendarQueryParamsAllChanges(param: TasksCalendarUrlQueryParamsEnum): Observable<string | null> {
        return this._tasksCalendarQueryParams$
            .pipe(
                filter(params => params.has(param)),
                map(params => params.get(param)));
    }

    private _observeTasksCalendarQueryParamsAllChangesWithoutFocus(param: TasksCalendarUrlQueryParamsEnum): Observable<string | null> {
        return this._tasksCalendarQueryParams$
            .pipe(
                filter(params => params.has(param) && !params.has(TasksCalendarUrlQueryParamsEnum.Focus)),
                map(params => params.get(param)));
    }

    private _resolveNavigateToElementForMilestone(object: ObjectIdentifierPair): Observable<Action> {
        return this._milestoneQueries.observeMilestoneById(object.id)
            .pipe(
                withLatestFrom(this._calendarScopeQueries.observeCalendarScope()),
                switchMap(([milestone, calendarScope]) => {
                    const milestoneWeek = this._dateParser.startOfWeek(milestone.date);
                    const isInScope = milestoneWeek.isBetween(calendarScope.start, calendarScope.end, 'd', '[]');

                    return [
                        isInScope ? null : new CalendarScopeActions.Set.Start(milestoneWeek),
                        new CalendarScopeActions.Resolve.NavigateToElementFulfilled(object),
                    ].filter(item => !!item);
                })
            );
    }

    private _resolveNavigateToElementForTask(object: ObjectIdentifierPair): Observable<Action> {
        return this._taskScheduleQueries.observeTaskScheduleByTaskId(object.id)
            .pipe(
                filter(taskSchedule => !!taskSchedule),
                withLatestFrom(this._calendarScopeQueries.observeCalendarScope()),
                switchMap(([taskSchedule, calendarScope]) => {
                    const actions = [];
                    const currentWeek = this._dateParser.startOfWeek();
                    const taskStart = moment(taskSchedule.start);
                    const taskEnd = moment(taskSchedule.end);
                    const taskScopeOverlapsCurrentWeek = currentWeek.isBetween(taskStart, taskEnd, 'd', '[]');
                    const taskScopeIsWithinCurrentCalendarScope = taskStart.isBetween(calendarScope.start, calendarScope.end, 'd', '[]') ||
                        taskEnd.isBetween(calendarScope.start, calendarScope.end, 'd', '[]');

                    if (!taskScopeIsWithinCurrentCalendarScope && !taskScopeOverlapsCurrentWeek) {
                        actions.push(new CalendarScopeActions.Set.Start(taskStart));
                    } else if (!taskScopeIsWithinCurrentCalendarScope && taskScopeOverlapsCurrentWeek) {
                        actions.push(new CalendarScopeActions.Set.Start(currentWeek));
                    }

                    actions.push(
                        new CalendarScopeActions.Resolve.NavigateToElementFulfilled(object),
                    );

                    return actions;
                }));
    }

    private _resolveFocusForTask(object: ObjectIdentifierPair): Observable<Action> {
        return this._taskScheduleService.findOneByTaskId(object.id)
            .pipe(
                withLatestFrom(
                    this._calendarScopeQueries.observeCalendarScopeParameters(),
                ),
                switchMap(([taskSchedule, calendarScopeParameters]) => {
                    const currentWeek = this._dateParser.startOfWeek();
                    const taskStart = moment(taskSchedule.start);
                    const taskEnd = moment(taskSchedule.end);
                    const taskScopeOverlapsCurrentWeek = currentWeek.isBetween(taskStart, taskEnd, 'd', '[]');
                    const start = taskScopeOverlapsCurrentWeek ? currentWeek : this._dateParser.startOfWeek(taskStart);
                    const mode = calendarScopeParameters.mode || TasksCalendarModeEnum.SixWeeks;

                    return [
                        new CalendarScopeActions.Initialize.ScopeParameters(),
                        new CalendarScopeActions.Set.Start(start),
                        new CalendarScopeActions.Set.Mode(mode),
                        new CalendarScopeActions.Resolve.FocusFulfilled(object),
                    ];
                }),
                catchError(() => this._nonExistingFocusDefaultActions));
    }

    private _resolveFocusForDaycard(object: ObjectIdentifierPair): Observable<Action> {
        return this._daycardService.findOne(object.id)
            .pipe(
                switchMap(daycard =>
                    this._taskScheduleService.findOneByTaskId(daycard.task.id)
                        .pipe(
                            withLatestFrom(
                                this._calendarScopeQueries.observeCalendarScopeParameters(),
                                this._calendarScopeQueries.observeExpandedWeeks(),
                            ),
                            switchMap(([taskSchedule, calendarScopeParameters, expandedWeeks]) => {
                                const daycardDay = moment(taskSchedule.slots.find(slot => slot.dayCard.id === object.id).date);
                                const nextStart = this._dateParser.startOfWeek(daycardDay);
                                const mode = calendarScopeParameters.mode || TasksCalendarModeEnum.SixWeeks;
                                const parsedExpandedWeeks = uniqBy([...expandedWeeks, nextStart],
                                    week => this._dateParser.startOfWeek(week).format(MOMENT_YEAR_MONTH_DAY_FORMAT));

                                return [
                                    new ProjectTaskActions.Request.OneTaskScheduleByTaskIdFulfilled(taskSchedule),
                                    new DayCardActions.Request.OneFulfilled(daycard),
                                    new CalendarScopeActions.Initialize.ScopeParameters(),
                                    new CalendarScopeActions.Set.Start(nextStart),
                                    new CalendarScopeActions.Set.Mode(mode),
                                    new CalendarScopeActions.Resolve.FocusFulfilled(object),
                                    new CalendarScopeActions.Set.ExpandedWeeks(parsedExpandedWeeks),
                                ];
                            }))),
                catchError(() => this._nonExistingFocusDefaultActions));
    }

    private _resolveFocusForMilestone(object: ObjectIdentifierPair): Observable<Action> {
        return this._milestoneService.findOne(object.id)
            .pipe(
                withLatestFrom(
                    this._calendarScopeQueries.observeCalendarScopeParameters(),
                ),
                switchMap(([milestone, calendarScopeParameters]) => {
                    const milestoneWeek = this._dateParser.startOfWeek(moment(milestone.date));
                    const mode = calendarScopeParameters.mode || TasksCalendarModeEnum.SixWeeks;

                    return [
                        new CalendarScopeActions.Set.Start(milestoneWeek),
                        new CalendarScopeActions.Set.Mode(mode),
                        new MilestoneActions.Request.OneFulfilled(milestone),
                        new CalendarScopeActions.Resolve.FocusFulfilled(object),
                    ];
                }),
                catchError(() => this._nonExistingFocusDefaultActions));
    }
}
