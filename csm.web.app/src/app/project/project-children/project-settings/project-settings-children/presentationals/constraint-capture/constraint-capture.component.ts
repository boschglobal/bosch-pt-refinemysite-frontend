/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';

import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../../shared/misc/validation/generic.warnings';
import {InputTextComponent} from '../../../../../../shared/ui/forms/input-text/input-text.component';

@Component({
    selector: 'ss-constraint-capture',
    templateUrl: './constraint-capture.component.html',
    styleUrls: ['./constraint-capture.component.scss'],
})
export class ConstraintCaptureComponent implements OnInit {

    @Input()
    public set defaultValue(defaultValue: string) {
        this._defaultValue = defaultValue;
        this._setupForm();
    }

    @Input()
    public set mode(mode: CaptureModeEnum) {
        this._setEditMode(mode);
        this._setSubmitFormLabel();
    }

    @Output()
    public cancelForm = new EventEmitter<null>();

    @Output()
    public submitForm = new EventEmitter<string>();

    @ViewChild('constraintInput', {static: true})
    public constraintInput: InputTextComponent;

    public form: UntypedFormGroup;

    public isEditMode: boolean;

    public maxLength = 50;

    public submitFormLabel: string;

    private _defaultValue = '';

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    public handleCancel(): void {
        this.cancelForm.emit();
    }

    public handleSubmit(): void {
        const {name} = this.form.value;

        this.submitForm.emit(name);
    }

    public resetForm(): void {
        if (!this.form) {
            return;
        }

        this.form.reset();
        this._setupForm();
    }

    public setFocus(): void {
        this.constraintInput.setFocus();
    }

    private _setEditMode(mode: CaptureModeEnum): void {
        this.isEditMode = mode === CaptureModeEnum.update;
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            name: [this._defaultValue, [
                GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.maxLength),
                GenericWarnings.isCharLimitReached(this.maxLength),
            ]],
        });

        this.form.updateValueAndValidity();
    }

    private _setSubmitFormLabel(): void {
        this.submitFormLabel = this.isEditMode ? 'Generic_Save' : 'Generic_Add';
    }
}
