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
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SaveTaskResourceWithVersions} from '../../../../project-common/api/tasks/resources/save-task.resource';
import {ProjectTasksCaptureComponent} from '../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

@Component({
    selector: 'ss-project-tasks-create',
    templateUrl: './project-tasks-create.component.html',
    styleUrls: ['./project-tasks-create.component.scss'],
})
export class ProjectTasksCreateComponent implements OnInit, OnDestroy {

    /**
     * @description Property with tab panel createCapture
     */
    @ViewChild('createCapture', {static: true})
    public createCapture: ProjectTasksCaptureComponent;

    /**
     * @description Emits when the panel is to be closed
     * @type {EventEmitter<any>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter();

    /**
     * @description Property with information about default values
     */
    @Input()
    public defaultValues: boolean;

    /**
     * @description Property that controls the context for creating project tasks to have more information
     * @type {ProjectTasksCreateContext}
     */
    @Input()
    public context: ProjectTasksCreateContext;

    /**
     * @description Property to define that the capture has the create mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.create;

    /**
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isLoading = false;

    public isSubmitting: boolean;

    private _disposableSubscriptions = new Subscription();

    constructor(private _modalService: ModalService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    /**
     * @description Handles submission of the form
     * @param {SaveTaskResourceWithVersions} taskWithVersions
     */
    public handleSubmit(taskWithVersions: SaveTaskResourceWithVersions): void {
        this.isSubmitting = true;
        this._store.dispatch(new ProjectTaskActions.Create.One(taskWithVersions.taskData, this.context));
    }

    /**
     * @description Method to be called to cancel form from outside the capture
     */
    public handleCancel(): void {
        this.isSubmitting = false;
        this.createCapture.handleCancel();
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
        if (this.isSubmitting) {
            if (requestStatus === RequestStatusEnum.success) {
                this.createCapture.resetForm();
                this._store.dispatch(new ProjectTaskActions.Create.OneReset());
                this._modalService.close();
            }

            this.isLoading = requestStatus === RequestStatusEnum.progress;
        }
    }
}

export type ProjectTasksCreateContext = 'list' | 'calendar';
