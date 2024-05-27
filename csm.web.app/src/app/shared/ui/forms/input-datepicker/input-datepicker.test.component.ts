/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
    OnInit,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import * as moment from 'moment';

import {GenericValidators} from '../../../misc/validation/generic.validators';
import {COLORS} from '../../constants/colors.constant';

export const INPUT_DATEPICKER_DEFAULT_STATE: any = {
    value: null,
    label: 'Date',
    rangeLabel: {
        start: 'From',
        end: 'To',
    },
    automationAttr: 'datepicker',
    name: 'datepicker',
    validators: [],
    isDisabled: false,
    isRequired: false,
    isRequiredStart: false,
    isRequiredEnd: false,
    min: null,
    max: null,
    disabledDates: [],
    referenceDate: moment('15-06-2017', 'DD-MM-YYYY'),
    selectRange: false,
    controlName: 'datepicker',
};

@Component({
    selector: 'ss-input-datepicker-test',
    templateUrl: './input-datepicker.test.component.html',
    styles: [
        ':host {display: block; width: 328px}',
        `::ng-deep body {
            background-color: ${COLORS.light_grey_12_5};
        }`,
    ],
})
export class InputDatepickerTestComponent implements OnInit {

    @Input()
    public set disabledDates(disabledDates: moment.Moment[]) {
        this.defaultInputState.datepicker.disabledDates = disabledDates;

        this._setValidators();
    }

    @Input()
    public set isRequired(isRequired: boolean) {
        this.defaultInputState.datepicker.isRequired = isRequired;

        this._setValidators();
    }

    @Input()
    public set max(max: moment.Moment) {
        this.defaultInputState.datepicker.max = max;

        this._setValidators();
    }

    @Input()
    public set min(min: moment.Moment) {
        this.defaultInputState.datepicker.min = min;

        this._setValidators();
    }

    public formGroup: UntypedFormGroup;

    public defaultInputState: any = {
        datepicker: Object.assign({}, INPUT_DATEPICKER_DEFAULT_STATE),
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit(): void {
        this.setForm();
        this._setValidators();
    }

    public setForm(): void {
        const {controlName, value, validators} = this.defaultInputState.datepicker;

        this.formGroup = this._formBuilder.group({
            [controlName]: [value, validators],
        });
    }

    private _setValidators(): void {
        if (this.formGroup) {
            const {min, max, disabledDates, isRequired, isRequiredStart, isRequiredEnd, selectRange} = this.defaultInputState.datepicker;
            const datepickerFormControl = this.formGroup.get('datepicker');
            const isRequiredValidator = !selectRange && isRequired ? [GenericValidators.isRequired()] : [];
            const isRequiredRangeValidator = selectRange && (isRequiredStart || isRequiredEnd)
                ? [GenericValidators.isRequiredRange(isRequiredStart, isRequiredEnd)]
                : [];
            const isValidRangeValidator = selectRange ? [GenericValidators.isValidRange()] : [];

            const validators = [
                ...isRequiredValidator,
                ...isRequiredRangeValidator,
                ...isValidRangeValidator,
                GenericValidators.isValidDate(),
                GenericValidators.isDateInRange(min, max),
                GenericValidators.isDateInArray(disabledDates),
            ];

            datepickerFormControl.setValidators(validators);
            datepickerFormControl.updateValueAndValidity();
        }
    }
}
