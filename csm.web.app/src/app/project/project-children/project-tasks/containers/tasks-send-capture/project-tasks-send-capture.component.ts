/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {AbstractSelectionList} from '../../../../../shared/misc/api/datatypes/abstract-selection-list.datatype';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-project-tasks-send-capture',
    templateUrl: './project-tasks-send-capture.component.html',
    styleUrls: ['./project-tasks-send-capture.component.scss'],
})

export class ProjectTasksSendCaptureComponent implements OnInit, OnDestroy {

    /**
     * @description Sets isSelecting state
     * @param {boolean} isSelecting
     */
    @Input()
    public set isSelecting(isSelecting: boolean) {
        if (isSelecting) {
            this._store.dispatch(new ProjectTaskActions.Set.SendSelecting(true));
        }
    }

    /**
     * @description Emits when tab is closed
     * @type {EventEmitter}
     */
    @Output() public onCancel: EventEmitter<void> = new EventEmitter<void>();

    /**
     * @description Number of selected tasks
     * @type {number}
     */
    public selectedTasksNumber = 0;

    /**
     * @description List of selected tasks ids
     * @type {Array}
     */
    public selectedTasks: string[] = [];

    /**
     * @description Information about submitting status
     */
    public isSubmitting = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
        this._store.dispatch(new ProjectTaskActions.Initialize.Sending());
    }

    /**
     * @description Method called when send is triggered
     */
    public onSubmitForm(): void {
        this._store.dispatch(new ProjectTaskActions.Send.All(this.selectedTasks));
    }

    /**
     * @description Handles click on cancel button
     */
    public handleCancel(): void {
        this.onCancel.emit();
        this._store.dispatch(new ProjectTaskActions.Initialize.Sending());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeTaskSendList()
                .subscribe(this._parseSendList.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeTaskSendListRequestStatus()
                .subscribe(this._handleCaptureState.bind(this))
        );
    }

    private _handleCaptureState(captureStatus: RequestStatusEnum): void {
        switch (captureStatus) {
            case RequestStatusEnum.success:
                this.handleCancel();
                this.isSubmitting = false;
                break;
            case RequestStatusEnum.progress:
                this.isSubmitting = true;
                break;
            case RequestStatusEnum.error:
                this.isSubmitting = false;
                break;
        }
    }

    private _parseSendList(sendList: AbstractSelectionList): void {
        this.selectedTasksNumber = sendList.ids.length;
        this.selectedTasks = sendList.ids;
    }
}
