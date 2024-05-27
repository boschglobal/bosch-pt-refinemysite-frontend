/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {
    distinctUntilChanged,
    startWith,
} from 'rxjs/operators';

import {AlertTypeEnum} from '../../../../shared/alert/enums/alert-type.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';

type ProjectRescheduleShiftUnit = 'days' | 'weeks';

export interface ProjectRescheduleShiftFormData {
    unit: ProjectRescheduleShiftUnit;
    amount: number;
}

export const PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE: ProjectRescheduleShiftFormData = {
    unit: 'days',
    amount: 0,
};

@Component({
    selector: 'ss-project-reschedule-shift-capture',
    templateUrl: './project-reschedule-shift-capture.component.html',
    styleUrls: ['./project-reschedule-shift-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRescheduleShiftCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValues(defaultValues: ProjectRescheduleShiftFormData) {
        this._setFormValue(defaultValues);
    }

    @Output()
    public formValidityChanged = new EventEmitter<boolean>();

    @Output()
    public valueChanged = new EventEmitter<ProjectRescheduleShiftFormData>();

    public readonly alertType: AlertTypeEnum = AlertTypeEnum.Neutral;

    public form = this._formBuilder.group({
        unit: new FormControl(PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE.unit),
        amount: new FormControl(PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE.amount, [
            GenericValidators.isRequired('Generic_ValidationInvalidValue'),
            GenericValidators.isPattern(new RegExp(/^-?[1-9]\d*$/), 'Generic_ValidationInvalidValue'),
        ]),
    });

    public inputLabel = 'Generic_Days';

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    private _handleFormStatusChange(): void {
        this.formValidityChanged.emit(this.form.valid);
    }

    private _setInputLabel(): void {
        this.inputLabel = this.form.value.unit === 'days' ? 'Generic_Days' : 'Generic_Weeks';
        this._changeDetectorRef.detectChanges();
    }

    private _handleFormValueChange(): void {
        this.valueChanged.emit(this.form.value as ProjectRescheduleShiftFormData);
        this._setInputLabel();
    }

    private _setFormValue(value: ProjectRescheduleShiftFormData): void {
        this.form.setValue(value);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.statusChanges.pipe(
                startWith(this.form.status),
                distinctUntilChanged()
            ).subscribe(() => this._handleFormStatusChange()));

        this._disposableSubscriptions.add(
            this.form.valueChanges.pipe(
                startWith(this.form.value),
                distinctUntilChanged(isEqual)
            ).subscribe(() => this._handleFormValueChange()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
