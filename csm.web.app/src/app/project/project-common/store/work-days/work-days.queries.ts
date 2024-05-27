/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    filter
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../shared/misc/enums/weekDays.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {WorkDaysSlice} from './work-days.slice';

@Injectable({
    providedIn: 'root',
    })
export class WorkDaysQueries extends BaseQueries<WorkDaysResource, WorkDaysSlice, any> {
    public moduleName = 'projectModule';

    public sliceName = 'workDaysSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeAllowWorkOnNonWorkingDays(): Observable<boolean> {
        return this._store.pipe(
            select(this._getAllowWorkOnNonWorkingDays()),
            distinctUntilChanged());
    }

    public observeHolidays(): Observable<WorkDaysHoliday[]> {
        return this._store.pipe(
            select(this._getHolidays()),
            distinctUntilChanged(isEqual));
    }

    public observeStartOfWeek(): Observable<WeekDaysEnum> {
        return this._store
            .pipe(
                select(this._getStartOfWeek()),
                filter(startOfWeek => !!startOfWeek),
                distinctUntilChanged());
    }

    public observeWorkDays(): Observable<WorkDaysResource> {
        return this._store
            .pipe(
                select(this._getWorkDays()),
                distinctUntilChanged(isEqual));
    }

    public observeWorkingDays(): Observable<WeekDaysEnum[]> {
        return this._store
            .pipe(
                select(this._getWorkingDays()),
                distinctUntilChanged(isEqual));
    }

    public observeWorkDaysRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this._getWorkDaysRequestStatus()),
                distinctUntilChanged());
    }

    private _getAllowWorkOnNonWorkingDays(): (state: State) => boolean {
        return (state: State) => this._getSlice(state).item.allowWorkOnNonWorkingDays;
    }

    private _getHolidays(): (state: State) => WorkDaysHoliday[] {
        return (state: State) => this._getSlice(state).item.holidays;
    }
    private _getStartOfWeek(): (state: State) => WeekDaysEnum {
        return (state: State) => this._getSlice(state).item.startOfWeek;
    }

    private _getWorkDays(): (state: State) => WorkDaysResource {
        return (state: State) => this._getSlice(state).item;
    }

    private _getWorkingDays(): (state: State) => WeekDaysEnum[] {
        return (state: State) => this._getSlice(state).item.workingDays;
    }

    private _getWorkDaysRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State): RequestStatusEnum => this._getSlice(state).requestStatus;
    }
}
