/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Injectable,
    OnDestroy
} from '@angular/core';
import {
    ActivatedRoute,
    ActivationStart,
    GuardsCheckStart,
    Params,
    Router,
} from '@angular/router';
import * as moment from 'moment/moment';
import {
    Observable,
    Subject,
    Subscription
} from 'rxjs';
import {fromPromise} from 'rxjs/internal-compatibility';
import {
    buffer,
    concatMap,
    debounceTime,
    filter,
    map,
    startWith,
    take,
    withLatestFrom,
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {MOMENT_YEAR_MONTH_DAY_FORMAT} from '../../../shared/ui/dates/date.helper.service';
import {TasksCalendarFocusParams} from '../models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {CalendarScopeQueries} from '../store/calendar/calendar-scope/calendar-scope.queries';
import {DayCardQueries} from '../store/day-cards/day-card.queries';

export const TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR = ',';
export const TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME = 50;

@Injectable()
export class TasksCalendarUrlQueryParamsHelper implements OnDestroy {

    private _disposableSubscriptions: Subscription = new Subscription();

    private _ignoreNavigationEvents = [ActivationStart, GuardsCheckStart];

    private _storeQueryParamsChange$: Subject<TasksCalendarUrlQueryParams> = new Subject<TasksCalendarUrlQueryParams>();

    constructor(private _activatedRoute: ActivatedRoute,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _daycardQueries: DayCardQueries,
                private _router: Router) {
        this._setSubscriptions();
    }

    public ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    private _encodeStartUrlQueryParameter(start: moment.Moment): string {
        return start?.format(MOMENT_YEAR_MONTH_DAY_FORMAT);
    }

    private _encodeExpandedWeeksUrlQueryParameter(expandedWeeks: moment.Moment[]): string {
        return expandedWeeks && expandedWeeks.length > 0
            ? expandedWeeks.map(w => w.format(MOMENT_YEAR_MONTH_DAY_FORMAT))
                .join(TASKS_CALENDAR_URL_QUERY_PARAMS_EXPANDED_WEEKS_SEPARATOR)
            : null;
    }

    private _encodeFocusUrlQueryParameter(object: ObjectIdentifierPair): string | null {
        if (!object) {
            return null;
        }
        switch (object?.type) {
            case ObjectTypeEnum.DayCard: {
                let taskId = null;

                this._daycardQueries.observeDayCardById(object.id)
                    .pipe(
                        take(1),
                    ).subscribe(daycard => taskId = daycard.task.id);

                return new TasksCalendarFocusParams(ObjectTypeEnum.DayCard, [taskId, object.id]).toString();
            }
            case ObjectTypeEnum.Task: {
                return new TasksCalendarFocusParams(ObjectTypeEnum.Task, [object.id]).toString();
            }
            case ObjectTypeEnum.Milestone: {
                return new TasksCalendarFocusParams(ObjectTypeEnum.Milestone, [object.id]).toString();
            }
            default:
                return null;
        }
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._storeQueryParamsChange$
                .pipe(
                    buffer(
                        this._storeQueryParamsChange$.pipe(debounceTime(TASKS_CALENDAR_URL_QUERY_PARAMS_UPDATE_DEBOUNCE_TIME)),
                    ),
                    withLatestFrom(this._router.events
                        .pipe(startWith(null))),
                    filter(([, event]) => !this._ignoreNavigationEvents.some(ignoreEvent => event instanceof ignoreEvent)),
                    map(([queryParams]) => queryParams
                        .reduce((acc: TasksCalendarUrlQueryParams, curr: TasksCalendarUrlQueryParams) => ({...acc, ...curr}), {})),
                    concatMap(queryParams => this._navigateWithQueryParams(queryParams)))
                .subscribe());

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeExpandedWeeks()
                .subscribe(expandedWeeks => this._storeQueryParamsChange$.next({
                    [TasksCalendarUrlQueryParamsEnum.Expanded]: this._encodeExpandedWeeksUrlQueryParameter(expandedWeeks),
                })));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeFocus()
                .subscribe(focus => this._storeQueryParamsChange$.next({
                    [TasksCalendarUrlQueryParamsEnum.Focus]: this._encodeFocusUrlQueryParameter(focus),
                })));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeCalendarScopeParametersMode()
                .subscribe(mode => this._storeQueryParamsChange$.next({
                    [TasksCalendarUrlQueryParamsEnum.Mode]: mode,
                })));

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeCalendarScopeParametersStart()
                .subscribe(start => this._storeQueryParamsChange$.next({
                    [TasksCalendarUrlQueryParamsEnum.Start]: this._encodeStartUrlQueryParameter(start),
                })));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _navigateWithQueryParams(queryParams: Params): Observable<boolean> {
        return fromPromise(this._router.navigate([], {
            queryParams,
            relativeTo: this._activatedRoute,
            queryParamsHandling: 'merge',
            replaceUrl: true,
            skipLocationChange: false,
        }));
    }

}

export type TasksCalendarUrlQueryParams = { [key in TasksCalendarUrlQueryParamsEnum]?: string };

export enum TasksCalendarUrlQueryParamsEnum {
    Expanded = 'expanded',
    Focus = 'focus',
    Mode = 'mode',
    Start = 'start',
}
