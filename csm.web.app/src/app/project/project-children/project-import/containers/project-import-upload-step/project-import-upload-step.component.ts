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
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TransitionStatusEnum} from '../../../../../shared/ui/status-transition/status-transition.component';
import {ProjectImportActions} from '../../../../project-common/store/project-import/project-import.actions';
import {ProjectImportQueries} from '../../../../project-common/store/project-import/project-import.queries';

@Component({
    selector: 'ss-project-import-upload-step',
    templateUrl: './project-import-upload-step.component.html',
    styleUrls: ['./project-import-upload-step.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportUploadStepComponent implements OnInit, OnDestroy {

    @Input()
    public file: File;

    @Output()
    public fileUploaded = new EventEmitter<File>();

    public showCancelButton = false;

    public status: TransitionStatusEnum;

    public title: string;

    private _disposableSubscriptions = new Subscription();

    private readonly _statusMap: { [key in RequestStatusEnum]: TransitionStatusEnum } = {
        [RequestStatusEnum.empty]: null,
        [RequestStatusEnum.progress]: TransitionStatusEnum.InProgress,
        [RequestStatusEnum.success]: TransitionStatusEnum.Completed,
        [RequestStatusEnum.error]: TransitionStatusEnum.Error,
    };

    private readonly _titleMap: { [key in RequestStatusEnum]: string } = {
        [RequestStatusEnum.empty]: null,
        [RequestStatusEnum.progress]: 'Project_Import_UploadProgressLabel',
        [RequestStatusEnum.success]: 'Project_Import_UploadSuccessLabel',
        [RequestStatusEnum.error]: 'Project_Import_UploadErrorLabel',
    };

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _projectImportQueries: ProjectImportQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleUploadStepChanged(file: File): void {
        this.file = file;

        if (file) {
            this._store.dispatch(new ProjectImportActions.Upload.One(file));
        } else {
            this._store.dispatch(new ProjectImportActions.Upload.OneReset());
        }
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this._setStatusTransitionData(requestStatus);

        switch (requestStatus) {
            case RequestStatusEnum.success:
                this.fileUploaded.emit(this.file);
                break;
            case RequestStatusEnum.empty:
            case RequestStatusEnum.error:
                this.fileUploaded.emit(null);
                break;
        }

        this._changeDetectorRef.detectChanges();
    }

    private _setStatusTransitionData(requestStatus: RequestStatusEnum): void {
        this.status = this._statusMap[requestStatus];
        this.title = this._titleMap[requestStatus];
        this.showCancelButton = requestStatus === RequestStatusEnum.success || requestStatus === RequestStatusEnum.error;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectImportQueries.observeRequestStatus('upload')
                .subscribe((requestStatus: RequestStatusEnum) => this._handleRequestStatus(requestStatus)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
