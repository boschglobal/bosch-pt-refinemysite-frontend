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
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../../../shared/misc/validation/generic.warnings';
import {InputTextComponent} from '../../../../../../shared/ui/forms/input-text/input-text.component';
import {WorkDaysHoliday} from '../../../../../project-common/api/work-days/resources/work-days.resource';

export const WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE: WorkingDaysHolidayFormData = {
    name: '',
    date: null,
};

const WORKING_DAYS_HOLIDAY_MONITORING_ACTION_NAME_BY_CAPTURE_MODE: { [key in CaptureModeEnum]?: string } = {
    [CaptureModeEnum.create]: 'Working Days - click on Create Holiday',
    [CaptureModeEnum.update]: 'Working Days - click on Update Holiday',
};

@Component({
    selector: 'ss-working-days-holiday-capture',
    templateUrl: './working-days-holiday-capture.component.html',
    styleUrls: ['./working-days-holiday-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingDaysHolidayCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValue(defaultValue: WorkingDaysHolidayFormData) {
        this._initialValue = defaultValue || WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE;
        this._setFormValue(this._initialValue);
        this._setFocusInputText();
    }

    @Input()
    public set mode(value: CaptureModeEnum) {
        this.monitoringClickActionName = WORKING_DAYS_HOLIDAY_MONITORING_ACTION_NAME_BY_CAPTURE_MODE[value];

        this._setSubmitButtonLabel(value);
    }

    @Input()
    public holidays: WorkDaysHoliday[] = [];

    @Output()
    public cancelWorkingDaysHoliday: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public submitWorkingDaysHoliday: EventEmitter<WorkingDaysHolidayFormData> = new EventEmitter<WorkingDaysHolidayFormData>();

    @ViewChild('nameInput', {static: true})
    public nameInput: InputTextComponent;

    public monitoringClickActionName: string;

    public submitButtonLabel: string;

    public validations: any = {
        name: {
            maxLength: 100,
        },
    };

    public readonly form = this._formBuilder.group({
        name: new FormControl(WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE.name, [
            GenericValidators.isRequired(),
            GenericValidators.isMaxLength(this.validations.name.maxLength),
            GenericWarnings.isCharLimitReached(this.validations.name.maxLength),
            this._validatorFn.bind(this),
        ]),
        date: new FormControl(WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE.date, [
            GenericValidators.isRequired(),
            GenericValidators.isValidDate(),
            this._validatorFn.bind(this),
        ]),
    });

    private _disposableSubscriptions: Subscription = new Subscription();

    private _initialValue: WorkingDaysHolidayFormData;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(): void {
        const value = this.form.value as WorkingDaysHolidayFormData;

        this.submitWorkingDaysHoliday.emit(value);
    }

    public handleCancel(): void {
        this.cancelWorkingDaysHoliday.emit();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    private _validatorFn(): { [key: string]: { valid: boolean; message: string } } | null {
        const {name, date} = this.form?.controls || {name: null, date: null};

        return this.holidays
            .find(holiday => holiday.name.toUpperCase() === name.value.toUpperCase() && moment(holiday.date).isSame(date.value, 'd'))
        && !(this._initialValue.name.toUpperCase() === name.value.toUpperCase() && this._initialValue.date.isSame(date.value, 'd'))
            ? {
                findInArray: {
                    valid: false,
                    message: 'WorkingDays_NonWorkingDays_RepeatInputsError',
                },
            }
            : null;
    }

    private _setFormValue(value: WorkingDaysHolidayFormData): void {
        this.form.setValue(value);
    }

    private _setFocusInputText() {
        this.nameInput.setFocus();
    }

    private _setSubmitButtonLabel(mode: CaptureModeEnum) {
        this.submitButtonLabel = mode === CaptureModeEnum.create ? 'Generic_Create' : 'Generic_Update';
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this.form.controls.name.valueChanges
                .pipe(distinctUntilChanged())
                .subscribe(() => {
                    this.form.controls.date.updateValueAndValidity();
                    this._changeDetectorRef.detectChanges();
                }));
        this._disposableSubscriptions.add(
            this.form.controls.date.valueChanges
                .pipe(distinctUntilChanged((a: moment.Moment, b: moment.Moment) => !!a && !!b && a.isSame(b, 'd')))
                .subscribe(() => {
                    this.form.controls.name.updateValueAndValidity();
                    this._changeDetectorRef.detectChanges();
                }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface WorkingDaysHolidayFormData {
    name: string;
    date: moment.Moment;
}
