/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    select,
    Store
} from '@ngrx/store';
import {
    flatten,
    isEqual
} from 'lodash';
import {
    combineLatest,
    Observable
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AbstractSelectionList} from '../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {TaskListLinks} from '../../api/tasks/resources/task-list.resource';
import {TaskEntity} from '../../entities/task/task.entity';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {Task} from '../../models/tasks/task';
import {AttachmentQueries} from '../attachments/attachment.queries';
import {TaskScheduleQueries} from '../task-schedules/task-schedule.queries';
import {ProjectTaskFilters} from './slice/project-task-filters';
import {ProjectTaskSlice} from './task.slice';

@Injectable({
    providedIn: 'root',
})
export class ProjectTaskQueries extends BaseQueries<TaskEntity, ProjectTaskSlice, TaskListLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'projectTaskSlice';

    private _attachmentQueries: AttachmentQueries = new AttachmentQueries(this._store);
    private _taskScheduleQueries: TaskScheduleQueries = new TaskScheduleQueries(this._store);

    constructor(private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves selector function for task name
     * @returns {Function}
     */
    public static getTaskName(): Function {
        return (state: State) => {
            const task = state.projectModule.projectTaskSlice.items
                .find((item: TaskEntity) => item.id === state.projectModule.projectTaskSlice.currentItem.id);
            return task ? task.name : null;
        };
    }

    /**
     * @description Retrieves selector function for calendar tasks
     * @returns {(state: State) => Task[]}
     */
    public getCalendarTasks(): (state: State) => Task[] {
        return (state: State) => {
            const ids: string[] = flatten(this._getSlice(state).calendar.pages);
            return this._getTasksById(ids)(state);
        };
    }

    /**
     * @description Retrieves selector function for calendar request status
     * @returns {(state:State) => RequestStatusEnum}
     */
    public getCalendarRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).calendar.requestStatus;
    }

    /**
     * @description Retrieves query function to get calendar filters
     * @returns {(state: State) => SorterData}
     */
    public getCalendarFilters(): (state: State) => ProjectTaskFilters {
        return (state: State) => this._getSlice(state).calendar.filters;
    }

    /**
     * @description Retrieves query function to get calendar permissions for the resource
     * @returns {(state: State) => TaskListLinks}
     */
    public getCalendarLinks(): (state: State) => any {
        return (state: State) => this._getSlice(state).calendar._links || {};
    }

    /**
     * @description Retrieves query function to get calendar filter panel visibility data
     * @returns {(state: State) => boolean}
     */
    public getCalendarFilterPanelVisibility(): (state: State) => boolean {
        return (state: State) => this._getSlice(state).calendar.isFilterPanelOpen;
    }

    /**
     * @description Retrieves selector function for task assign list
     * @returns {(state: State) => AbstractSelectionList}
     */
    public getAssignList(): (state: State) => AbstractSelectionList {
        return (state: State) => this._getSlice(state).assignList;
    }

    /**
     * @description Retrieves selector function for task assign list request status
     * @returns {(state: State) => AbstractSelectionList}
     */
    public getAssignListRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).assignList.requestStatus;
    }

    /**
     * @description Retrieves selector function for task send list
     * @returns {(state: State) => AbstractSelectionList}
     */
    public getSendList(): (state: State) => AbstractSelectionList {
        return (state: State) => this._getSlice(state).sendList;
    }

    /**
     * @description Retrieves selector function for task assign list request status
     * @returns {(state: State) => AbstractSelectionList}
     */
    public getSendListRequestStatus(): (state: State) => RequestStatusEnum {
        return (state: State) => this._getSlice(state).sendList.requestStatus;
    }

    /**
     * @description Retrieves query function to get list filters data
     * @returns {(state: State) => SorterData}
     */
    public getListFilters(): (state: State) => ProjectTaskFilters {
        return (state: State) => this._getSlice(state).list.filters;
    }

    /**
     * @description Retrieves query function to get filter panel visibility data
     * @returns {(state: State) => boolean}
     */
    public getFilterPanelVisibility(): (state: State) => boolean {
        return (state: State) => this._getSlice(state).list.isFilterPanelOpen;
    }

    /**
     * @description Retrieves whether the task for given if exists
     * @param {string} id
     * @returns {boolean}
     */
    public hasTaskById(id: string): boolean {
        let result: boolean;

        this.observeTaskById(id)
            .pipe(
                map((task: Task) => !!task),
                take(1))
            .subscribe(hasTaskById => result = hasTaskById);
        return result;
    }

    /**
     * @description Retrieves whether the current user has permission to create tasks or not
     * @returns {boolean}
     */
    public hasCreateTaskPermission(): boolean {
        let permissions: boolean;
        this.observeCreateTaskPermission()
            .pipe(
                take(1))
            .subscribe(perm => permissions = perm);
        return permissions;
    }

    /**
     * @description Retrieves Observable of create task permission
     * @returns {Observable<boolean>}
     */
    public observeCreateTaskPermission(): Observable<boolean> {
        return combineLatest([
            this._store.pipe(
                select(this.getListLinks()),
                map((links: TaskListLinks) => links.hasOwnProperty('create'))
            ),
            this._store.pipe(
                select(this.getCalendarLinks()),
                map((links: TaskListLinks) => links.hasOwnProperty('create'))
            ),
        ]).pipe(
            map(([canCreateInList, canCreateInCalendar]) => canCreateInList || canCreateInCalendar),
            distinctUntilChanged()
        );
    }

    /**
     * @description Retrieves Observable of assign task permission
     * @returns {Observable<boolean>}
     */
    public observeAssignTaskPermission(): Observable<boolean> {
        return this.observeListPermission('assign');
    }

    /**
     * @description Retrieves Observable of send task permission
     * @returns {Observable<boolean>}
     */
    public observeSendTaskPermission(): Observable<boolean> {
        return this.observeListPermission('send');
    }

    /**
     * @description Retrieves Observable of task for given id
     * @param {string} id
     * @returns {Observable<Task>}
     */
    public observeTaskById(id: string): Observable<Task> {
        return combineLatest([
            this._store.pipe(
                select(this.getItemById(id))
            ),
            this._store.pipe(
                select(this._taskScheduleQueries.getTaskScheduleByTaskId(id))
            ),
        ]).pipe(
            map(([task, schedule]) => Task.fromTaskEntity(task, schedule)),
            filter(item => !!item),
            distinctUntilChanged(isEqual)
        );
    }

    /**
     * @description Retrieves Observable of Tasks for given ids
     * @param {string} ids
     * @returns {Observable<Task[]>}
     */
    public observeTasksById(ids: string[]): Observable<Task[]> {
        return this._store
            .pipe(
                select(this._getTasksById(ids)),
                distinctUntilChanged(isEqual));
    }

    /**
     * @description Retrieves Observable of current task
     * @returns {Observable<Task>}
     */
    public observeCurrentTask(): Observable<Task> {
        return combineLatest([
            this._store.pipe(
                select(this.getCurrentItem())
            ),
            this._store.pipe(
                select(this._taskScheduleQueries.getTaskSchedules())
            ),
        ]).pipe(
            map(([task, schedules]) => {
                if (task) {
                    const schedule = schedules.find(s => s.task.id === task.id);
                    return Task.fromTaskEntity(task, schedule);
                } else {
                    return task;
                }
            }),
            distinctUntilChanged(isEqual)
        );
    }

    /**
     * @description Retrieves Observable of current task id
     * @returns {Observable<string>}
     */
    public observeCurrentTaskId(): Observable<string> {
        return this._store
            .pipe(
                select(this.getCurrentItemId()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current task request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentTaskRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current page of tasks
     * @returns {Observable<Task[]>}
     */
    public observeCurrentTaskPage(): Observable<Task[]> {
        return combineLatest([
            this._store.pipe(
                select(this.getCurrentPage())
            ),
            this._store.pipe(
                select(this._taskScheduleQueries.getTaskSchedules())
            ),
        ]).pipe(
            map(([tasks, schedules]) => this._addSchedulesToTasks(tasks, schedules)),
            distinctUntilChanged(isEqual)
        );
    }

    /**
     * @description Retrieves Observable of current page initialized state
     * @returns {Observable<boolean>}
     */
    public observeCurrentTaskPageInitialized(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getCurrentPageInitialized()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task list sort
     * @returns {Observable<SorterData>}
     */
    public observeTaskListSort(): Observable<SorterData> {
        return this._store
            .pipe(
                select(this.getListSort()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task list filters
     * @returns {Observable<ProjectTaskFilters>}
     */
    public observeTaskListFilters(): Observable<ProjectTaskFilters> {
        return this._store
            .pipe(
                select(this.getListFilters()),
                distinctUntilChanged(ProjectTaskFilters.isEqual));
    }

    /**
     * @description Retrieves Observable of task filter panel visibility
     * @returns {Observable<ProjectTaskFilters>}
     */
    public observeTaskFilterPanelVisibility(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getFilterPanelVisibility()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of calendar filters
     * @returns {Observable<ProjectTaskFilters>}
     */
    public observeCalendarFilters(): Observable<ProjectTaskFilters> {
        return this._store
            .pipe(
                select(this.getCalendarFilters()),
                distinctUntilChanged(ProjectTaskFilters.isEqual));
    }

    /**
     * @description Retrieves Observable of task calendar filter panel visibility
     * @returns {Observable<ProjectTaskFilters>}
     */
    public observeTaskCalendarFilterPanelVisibility(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getCalendarFilterPanelVisibility()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task list request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeTaskListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of calendar request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCalendarRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCalendarRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of calendar tasks
     * @returns {Observable<Task[]>}
     */
    public observeCalendarTasks(): Observable<Task[]> {
        return this._store
            .pipe(
                select(this.getCalendarTasks()),
                distinctUntilChanged(Task.isEqualArray));
    }

    /**
     * @description Retrieves Observable of task assign list
     * @returns {Observable<AbstractSelectionList>}
     */
    public observeTaskAssignList(): Observable<AbstractSelectionList> {
        return this._store
            .pipe(
                select(this.getAssignList()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task assign list request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeTaskAssignListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getAssignListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task send list
     * @returns {Observable<AbstractSelectionList>}
     */
    public observeTaskSendList(): Observable<AbstractSelectionList> {
        return this._store
            .pipe(
                select(this.getSendList()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of task send list request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeTaskSendListRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getSendListRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of the attachment list
     * @returns {Observable<AttachmentResource[]>}
     */
    public observeCurrentTaskAttachments(): Observable<AttachmentResource[]> {
        let result: string;

        this.observeCurrentTaskId()
            .pipe(
                take(1))
            .subscribe(id => result = id);

        const objectIdentifierId = this._buildTaskObjectIdentifier(result);

        return this._store
            .pipe(
                select(this._attachmentQueries.getItemsByParent(objectIdentifierId)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of the attachmentlist request status
     * @returns {Observable<RequestStatusEnum>}
     */
    public observeCurrentTaskAttachmentsRequestStatus(): Observable<RequestStatusEnum> {
        let result: string;

        this.observeCurrentTaskId()
            .pipe(
                take(1))
            .subscribe(id => result = id);

        const objectIdentifierId = this._buildTaskObjectIdentifier(result);

        return this._store
            .pipe(
                select(this._attachmentQueries.getListRequestStatusByParent(objectIdentifierId)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of list permission specified by permissionKey
     * @param {string} permissionKey
     * @returns {Observable<boolean>}
     */
    public observeListPermission(permissionKey: string): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListLinks()),
                map((links: TaskListLinks) => links.hasOwnProperty(permissionKey)),
                distinctUntilChanged());
    }

    public hasCalendarFiltersApplied(): Observable<boolean> {
        return this._store.pipe(
            select(this.getCalendarFilters())
        ).pipe(
            map(filters => this._hasFiltersApplied(filters) || !filters.useCriteria)
        );
    }

    public hasTaskListFiltersApplied(): Observable<boolean> {
        return this._store.pipe(
            select(this.getListFilters())
        ).pipe(
            map(filters => this._hasFiltersApplied(filters) || !filters.useCriteria)
        );
    }

    private _hasFiltersApplied(projectTaskFilters: ProjectTaskFilters): boolean {
        return !isEqual(projectTaskFilters.criteria, new ProjectTaskFilters().criteria);
    }

    private _buildTaskObjectIdentifier(itemId: string): string {
        return new ObjectListIdentifierPair(ObjectTypeEnum.Task, itemId, true).stringify();
    }

    private _addSchedulesToTasks(tasks: TaskEntity[], schedules: TaskSchedule[]): Task[] {
        return tasks.map(task => {
            const taskSchedule = schedules.find(schedule => schedule.task.id === task.id);
            return Task.fromTaskEntity(task, taskSchedule);
        });
    }

    private _getTasksById(taskIds: string[]): (state: State) => Task[] {
        return (state: State) => taskIds
            .map(id => this._getSlice(state).items.find(item => item.id === id))
            .filter(task => !!task)
            .map(task => {
                const schedule = this._taskScheduleQueries.getTaskScheduleByTaskId(task.id)(state);
                return Task.fromTaskEntity(task, schedule);
            })
            .filter(task => task.schedule && task.schedule.start && task.schedule.end);
    }
}
