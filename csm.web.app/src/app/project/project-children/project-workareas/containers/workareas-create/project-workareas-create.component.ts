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
    selector: 'ss-project-workareas-create',
    templateUrl: './project-workareas-create.component.html',
    styleUrls: ['./project-workareas-create.component.scss'],
})
export class ProjectWorkareasCreateComponent implements OnInit, OnDestroy {
    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('projectWorkareasCapture', {static: true})
    public projectWorkareasCapture: ProjectWorkareasCaptureComponent;

    public isSubmitting = false;

    public captureMode: CaptureModeEnum = CaptureModeEnum.create;

    public defaultValues: ProjectWorkareasCapture;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _store: Store<State>,
                private _workareaQueries: WorkareaQueries) {
    }

    public handleSubmit(value: ProjectWorkareasCapture): void {
        this._store.dispatch(new WorkareaActions.Create.One(value));
    }

    public handleCancel(): void {
        this.onCancel.emit(null);
        this._resetForm();
    }

    ngOnInit() {
        this._setSubscriptions();
        this._setFocus();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _setFocus(): void {
        this.projectWorkareasCapture.setFocus();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workareaQueries
                .observeCurrentWorkareaRequestStatus()
                .subscribe((status: RequestStatusEnum) => this._setSubmitting(status))
        );

        this._disposableSubscriptions.add(
            this._workareaQueries
                .observeWorkareas()
                .subscribe((workareas: WorkareaResource[]) => this._setDefaultValues(workareas))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _resetForm(): void {
        this.projectWorkareasCapture.resetForm();
        this._store.dispatch(new WorkareaActions.Update.OneReset());
    }

    private _setDefaultValues(workareas: WorkareaResource[]): void {
        this.defaultValues = {
            name: '',
            position: workareas.length + 1,
        };
    }

    private _setSubmitting(requestStatus: RequestStatusEnum): void {
        this.isSubmitting = requestStatus === RequestStatusEnum.progress;
    }
}
