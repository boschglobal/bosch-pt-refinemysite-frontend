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
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {
    combineLatest,
    Observable,
    of
} from 'rxjs';
import {
    distinctUntilChanged,
    first,
    map,
    mergeMap,
    take,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {TaskScheduleLinks} from '../../api/tasks/resources/task-schedule.resource';
import {DayCard} from '../../models/day-cards/day-card';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {TaskScheduleQueries} from '../task-schedules/task-schedule.queries';
import {DayCardSlice} from './day-card.slice';

@Injectable({
    providedIn: 'root',
})
export class DayCardQueries extends BaseQueries<DayCardResource, DayCardSlice, TaskScheduleLinks> {

    public moduleName = 'projectModule';
    public sliceName = 'dayCardSlice';

    private _taskScheduleQueries: TaskScheduleQueries = new TaskScheduleQueries(this._store);

    constructor(private _store: Store<State>) {
        super();
    }

    public observeDayCardById(dayCardId: string): Observable<DayCard> {
        return this._store.pipe(
            select(this.getItemById(dayCardId)),
            mergeMap((dayCard: DayCardResource) => dayCard ? this._combineDayCardWithDate(dayCard) : [[undefined, undefined]]),
            map(([dayCard, date]) => DayCard.fromDayCardResource(dayCard, date)),
            distinctUntilChanged(isEqual)
        );
    }

    public observeDayCardsByTask(taskId: string): Observable<DayCard[]> {
        return combineLatest([
            this._store.pipe(
                select(this._getDayCards()),
                map(daycards => daycards.filter(daycard => daycard.task.id === taskId))
            ),
            this._store.pipe(
                select(this._taskScheduleQueries.getTaskScheduleByTaskId(taskId))
            ),
        ]).pipe(
            map(([daycards, schedule]) => {
                const slots = schedule && schedule.slots ? schedule.slots : [];
                return slots.map(slot => {
                    const card = daycards.find(daycard => daycard.id === slot.dayCard.id);
                    return DayCard.fromDayCardResource(card, slot.date);
                }).filter(daycard => !!daycard);
            }),
            distinctUntilChanged(isEqual)
        );
    }

    public observeAddDayCardPermissionByTask(taskId: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this._taskScheduleQueries.getTaskScheduleByTaskId(taskId)),
                map(schedule => schedule && schedule.permissions.canAdd),
                distinctUntilChanged());
    }

    public observeDayCardRequestStatusByTask(taskId: string): Observable<RequestStatusEnum> {
        return this._taskScheduleQueries.observeTaskScheduleRequestStatusByTask(taskId);
    }

    public observeCurrentDayCardRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    public hasAddPermissionByTask(taskId: string): boolean {
        let hasAdd: boolean;
        this.observeAddDayCardPermissionByTask(taskId)
            .pipe(
                take(1))
            .subscribe(permission => hasAdd = permission)
            .unsubscribe();
        return hasAdd;
    }

    public getDayCardById(id: string): DayCard {
        let daycard: DayCard;
        this.observeDayCardById(id)
            .pipe(
                take(1))
            .subscribe(result => daycard = result);
        return daycard;
    }

    public observeTaskScheduleByTaskId(taskId: string): Observable<TaskSchedule> {
        return this._taskScheduleQueries.observeTaskScheduleByTaskId(taskId);
    }

    public dayCardExists(dayCardId: string): boolean {
        let dayCardExists: boolean;
        this.observeDayCardById(dayCardId)
            .pipe(
                take(1))
            .subscribe(dayCard => dayCardExists = !!dayCard)
            .unsubscribe();
        return dayCardExists;
    }

    /**
     * @description Retrieves query function to get all daycards
     * @returns {(state: State) => DayCardResource[]}
     */
    private _getDayCards(): (state: State) => DayCardResource[] {
        return (state: State) => this._getSlice(state).items;
    }

    private _combineDayCardWithDate(dayCard: DayCardResource) {
        return combineLatest([
            of(dayCard),
            this._store.pipe(
                select(this._taskScheduleQueries.getDateForDaycard(dayCard.id, dayCard.task.id))
            ),
        ]).pipe(first());
    }
}
