/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';

import {configuration} from '../../../../../configurations/configuration';

export const INPUT_FILES_DEFAULT_STATE = {
    value: null,
    automationAttr: 'files',
    name: 'files',
    label: 'Browse or drop image files',
    secondaryLabel: `(max ${configuration.imageUploadMaxFileSize} MB)`,
    maxSize: configuration.imageUploadMaxFileSize * 1024 * 1024,
    multiple: true,
    isDisabled: false,
    isRequired: false,
    accept: 'image/jpeg',
    canAddFiles: true,
    controlName: 'files',
    size: 'normal',
};

@Component({
    selector: 'ss-input-files-test',
    templateUrl: './input-files.test.component.html',
})
export class InputFilesTestComponent implements OnInit {
    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        files: INPUT_FILES_DEFAULT_STATE,
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit(): void {
        this.setForm();
    }

    public setForm(): void {
        this.formGroup = this._formBuilder.group({
            [this.defaultInputState.files.controlName]: [this.defaultInputState.files.value],
        });
    }
}
