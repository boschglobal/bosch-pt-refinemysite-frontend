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
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup
} from '@angular/forms';
import * as moment from 'moment';

import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {GenericWarnings} from '../../../../shared/misc/validation/generic.warnings';
import {InputTextComponent} from '../../../../shared/ui/forms/input-text/input-text.component';
import {InputTextareaComponent} from '../../../../shared/ui/forms/input-textarea/input-textarea.component';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';

@Component({
    selector: 'ss-day-card-capture',
    templateUrl: './day-card-capture.component.html',
    styleUrls: ['./day-card-capture.component.scss']
})
export class DayCardCaptureComponent implements OnInit {

    @Input()
    public mode: CaptureModeEnum;

    @Input()
    public set dateConfig(config: DateRange) {
        this._dateConfig = config;
    }

    @Input()
    public set defaultValues(defaultValues: SaveDayCardResource) {
        this._defaultValues = defaultValues;
        this._setupForm();
    }

    @Input()
    public focus: string;

    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public onSubmit: EventEmitter<SaveDayCardResource> = new EventEmitter<SaveDayCardResource>();

    /**
     * @description Property with title input view child
     */
    @ViewChild('titleInput', {static: true})
    public titleInput: InputTextComponent;

    /**
     * @description Property with title input view child
     */
    @ViewChild('notesInput', {static: true})
    public notesInput: InputTextareaComponent;

    public get dateConfig(): DateRange {
        return this._dateConfig;
    }

    public maxManpower = 99.99;

    public minManpower = 0.00;

    public step = 0.5;

    public title: string;

    public form: UntypedFormGroup;

    public validations: any = {
        title: {
            maxLength: 100
        },
        notes: {
            maxLength: 500
        }
    };

    private _dateConfig: DateRange = {
        disabledDates: [],
        max: null,
        min: null,
    };

    private _defaultValues: SaveDayCardResource = {
        title: '',
        date: null,
        manpower: 1,
        notes: ''
    };

    constructor(private _formBuilder: UntypedFormBuilder) {
    }

    ngOnInit() {
        this._setupForm();
    }

    public getMode(): string {
        return this.mode === CaptureModeEnum.create ? 'create' : 'update';
    }

    public handleSubmit(): void {
        const submitValue: SaveDayCardResource = this._getSubmitValue();

        this.onSubmit.emit(submitValue);
    }

    public handleCancel(): void {
        this._cancelForm();
    }

    public resetForm(): void {
        if (!this.form) {
            return;
        }

        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    private _getSubmitValue(): SaveDayCardResource {
        const {title, date, manpower, notes} = this.form.value;

        return new SaveDayCardResource(
            title,
            date,
            manpower,
            notes
        );
    }

    private _cancelForm() {
        this.resetForm();
        this.onCancel.emit();
    }

    private _setupForm(): void {
        const {title, date: dateString, manpower, notes} = this._defaultValues;
        const date = dateString ? moment(dateString) : null;

        this.form = this._formBuilder.group({
            title: [title, [
                GenericValidators.isRequired(),
                GenericValidators.isMaxLength(this.validations.title.maxLength),
                GenericWarnings.isCharLimitReached(this.validations.title.maxLength)]],
            date: [date, [
                GenericValidators.isRequired(),
                GenericValidators.isValidDate(),
                GenericValidators.isDateInRange(this.dateConfig.min, this.dateConfig.max, 'DayCard_IsDateInRange_Message'),
                GenericValidators.isDateInArray(this.dateConfig.disabledDates, 'DayCard_SlotLocked_Message'),
            ]],
            manpower: [manpower, [
                GenericValidators.isRequired(),
                GenericValidators.isInRange(this.minManpower, this.maxManpower, 'DayCard_ManpowerRange_Message')]],
            notes: [notes, [
                GenericValidators.isMaxLength(this.validations.notes.maxLength),
                GenericWarnings.isCharLimitReached(this.validations.notes.maxLength)]]
        });

        if (this._defaultValues.title.length <= 0) {
            this.titleInput.setFocus();
        }

        if (this.focus === 'notes') {
            this.notesInput.setFocus();
        }
    }
}

export interface DateRange {
    disabledDates: moment.Moment[];
    max: moment.Moment;
    min: moment.Moment;
}
