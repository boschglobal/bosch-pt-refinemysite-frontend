/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate
} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../app.reducers';
import {ObjectIdentifierPair} from '../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../shared/misc/enums/object-type.enum';
import {RealtimeActions} from '../../../shared/realtime/store/realtime.actions';
import {DateParserStrategy} from '../../../shared/ui/dates/date-parser.strategy';
import {TasksCalendarUrlQueryParamsEnum} from '../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {CalendarScopeActions} from '../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {TASKS_CALENDAR_DEFAULT_MODE} from '../../project-common/store/calendar/calendar-scope/calendar-scope.effects';
import {CalendarScopeQueries} from '../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {ROUTE_PARAM_PROJECT_ID} from '../project-route.paths';

@Injectable({
    providedIn: 'root',
})
export class CanSeeProjectCalendarGuard implements CanActivate {

    constructor(private _calendarScopeQueries: CalendarScopeQueries,
                private _dateParser: DateParserStrategy,
                private _store: Store<State>) {
    }

    public canActivate(activatedRouteSnapshot: ActivatedRouteSnapshot): boolean {
        const routeQueryParamKeys = activatedRouteSnapshot.queryParamMap.keys;
        const projectId: string = activatedRouteSnapshot.parent.paramMap.get(ROUTE_PARAM_PROJECT_ID);
        const projectObjectIdentifierPair: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Project, projectId);
        const defaultQueryParams: string[] = [TasksCalendarUrlQueryParamsEnum.Start, TasksCalendarUrlQueryParamsEnum.Mode];
        const hasNoDefaultQueryParams = defaultQueryParams.some(key => !routeQueryParamKeys.includes(key));
        const hasNoFocus = !routeQueryParamKeys.includes(TasksCalendarUrlQueryParamsEnum.Focus);
        const setCalendarScopeParameters = hasNoFocus && hasNoDefaultQueryParams;

        this._store.dispatch(new RealtimeActions.Set.Context(projectObjectIdentifierPair));

        if (setCalendarScopeParameters) {
            const {start: storeStart, mode: storeMode} = this._calendarScopeQueries.getCalendarScopeParameters();
            const start = this._dateParser.startOfWeek(storeStart);
            const mode = storeMode || TASKS_CALENDAR_DEFAULT_MODE;

            this._store.dispatch(new CalendarScopeActions.Set.ScopeParameters({start, mode}));
        }

        return true;
    }
}
