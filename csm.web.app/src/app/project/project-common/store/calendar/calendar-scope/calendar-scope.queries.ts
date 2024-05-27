/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store,
} from '@ngrx/store';
import * as moment from 'moment/moment';
import {
    combineLatest,
    Observable,
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    switchMap,
    take,
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../../shared/misc/api/datatypes/time-scope.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {TasksCalendarModeEnum} from '../../../enums/tasks-calendar-mode.enum';
import {MilestoneQueries} from '../../milestones/milestone.queries';
import {MilestoneFilters} from '../../milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../tasks/slice/project-task-filters';
import {ProjectTaskQueries} from '../../tasks/task-queries';
import {CalendarScopeParameters} from '../slice/calendar.scope-parameters';
import {CalendarScopeSlice} from './calendar-scope.slice';

@Injectable({
    providedIn: 'root',
})
export class CalendarScopeQueries {

    public moduleName = 'calendarModule';

    public sliceName = 'calendarScopeSlice';

    constructor(private _calendarScopeHelper: CalendarScopeHelper,
                private _milestoneQueries: MilestoneQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    public observeExpandedWeeks(): Observable<moment.Moment[]> {
        return this._store
            .pipe(
                select(this._getExpandedWeeks()),
                distinctUntilChanged());
    }

    public observeFocus(): Observable<ObjectIdentifierPair> {
        return this._store
            .pipe(
                select(this._getFocus()),
                distinctUntilChanged());
    }

    public observeFocusResolveStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._getFocusResolveStatus()),
                distinctUntilChanged());
    }

    public observeNavigateToElement(): Observable<ObjectIdentifierPair> {
        return this._store
            .pipe(
                select(this._getNavigateToElement()),
                filter(element => !!element),
                distinctUntilChanged());
    }

    public observeCalendarScopeParameters(): Observable<CalendarScopeParameters> {
        return this._store
            .pipe(
                select(this._getScopeParameters()),
                distinctUntilChanged((a, b) =>
                    a?.mode === b?.mode && a?.start && b?.start && a.start.isSame(b.start, 'd')));
    }

    public observeCalendarScopeParametersMode(): Observable<TasksCalendarModeEnum> {
        return this._store
            .pipe(
                switchMap(() => this.observeCalendarScopeParameters()),
                map(({mode}) => mode),
                distinctUntilChanged());
    }

    public observeCalendarScopeParametersStart(): Observable<moment.Moment> {
        return this._store
            .pipe(
                switchMap(() => this.observeCalendarScopeParameters()),
                map(({start}) => start),
                distinctUntilChanged((prev, curr) => prev?.isSame(curr, 'd')));
    }

    public observeCalendarScope(): Observable<TimeScope> {
        return this.observeCalendarScopeParameters()
            .pipe(
                map(scopeParameters => this._calendarScopeHelper.getCalendarScope(scopeParameters))
            );
    }

    public observeMilestoneFiltersWithTruncatedDates(): Observable<MilestoneFilters> {
        return combineLatest([
            this._milestoneQueries.observeFilters(),
            this.observeCalendarScopeParameters(),
        ]).pipe(
            map(([filters, scopeParameters]) =>
                this._calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(filters, scopeParameters))
        );
    }

    public observeDefaultMilestoneFiltersWithTruncatedDates(): Observable<MilestoneFilters> {
        return this.observeCalendarScopeParameters()
            .pipe(
                map(scopeParameters =>
                    this._calendarScopeHelper.getMilestoneFiltersWithCalendarTruncatedDate(new MilestoneFilters(), scopeParameters))
            );
    }

    public observeCalendarTaskFiltersWithTruncatedDates(): Observable<ProjectTaskFilters> {
        return combineLatest([
            this._projectTaskQueries.observeCalendarFilters(),
            this.observeCalendarScopeParameters(),
        ]).pipe(
            map(([filters, scopeParameters]) =>
                this._calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(filters, scopeParameters))
        );
    }

    public observeDefaultCalendarTaskFiltersWithTruncatedDates(): Observable<ProjectTaskFilters> {
        return this.observeCalendarScopeParameters()
            .pipe(
                map(scopeParameters =>
                    this._calendarScopeHelper.getTaskFiltersWithCalendarTruncatedDate(new ProjectTaskFilters(), scopeParameters))
            );
    }

    public getCalendarScopeParameters(): CalendarScopeParameters {
        let scopeParams: CalendarScopeParameters;
        this.observeCalendarScopeParameters()
            .pipe(
                take(1))
            .subscribe(params => scopeParams = params);
        return scopeParams;
    }

    private _getExpandedWeeks(): (state: State) => moment.Moment[] {
        return (state: State) => this._getSlice(state).expandedWeeks;
    }

    private _getFocus(): (state: State) => ObjectIdentifierPair {
        return (state: State) => this._getSlice(state).focus;
    }

    private _getFocusResolveStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).focusResolveStatus;
    }

    private _getNavigateToElement(): (state: State) => ObjectIdentifierPair {
        return (state: State) => this._getSlice(state).navigateToElement;
    }

    private _getScopeParameters(): (state: State) => CalendarScopeParameters {
        return (state: State) => this._getSlice(state).scopeParameters;
    }

    private _getSlice(state: State): CalendarScopeSlice {
        return state.projectModule[this.moduleName][this.sliceName];
    }
}
