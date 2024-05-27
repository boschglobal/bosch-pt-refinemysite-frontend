/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    map
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {NamedEnumReference} from '../../../../shared/misc/api/datatypes/named-enum-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ConstraintKey} from '../../api/constraints/resources/constraint.resource';
import {TaskConstraintsResourceLinks} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskResource} from '../../api/tasks/resources/task.resource';
import {TaskConstraints} from '../../models/task-constraints/task-constraints';
import {ProjectTaskQueries} from '../tasks/task-queries';
import {TaskConstraintsSlice} from './task-constraints.slice';

@Injectable({
    providedIn: 'root',
})
export class TaskConstraintsQueries extends BaseQueries<string[], TaskConstraintsSlice, TaskConstraintsResourceLinks> {

    public moduleName = 'projectModule';
    public sliceName = 'taskConstraintsSlice';

    constructor(private _store: Store<State>,
                private _taskQueries: ProjectTaskQueries) {
        super();
    }

    /**
     * @description Listen task constraints by task id
     * @param {string} taskId
     * @returns {Observable<NamedEnumReference<ConstraintKey>[]>}
     */
    public observeTaskConstraintsByTaskId(taskId: string): Observable<NamedEnumReference<ConstraintKey>[]> {
        return this._store
            .pipe(
                select(this._taskQueries.getItemById(taskId)),
                distinctUntilChanged(isEqual),
                map((task: TaskResource) => task._embedded.constraints.items));
    }

    /**
     * @description Listen task constraints request status by task id
     * @param {string} taskId
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeTaskConstraintsRequestStatusByTaskId(taskId: string): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatusByParent(taskId)),
                distinctUntilChanged());
    }

    /**
     * @description Listen task constraints update permission by task id
     * @param {string} taskId
     * @returns {Observable<boolean>}
     */
    public observeTaskUpdateConstraintsPermissionByTaskId(taskId: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListByParent(taskId)),
                map((taskConstraints: TaskConstraints) => taskConstraints.permissions.canUpdate),
                distinctUntilChanged());
    }

    /**
     * @description Obsereve task constraints version by task id
     * @param {string} taskId
     * @returns {Observable<boolean>}
     */
    public observeTaskConstraintsVersionByTaskId(taskId: string): Observable<number> {
        return this._store
            .pipe(
                select(this.getListByParent(taskId)),
                map((taskConstraints: TaskConstraints) => taskConstraints.version),
                distinctUntilChanged());
    }
}
