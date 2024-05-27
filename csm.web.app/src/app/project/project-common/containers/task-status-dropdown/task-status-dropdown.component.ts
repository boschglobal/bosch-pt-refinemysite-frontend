/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    Action,
    Store,
} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper,
} from '../../enums/task-status.enum';
import {
    Task,
    TaskPermissions,
} from '../../models/tasks/task';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';

export type TaskStatusItemId = 'open-task' | 'start-task' | 'close-task' | 'reset-task' | 'accept-task';

export type TaskStatusMenuItem = MenuItem<TaskStatusEnum, TaskStatusItemId, string>;

export const OPEN_TASK_ITEM_ID: TaskStatusItemId = 'open-task';
export const START_TASK_ITEM_ID: TaskStatusItemId = 'start-task';
export const CLOSE_TASK_ITEM_ID: TaskStatusItemId = 'close-task';
export const ACCEPT_TASK_ITEM_ID: TaskStatusItemId = 'accept-task';
export const RESET_TASK_ITEM_ID: TaskStatusItemId = 'reset-task';

@Component({
    selector: 'ss-task-status-dropdown',
    templateUrl: './task-status-dropdown.component.html',
    styleUrls: ['./task-status-dropdown.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusDropdownComponent implements OnInit, OnDestroy {

    @Input()
    public set task(task: Task) {
        this._task = task;

        this._setLabel(task.status);
        this._setDropdownItems(task.permissions);
    }

    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<any>;

    @ViewChild('taskStatusIconTemplate', {static: true})
    public taskStatusIconTemplate: TemplateRef<any>;

    public disabled = false;

    public dropdownItems: MenuItemsList<TaskStatusEnum, TaskStatusItemId, string>[] = [];

    public iconRotation = -90;

    public label: string;

    private _isSubmitting: boolean;

    private _disposableSubscriptions: Subscription;

    private _task: Task;

    private readonly _taskActions: { [key in TaskStatusItemId]?: (taskId: string) => Action } = {
        [OPEN_TASK_ITEM_ID]: (taskId: string) => new ProjectTaskActions.Send.One(taskId),
        [START_TASK_ITEM_ID]: (taskId: string) => new ProjectTaskActions.Start.One(taskId),
        [CLOSE_TASK_ITEM_ID]: (taskId: string) => new ProjectTaskActions.Close.One(taskId),
        [ACCEPT_TASK_ITEM_ID]: (taskId: string) => new ProjectTaskActions.Accept.One(taskId),
        [RESET_TASK_ITEM_ID]: (taskId: string) => new ProjectTaskActions.Reset.One(taskId),
    };

    private readonly _taskStatusIds: { [key in TaskStatusEnum]?: TaskStatusItemId } = {
        [TaskStatusEnum.OPEN]: OPEN_TASK_ITEM_ID,
        [TaskStatusEnum.STARTED]: START_TASK_ITEM_ID,
        [TaskStatusEnum.CLOSED]: CLOSE_TASK_ITEM_ID,
        [TaskStatusEnum.ACCEPTED]: ACCEPT_TASK_ITEM_ID,
    };

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleDropdownItemClicked({id, value}: TaskStatusMenuItem): void {
        this._isSubmitting = true;
        this._setLabel(value);

        this._store.dispatch(this._taskActions[id](this._task.id));
    }

    public handleFlyoutStateChange(isFlyoutOpen: boolean): void {
        this.iconRotation = isFlyoutOpen ? 90 : -90;
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus !== RequestStatusEnum.progress) {
                this._isSubmitting = false;
            }
            if (requestStatus === RequestStatusEnum.error) {
                this._setLabel(this._task.status);
            }
        }

        this._setDisabled(requestStatus);
        this._changeDetectorRef.detectChanges();
    }

    private _mapTaskStatusToMenuItem(status: TaskStatusEnum): TaskStatusMenuItem {
        const id = this._taskStatusIds[status];

        return {
            id,
            type: 'button',
            label: TaskStatusEnumHelper.getLabelByValue(status),
            value: status,
        };
    }

    private _setDisabled(requestStatus: RequestStatusEnum): void {
        this.disabled = this._isSubmitting && requestStatus === RequestStatusEnum.progress;
    }

    private _setDropdownItems(permissions: TaskPermissions): void {
        const statusItems: TaskStatusMenuItem[] = [];
        const resetItems: TaskStatusMenuItem[] = [];

        if (permissions.canSend) {
            statusItems.push(this._mapTaskStatusToMenuItem(TaskStatusEnum.OPEN));
        }

        if (permissions.canStart) {
            statusItems.push(this._mapTaskStatusToMenuItem(TaskStatusEnum.STARTED));
        }

        if (permissions.canClose) {
            statusItems.push(this._mapTaskStatusToMenuItem(TaskStatusEnum.CLOSED));
        }

        if (permissions.canAccept) {
            statusItems.push(this._mapTaskStatusToMenuItem(TaskStatusEnum.ACCEPTED));
        }

        if (permissions.canReset) {
            resetItems.push({
                id: RESET_TASK_ITEM_ID,
                type: 'button',
                value: TaskStatusEnum.OPEN,
                label: 'Task_ResetStatus_Label',
                customData: 'reset',
            });
        }

        this.dropdownItems = [
            ...statusItems.length ? [{
                items: statusItems,
                customFigureTemplate: this.taskStatusIconTemplate,
                separator: true,
            }] : [],
            ...resetItems.length ? [{
                items: resetItems,
                customFigureTemplate: this.iconTemplate,
            }] : [],
        ];
    }

    private _setLabel(status: TaskStatusEnum): void {
        this.label = TaskStatusEnumHelper.getLabelByValue(status);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions = this._projectTaskQueries.observeCurrentTaskRequestStatus()
            .subscribe(status => this._handleRequestStatus(status));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
