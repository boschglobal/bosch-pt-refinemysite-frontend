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
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {CraftActions} from '../../../../../shared/master-data/store/crafts/craft.actions';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SaveTaskResourceWithVersions} from '../../../../project-common/api/tasks/resources/save-task.resource';
import {ProjectTasksCaptureComponent} from '../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-project-tasks-edit',
    templateUrl: './project-tasks-edit.component.html',
    styleUrls: ['./project-tasks-edit.component.scss'],
})
export class ProjectTasksEditComponent implements OnInit, OnDestroy {

    /**
     * @description Property with tab panel editCapture
     */
    @ViewChild('editCapture', {static: true})
    public editCapture: ProjectTasksCaptureComponent;

    /**
     * @description Property with information about default values
     */
    @Input()
    public defaultValues: boolean;

    /**
     * @description Emits when the panel is to be closed
     * @type {EventEmitter<any>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter();

    /**
     * @description Property to define that the capture has the update mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    /**
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isLoading = false;

    private _disposableSubscriptions = new Subscription();

    private _isSubmitting = false;

    constructor(private _modalService: ModalService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this._requestCrafts();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Handles submission of the form
     * @param {SaveTaskResourceWithVersions} taskWithVersions
     */
    public handleUpdate(taskWithVersions: SaveTaskResourceWithVersions): void {
        this._isSubmitting = true;
        const {taskVersion, taskScheduleVersion, taskData} = taskWithVersions;
        this._store.dispatch(new ProjectTaskActions.Update.One(
            {
                taskId: this._modalService.currentModalData.taskId,
                taskVersion,
                taskScheduleVersion,
                payload: taskData,
            }));
    }

    private _requestCrafts(): void {
        this._store.dispatch(new CraftActions.Request.Crafts());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCurrentTaskRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting) {
            if (requestStatus === RequestStatusEnum.success) {
                this.editCapture.handleCancel();
            }

            this.isLoading = requestStatus === RequestStatusEnum.progress;
        }
    }
}
