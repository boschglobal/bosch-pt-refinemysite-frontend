/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren,
} from '@angular/core';
import {
    ControlValueAccessor,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {
    distinctUntilChanged,
    filter
} from 'rxjs/operators';

import {
    DatepickerDateFormatEnum,
    DatepickerMaskEnum,
    DatepickerPlaceholderEnum,
} from '../../../misc/enums/datepicker-date-format.enum';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {UUID} from '../../../misc/identification/uuid';
import {Z_INDEX} from '../../constants/z-index.constants';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {
    DatepickerCalendarSelectionTypeEnum,
    DateRange,
} from '../datepicker-calendar/datepicker-calendar.component';
import {BaseInputDirective} from '../input.base';

export interface DateRangeString {
    start: string;
    end: string;
}

@Component({
    selector: 'ss-input-datepicker',
    templateUrl: './input-datepicker.component.html',
    styleUrls: ['./input-datepicker.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputDatepickerComponent),
            multi: true,
        },
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputDatepickerComponent extends BaseInputDirective implements OnInit, OnDestroy, ControlValueAccessor {

    /**
     * @description Input for the minimum selectable value on the datepicker
     * @type {Moment}
     */
    @Input() public min: moment.Moment;

    /**
     * @description Input for the maximum selectable value on the datepicker
     * @type {Moment}
     */
    @Input() public max: moment.Moment;

    @Input()
    public rangeLabel: DateRangeString;

    /**
     * @description Input for dates that are not selectable on the datepicker
     * @type {Moment}
     */
    @Input() public disabledDates: moment.Moment[] = [];

    /**
     * @description Input to override BaseInput debounceTime value
     * @type {number}
     */
    @Input()
    public debounceTime = 0;

    @Input()
    public isRequiredStart: boolean;

    @Input()
    public isRequiredEnd: boolean;

    @Input()
    public selectRange: boolean;

    @Input()
    public referenceDate: moment.Moment;

    /**
     * @description Flyout calendar ID
     * @type {string}
     */
    public flyoutId: string;

    /**
     * @description Flyout calendar z-index
     * @type {number}
     */
    public flyoutZIndex = Z_INDEX.index__100000;

    /**
     * @description Flyout calendar keyUp close triggers
     * @type {Array}
     */
    public flyoutCloseKeyTriggers: KeyEnum[] = [KeyEnum.Escape];

    /**
     * @description Element Reference to the datepicker
     */
    @ViewChild('datePicker', {static: true})
    public datePicker: ElementRef;

    /**
     * @description Element Reference to the date inputs
     */
    @ViewChildren('dateInput')
    public dateInputs: QueryList<ElementRef> = new QueryList<ElementRef>();

    /**
     * @description Value to be displayed in the input
     * @description This is different from the actual value of the input
     * @type {string}
     */
    public displayValue: string | DateRangeString = null;

    public inputMask: DatepickerMaskEnum;

    public inputPlaceholder: DatepickerPlaceholderEnum;

    public selection: moment.Moment | DateRange;

    public selectionType: DatepickerCalendarSelectionTypeEnum;

    public selectionTypeEnum = DatepickerCalendarSelectionTypeEnum;

    private _dateFormat: DatepickerDateFormatEnum;

    private _disposableSubscriptions: Subscription = new Subscription();

    constructor(protected _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService,
                private _translateService: TranslateService) {
        super(_changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();
        this._setInputSubscriptions();
        this._setDateFormats();

        this.flyoutId = `ssInputDatepicker-${this.name}-${UUID.v4()}`;
    }

    ngOnDestroy() {
        this._unsetInputSubscriptions();
    }

    /**
     * @description Method called after the value has changed from within the input component itself
     * @param value
     */
    public onInternalChangeCallback(value: any): void {
        this.onChangeCallback(value);
        this.onChange.emit(value);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method called by Angular Forms to write a value to the input component
     * @param value
     */
    public writeValue(value: moment.Moment | DateRange): void {
        this._updateModel(value);
        this._updateDisplayValue(value);
        this.pauseStream();
        this._changeDetectorRef.detectChanges();
    }

    public handleInputValueChange(value: string): void {
        const parsedValue = this._parseInputValue(value);

        this.resumeStream();
        this._updateModel(parsedValue);
        this._updateDisplayValueFromInput(value);
        this.changesObserver.next(parsedValue);
        this._changeDetectorRef.detectChanges();
    }

    public handleKeyDown(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyEnum.Tab:
                if (this.isSelectingStart()) {
                    event.preventDefault();
                }
                this._handleFocusOnNextInput();
                break;
            case KeyEnum.Enter:
                this._handleFocusOnNextInput();
                break;
        }
    }

    private _handleFocusOnNextInput(): void {
        if (this.isSelectingStart()) {
            this._setSelectionType(DatepickerCalendarSelectionTypeEnum.EndDate);
            this.setFocus();
        } else {
            this._closeCalendarFlyout();
        }
    }

    public handleSelectDate(date: moment.Moment | DateRange): void {
        this.resumeStream();
        this._updateModel(date);
        this._updateDisplayValue(date);
        this.changesObserver.next(date);
        this._handleFocusOnNextInput();
        this._changeDetectorRef.detectChanges();
    }

    public handleFocus(selectionType: DatepickerCalendarSelectionTypeEnum): void {
        this._setSelectionType(selectionType);
        this._openCalendarFlyout();
    }

    /**
     * @description Handles the opening of the calendar dropdown
     */
    public handleOpen(event: Event): void {
        this.setFocus();
        this._onInputFocus(event);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Handles the closing of the calendar dropdown
     */
    public handleClose(): void {
        this.setBlur();
        this._onInputBlur();
        this._setSelectionType(null);
        this._changeDetectorRef.detectChanges();
    }

    /**
     * @description Method to toggle calendar open status
     */
    public handleToggleOpen(): void {
        if (this._isCalendarFlyoutOpen()) {
            this._closeCalendarFlyout();
        } else {
            this._openCalendarFlyout();
        }
    }

    public handleMouseDown(event: Event): void {
        if (this._isCalendarFlyoutOpen()) {
            event.stopPropagation();
        }
    }

    public isSelectingStart(): boolean {
        return this.selectionType === DatepickerCalendarSelectionTypeEnum.StartDate;
    }

    public isSelectingEnd(): boolean {
        return this.selectionType === DatepickerCalendarSelectionTypeEnum.EndDate;
    }

    /**
     * @description Method called to set blur on input
     */
    public setBlur(): void {
        this._getInputElement().blur();
    }

    /**
     * @description Method called to set focus on input
     */
    public setFocus(selectionType?: DatepickerCalendarSelectionTypeEnum): void {
        setTimeout(() => this._getInputElement(selectionType).focus(), 0);
    }

    private _setDateFormats(): void {
        const currentLang = this._getCurrentLang();

        this.inputMask = DatepickerMaskEnum[currentLang];
        this.inputPlaceholder = DatepickerPlaceholderEnum[currentLang];
        this._dateFormat = DatepickerDateFormatEnum[currentLang];
    }

    private _setInputSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._flyoutService.openEvents
                .pipe(filter(id => id === this.flyoutId))
                .subscribe(() => this.handleOpen(new MouseEvent('click')))
        );

        this._disposableSubscriptions.add(
            this._flyoutService.closeEvents
                .pipe(filter(id => id === this.flyoutId))
                .subscribe(() => this.handleClose())
        );
    }

    private _unsetInputSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _onInputFocus(event: Event): void {
        this.isFocused = this._isSelectingSingleDate();
        this.onFocus.emit(event);
    }

    private _onInputBlur(): void {
        this.isFocused = false;
        this.onTouchedCallback();
        this.onBlur.emit();
    }

    private _getInputElement(selectionType?: DatepickerCalendarSelectionTypeEnum): HTMLElement {
        const selectEndDateInput = selectionType === DatepickerCalendarSelectionTypeEnum.EndDate;
        const {first, last} = this.dateInputs;

        return (selectEndDateInput || this.isSelectingEnd() ? last : first)?.nativeElement;
    }

    private _getCurrentLang(): string {
        return this._translateService.defaultLang;
    }

    private _setSelectionType(selectionType: DatepickerCalendarSelectionTypeEnum): void {
        this.selectionType = selectionType;
    }

    private _setSelection(value: moment.Moment | DateRange): void {
        if (moment.isMoment(value)) {
            this.selection = value.isValid() ? value : null;
        } else if (value) {
            const {start, end} = value;

            this.selection = {
                start: start?.isValid() ? start : null,
                end: end?.isValid() ? end : null,
            };
        } else {
            this.selection = null;
        }
    }

    private _updateModel(value: moment.Moment | DateRange): void {
        this.value = value;

        this._setSelection(value);
    }

    private _updateDisplayValue(value: moment.Moment | DateRange): void {
        if (moment.isMoment(value)) {
            this.displayValue = value.format(this._dateFormat);
        } else if (value) {
            const {start, end} = value;

            this.displayValue = {
                start: start?.format(this._dateFormat),
                end: end?.format(this._dateFormat),
            };
        } else {
            this.displayValue = null;
        }
    }

    private _updateDisplayValueFromInput(value: string): void {
        const displayValueOptions = {
            [DatepickerCalendarSelectionTypeEnum.SingleDate]: value,
            [DatepickerCalendarSelectionTypeEnum.StartDate]: {
                start: value,
                end: !this._isString(this.displayValue) && this.displayValue?.end,
            },
            [DatepickerCalendarSelectionTypeEnum.EndDate]: {
                start: !this._isString(this.displayValue) && this.displayValue?.start,
                end: value,
            },
        };

        this.displayValue = displayValueOptions[this.selectionType];
    }

    private _parseInputValue(date: string): moment.Moment | DateRange {
        const parsedDate = date !== this.inputPlaceholder ? moment(date, this._dateFormat, true) : null;
        const valueOptions = {
            [DatepickerCalendarSelectionTypeEnum.SingleDate]: parsedDate,
            [DatepickerCalendarSelectionTypeEnum.StartDate]: {
                start: parsedDate,
                end: !moment.isMoment(this.value) && this.value?.end || null,
            },
            [DatepickerCalendarSelectionTypeEnum.EndDate]: {
                start: !moment.isMoment(this.value) && this.value?.start || null,
                end: parsedDate,
            },
        };

        return valueOptions[this.selectionType];
    }

    private _openCalendarFlyout(): void {
        this._flyoutService.open(this.flyoutId);
    }

    private _closeCalendarFlyout(): void {
        this._flyoutService.close(this.flyoutId);
    }

    private _isCalendarFlyoutOpen(): boolean {
        return this._flyoutService.isFlyoutOpen(this.flyoutId);
    }

    private _isSelectingSingleDate(): boolean {
        return this.selectionType === DatepickerCalendarSelectionTypeEnum.SingleDate;
    }

    private _isString(value: any): value is string {
        return typeof value === 'string';
    }
}
