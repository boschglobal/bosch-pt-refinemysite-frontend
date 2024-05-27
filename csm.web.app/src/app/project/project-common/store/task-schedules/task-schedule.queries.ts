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
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    take,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {TaskScheduleLinks} from '../../api/tasks/resources/task-schedule.resource';
import {TaskScheduleEntity} from '../../entities/task-schedule/task-schedule.entity';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {TaskScheduleSlice} from './task-schedule.slice';

@Injectable({
    providedIn: 'root',
})
export class TaskScheduleQueries extends BaseQueries<TaskScheduleEntity, TaskScheduleSlice, TaskScheduleLinks> {

    public moduleName = 'projectModule';
    public sliceName = 'taskScheduleSlice';

    constructor(private _store: Store<State>) {
        super();
    }

    public observeTaskScheduleById(taskScheduleId: string): Observable<TaskSchedule> {
        return this._store
            .pipe(
                select(this.getItemById(taskScheduleId)),
                map(schedule => TaskSchedule.fromTaskScheduleEntity(schedule)),
                distinctUntilChanged(isEqual));
    }

    public observeTaskScheduleByTaskId(taskId: string): Observable<TaskSchedule> {
        return this._store
            .pipe(
                select(this.getTaskScheduleByTaskId(taskId)),
                distinctUntilChanged(isEqual));
    }

    public getTaskScheduleByTaskId(id: string): (state: State) => TaskSchedule {
        return (state: State) => {
            const schedule = state[this.moduleName][this.sliceName].items
                .find((item: any) => item.task.id === id);

            return TaskSchedule.fromTaskScheduleEntity(schedule);
        };
    }

    public observeTaskScheduleRequestStatusByTask(taskId: string): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(taskId)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves query function to get all task schedules
     * @returns {(state: State) => TaskSchedule[]}
     */
    public getTaskSchedules(): (state: State) => TaskSchedule[] {
        return (state: State) =>
            this._getSlice(state).items
                .map(schedule => TaskSchedule.fromTaskScheduleEntity(schedule));
    }

    public getDateForDaycard(dayCardId: string, taskId: string): (state: State) => string {
        return (state: State) => {
            const schedules: TaskScheduleEntity[] = this._getSlice(state).items;
            const taskSchedule = schedules.find(schedule => schedule.task.id === taskId);
            const dayCardSlot = taskSchedule ? taskSchedule.slots.find(slot => slot.dayCard.id === dayCardId) : null;

            return dayCardSlot ? dayCardSlot.date : null;
        };
    }

    public hasTaskScheduleById(id: string): boolean {
        let result: boolean;

        this.observeTaskScheduleById(id)
            .pipe(
                map((schedule: TaskSchedule) => !!schedule),
                take(1),
            ).subscribe(hasTaskSchedule => result = hasTaskSchedule);

        return result;
    }
}
