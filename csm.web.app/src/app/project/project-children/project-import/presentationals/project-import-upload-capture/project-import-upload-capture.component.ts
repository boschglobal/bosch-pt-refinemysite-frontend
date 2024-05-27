/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import {Subscription} from 'rxjs';

import {EnvironmentHelper} from '../../../../../shared/misc/helpers/environment.helper';

export const ONE_MB_IN_BYTES = 1024 * 1024;

@Component({
    selector: 'ss-project-import-upload-capture',
    templateUrl: './project-import-upload-capture.component.html',
    styleUrls: ['./project-import-upload-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImportUploadCaptureComponent implements OnInit, OnDestroy {

    @Output()
    public fileChanged: EventEmitter<File> = new EventEmitter<File>();

    public formGroup: UntypedFormGroup;

    public maxFileSize: number;

    public maxFileSizeInMb: number;

    public fileTypeRegex = /.*/;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(private _environmentHelper: EnvironmentHelper,
                private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit(): void {
        this.setForm();
        this._setMaxFileSize();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            file: null,
        });
    }

    private _setMaxFileSize(): void {
        const maxFileSize = this._environmentHelper.getConfiguration().projectImportMaxFileSize;

        this.maxFileSizeInMb = maxFileSize;
        this.maxFileSize = maxFileSize * ONE_MB_IN_BYTES;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.formGroup.valueChanges.subscribe(value => {
                    this.fileChanged.emit(value.file[0]);
                }
            ));
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }

}
