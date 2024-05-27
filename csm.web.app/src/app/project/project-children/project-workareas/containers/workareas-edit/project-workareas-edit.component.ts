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
import {CaptureModeEnum} from '../../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {WorkareaActions} from '../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {
    ProjectWorkareasCapture,
    ProjectWorkareasCaptureComponent
} from '../../presentationals/workareas-capture/project-workareas-capture.component';

@Component({
    selector: 'ss-project-workareas-edit',
    templateUrl: './project-workareas-edit.component.html',
})
export class ProjectWorkareasEditComponent implements OnInit, OnDestroy {

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('projectWorkareasCapture', {static: true})
    public projectWorkareasCapture: ProjectWorkareasCaptureComponent;

    public isSubmitting = false;

    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    public defaultValues: ProjectWorkareasCapture;

    @Input()
    public set workarea(workarea: WorkareaResource) {
        this._workarea = workarea;

        this.defaultValues = {
            name: workarea.name,
            position: workarea.position
        };
    }

    private _workarea: WorkareaResource;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _workareaQueries: WorkareaQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCancel(): void {
        this.onCancel.emit(null);
        this._resetForm();
    }

    public handleSubmit(value: ProjectWorkareasCapture): void {
        const saveWorkarea = {
            ...value,
            version: this._workarea.version
        };

        this._store.dispatch(new WorkareaActions.Update.One({
            saveWorkarea,
            workareaId: this._workarea.id
        }));

    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workareaQueries
                .observeCurrentWorkareaRequestStatus()
                .subscribe(status => this._handleRequestStatus(status))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;

        if (requestStatus === RequestStatusEnum.success) {
            this.handleCancel();
        }
    }

    private _resetForm(): void {
        this.projectWorkareasCapture.resetForm();
    }
}
