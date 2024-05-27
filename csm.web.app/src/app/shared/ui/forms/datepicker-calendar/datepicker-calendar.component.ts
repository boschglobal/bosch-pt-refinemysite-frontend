/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
    chunk,
    range,
} from 'lodash';
import * as moment from 'moment';

export interface DatepickerCalendarDay {
    classes: { [key: string]: any };
    date: moment.Moment;
    day: string;
    isOutOfRange: boolean;
    isHoveredRange: boolean;
}

export interface DatepickerCalendarWeek {
    classes: { [key: string]: any };
    days: DatepickerCalendarDay[];
    week: number;
}

export interface DateRange {
    start?: moment.Moment;
    end?: moment.Moment;
}

export enum DatepickerCalendarViewEnum {
    Day,
    Month,
    Year,
}

export enum DatepickerCalendarSelectionTypeEnum {
    SingleDate,
    StartDate,
    EndDate,
}

export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED = 'ss-datepicker-calendar__cell-day--disabled';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED = 'ss-datepicker-calendar__cell-day--hovered';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE = 'ss-datepicker-calendar__cell-day--hovered-range';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START = 'ss-datepicker-calendar__cell-day--hovered-range-start';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END = 'ss-datepicker-calendar__cell-day--hovered-range-end';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH = 'ss-datepicker-calendar__cell-day--not-in-current-month';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY = 'ss-datepicker-calendar__cell-day--today';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED = 'ss-datepicker-calendar__cell-day--selected';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE = 'ss-datepicker-calendar__cell-day--selected-range';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START = 'ss-datepicker-calendar__cell-day--selected-start';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END = 'ss-datepicker-calendar__cell-day--selected-end';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_START = 'ss-datepicker-calendar__cell-day--selecting-start';
export const CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_END = 'ss-datepicker-calendar__cell-day--selecting-end';
export const CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED = 'ss-datepicker-calendar__cell-week--disabled';
export const CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED = 'ss-datepicker-calendar__cell-week--hovered';
export const CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED = 'ss-datepicker-calendar__cell-week--selected';
const NUMBER_OF_DAYS_PER_WEEK = 7;
const NUMBER_OF_COLUMNS_PER_VIEW = 3;
const NUMBER_OF_YEARS_PER_VIEW = 12;

@Component({
    selector: 'ss-datepicker-calendar',
    templateUrl: './datepicker-calendar.component.html',
    styleUrls: ['./datepicker-calendar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatepickerCalendarComponent implements OnInit, OnChanges {

    @Input()
    public disabledDates: moment.Moment[] = [];

    @Input()
    public max: moment.Moment;

    @Input()
    public min: moment.Moment;

    @Input()
    public set referenceDate(referenceDate: moment.Moment) {
        this._referenceDate = referenceDate?.clone() || this._referenceDate;
        this._referenceDate.locale(this._translateService.defaultLang);
    }

    public get referenceDate(): moment.Moment {
        return this._referenceDate;
    }

    @Input()
    public set selection(selection: moment.Moment | DateRange) {
        if (selection) {
            if (moment.isMoment(selection)) {
                this._selectedDate = selection;
            } else {
                this._selectedRange = this._parseSelection(selection);
            }
        } else {
            this._selectedDate = this._selectedRange = null;
        }

        this._updateReferenceDate();
        this._setWeekRows();
    }

    @Input()
    public set selectionType(selectionType: DatepickerCalendarSelectionTypeEnum) {
        this._selectionType = selectionType;

        this._updateReferenceDate();
        this._setWeekRows();
    }

    @Output()
    public pick = new EventEmitter<moment.Moment | DateRange>();

    public datepickerCalendarViewEnum = DatepickerCalendarViewEnum;

    public weekRows: DatepickerCalendarWeek[];

    public monthRows: any[][];

    public view: DatepickerCalendarViewEnum = DatepickerCalendarViewEnum.Day;

    public weekdays: string[];

    public yearRows: number[][];

    private _hoveredDate: moment.Moment;

    private _referenceDate = moment();

    private _selectedDate: moment.Moment;

    private _selectedRange: DateRange;

    private _selectionType: DatepickerCalendarSelectionTypeEnum = DatepickerCalendarSelectionTypeEnum.SingleDate;

    private _today = moment();

    constructor(private _translateService: TranslateService) {
    }

    ngOnInit(): void {
        this._setMonthRows();
        this._setWeekdays();
        this._setWeekRows();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.hasOwnProperty('min') ||
            changes.hasOwnProperty('max') ||
            changes.hasOwnProperty('referenceDate') ||
            changes.hasOwnProperty('disabledDates')) {
            this._setWeekRows();
        }
    }

    public get currentYear(): number {
        return this._referenceDate.year();
    }

    public get currentMonth(): string {
        return this._referenceDate.format('MMMM');
    }

    public getWeekDataAutomation(week: DatepickerCalendarWeek): string {
        return `week-${week.week}-${week.days[0].date.format('YYYY')}`;
    }

    public getDayDataAutomation(day: moment.Moment): string {
        return `day-${day.format('D-M-YYYY')}`;
    }

    public getMonthDataAutomation(month: number): string {
        return `month-${(month + 1)}`;
    }

    public handleEnterWeekCell(week: DatepickerCalendarWeek): void {
        this.handleEnterDayCell(this._getAvailableDay(week.days));
    }

    public handleEnterDayCell(day: DatepickerCalendarDay): void {
        if (!!day && !day.isOutOfRange && !this._hoveredDate?.isSame(day.date, 'd')) {
            this._hoveredDate = day.date;
            this._setWeekRows();
        }
    }

    public handleLeaveCell(): void {
        this._hoveredDate = null;
        this._setWeekRows();
    }

    public handleSelectDay(day: DatepickerCalendarDay): void {
        if (!this._isDayDisabled(day)) {
            if (this._isSelectingStart()) {
                this._selectStartDate(day.date);
            } else if (this._isSelectingEnd()) {
                this._selectEndDate(day.date);
            } else {
                this._selectDate(day.date);
            }
        }
    }

    public handleSelectWeek(week: DatepickerCalendarWeek): void {
        if (this._isSelectingStart()) {
            this._selectStartDate(this._getFirstAvailableDay(week.days)?.date);
        } else if (this._isSelectingEnd()) {
            this._selectEndDate(this._getLastAvailableDay(week.days)?.date);
        } else {
            this._selectDate(this._getFirstAvailableDay(week.days)?.date);
        }
    }

    public handleSelectMonth(month: number): void {
        const year = this._referenceDate.year();

        this._referenceDate = moment({year, month});
        this.setView(DatepickerCalendarViewEnum.Day);
    }

    public handleSelectYear(year: number): void {
        this._referenceDate = moment({year});
        this.setView(DatepickerCalendarViewEnum.Month);
    }

    public setNextView(): void {
        switch (this.view) {
            case DatepickerCalendarViewEnum.Day:
                this._referenceDate.add(1, 'month');
                this._setWeekRows();
                break;
            case DatepickerCalendarViewEnum.Month:
                this._referenceDate.add(1, 'year');
                break;
            case DatepickerCalendarViewEnum.Year:
                this._referenceDate.add(NUMBER_OF_YEARS_PER_VIEW, 'year');
                this._setYearRows();
                break;
        }
    }

    public setPreviousView(): void {
        switch (this.view) {
            case DatepickerCalendarViewEnum.Day:
                this._referenceDate.subtract(1, 'month');
                this._setWeekRows();
                break;
            case DatepickerCalendarViewEnum.Month:
                this._referenceDate.subtract(1, 'year');
                break;
            case DatepickerCalendarViewEnum.Year:
                this._referenceDate.subtract(NUMBER_OF_YEARS_PER_VIEW, 'year');
                this._setYearRows();
                break;
        }
    }

    public setView(view: DatepickerCalendarViewEnum): void {
        this.view = view;

        switch (this.view) {
            case DatepickerCalendarViewEnum.Day:
                this._setWeekRows();
                break;
            case DatepickerCalendarViewEnum.Year:
                this._setYearRows();
                break;
        }
    }

    private _selectDate(date: moment.Moment): void {
        if (date) {
            this.pick.emit(date);
        }
    }

    private _selectStartDate(start: moment.Moment): void {
        if (start) {
            const end = this._selectedRange?.end;
            this.pick.emit({
                start,
                end: moment.isMoment(end) && start.isAfter(end, 'd') ? null : end,
            });
        }
    }

    private _selectEndDate(end: moment.Moment): void {
        if (end) {
            const start = this._selectedRange?.start;
            this.pick.emit({
                start: moment.isMoment(start) && end.isBefore(start, 'd') ? null : start,
                end,
            });
        }
    }

    private _getAvailableDay(days: DatepickerCalendarDay[]): DatepickerCalendarDay | undefined {
        return this._isSelectingStart() || this._isSelectingSingleDate()
            ? this._getFirstAvailableDay(days)
            : this._getLastAvailableDay(days);
    }

    private _getFirstAvailableDay(days: DatepickerCalendarDay[]): DatepickerCalendarDay | undefined {
        return days.find(day => !day.isOutOfRange);
    }

    private _getLastAvailableDay(days: DatepickerCalendarDay[]): DatepickerCalendarDay | undefined {
        return [...days].reverse().find(day => !day.isOutOfRange);
    }

    private _isDayDisabled(day: DatepickerCalendarDay): boolean {
        return day.isOutOfRange;
    }

    private _isOutOfRange(date: moment.Moment): boolean {
        return (moment.isMoment(this.min) && date.isBefore(this.min, 'd'))
            || (moment.isMoment(this.max) && date.isAfter(this.max, 'd'))
            || this.disabledDates.some(disableDate => date.isSame(disableDate, 'd'));
    }

    private _isSelectedRange(day: moment.Moment): boolean {
        return moment.isMoment(this._selectedRange?.start) && !this._isOutOfRange(this._selectedRange?.start)
            && moment.isMoment(this._selectedRange?.end) && !this._isOutOfRange(this._selectedRange?.end)
            && day.isBetween(this._selectedRange?.start, this._selectedRange?.end, 'd', '[]');
    }

    private _isHoveredRange(day: moment.Moment): boolean {
        const start = this._selectedRange?.start;
        const end = this._selectedRange?.end;

        return moment.isMoment(this._hoveredDate)
            && ((
                    this._isSelectingStart() && moment.isMoment(end)
                    && (
                        (moment.isMoment(start) && day.isBetween(this._hoveredDate, start, 'd', '[]') && day.isSameOrBefore(end, 'd'))
                        || (!moment.isMoment(start) && day.isBetween(this._hoveredDate, end, 'd', '[]'))
                    )
                )
                || (
                    this._isSelectingEnd() && moment.isMoment(start)
                    && (
                        (moment.isMoment(end) && day.isBetween(end, this._hoveredDate, 'd', '[]') && day.isSameOrAfter(start, 'd'))
                        || (!moment.isMoment(end) && day.isBetween(start, this._hoveredDate, 'd', '[]'))
                    )
                )
            );
    }

    private _isHovered(day: moment.Moment): boolean {
        return moment.isMoment(this._hoveredDate) && day.isSame(this._hoveredDate, 'd');
    }

    private _isHoveredStart(day: moment.Moment, selectedDay: moment.Moment): boolean {
        return this._isSelectingStart()
            && moment.isMoment(this._hoveredDate)
            && day.isSame(this._hoveredDate, 'd')
            && (!moment.isMoment(selectedDay) || moment.isMoment(selectedDay) && day.isSameOrBefore(selectedDay, 'd'));
    }

    private _isHoveredEnd(day: moment.Moment, selectedDay: moment.Moment): boolean {
        return this._isSelectingEnd()
            && moment.isMoment(this._hoveredDate)
            && day.isSame(this._hoveredDate, 'd')
            && (!moment.isMoment(selectedDay) || moment.isMoment(selectedDay) && day.isSameOrAfter(selectedDay, 'd'));
    }

    private _isWeekHovered(days: DatepickerCalendarDay[]): boolean {
        return days.some(day => day.isHoveredRange);
    }

    private _isWeekSelected(days: DatepickerCalendarDay[]): boolean {
        const start = this._selectedRange?.start;
        const end = this._selectedRange?.end;

        return moment.isMoment(start) && !this._isOutOfRange(start)
            && moment.isMoment(end) && !this._isOutOfRange(end)
            && days.some(day => day.date.isBetween(start, end, 'd', '[]'));
    }

    private _isDaySelected(day: moment.Moment, selectedDay: moment.Moment): boolean {
        return moment.isMoment(selectedDay)
            && day.isSame(selectedDay, 'd');
    }

    private _isThisMonth(day: moment.Moment): boolean {
        return day.isSame(this._referenceDate, 'M');
    }

    private _isToday(day: moment.Moment): boolean {
        return day.isSame(this._today, 'd');
    }

    private _isSelectingSingleDate(): boolean {
        return this._selectionType === DatepickerCalendarSelectionTypeEnum.SingleDate;
    }

    private _isSelectingStart(): boolean {
        return this._selectionType === DatepickerCalendarSelectionTypeEnum.StartDate;
    }

    private _isSelectingEnd(): boolean {
        return this._selectionType === DatepickerCalendarSelectionTypeEnum.EndDate;
    }

    private _isSelectingRange(): boolean {
        return this._isSelectingStart() || this._isSelectingEnd();
    }

    private _getDayClasses(day: moment.Moment, isOutOfRange: boolean, isHoveredRange: boolean): { [key: string]: any } {
        let selectionClasses: { [key: string]: boolean };

        if (this._isSelectingRange()) {
            selectionClasses = {
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE]: this._isSelectedRange(day),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START]: this._isDaySelected(day, this._selectedRange?.start),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END]: this._isDaySelected(day, this._selectedRange?.end),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE]: isHoveredRange,
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START]: this._isHoveredStart(day, this._selectedRange?.start),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END]: this._isHoveredEnd(day, this._selectedRange?.end),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_START]: this._isSelectingStart(),
                [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_END]: this._isSelectingEnd(),
            };
        }

        return {
            ...selectionClasses,
            [CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED]: isOutOfRange,
            [CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH]: !this._isThisMonth(day),
            [CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY]: this._isToday(day),
            [CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED]: this._isHovered(day),
            [CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED]: this._isDaySelected(day, this._selectedDate),
        };
    }

    private _getWeekClasses(days: DatepickerCalendarDay[]): { [key: string]: any } {
        let selectionClasses: { [key: string]: boolean } = {};
        if (this._isSelectingRange()) {
            selectionClasses = {
                [CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED]: this._isWeekSelected(days),
                [CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED]: this._isWeekHovered(days),
            };
        }

        return {
            ...selectionClasses,
            [CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED]: !this._getFirstAvailableDay(days),
        };
    }

    private _mapDateToCalendarWeek(days: DatepickerCalendarDay[]): DatepickerCalendarWeek {
        return {
            days,
            classes: this._getWeekClasses(days),
            week: days[0].date.isoWeek(),
        };
    }

    private _mapDateToCalendarDay(date: moment.Moment): DatepickerCalendarDay {
        const isOutOfRange = this._isOutOfRange(date);
        const isHoveredRange = this._isHoveredRange(date);

        return {
            classes: this._getDayClasses(date, isOutOfRange, isHoveredRange),
            date,
            day: date.format('D'),
            isOutOfRange,
            isHoveredRange,
        };
    }

    private _parseSelection({start, end}: DateRange): DateRange {
        return {
            start: moment.isMoment(start) && !this._isOutOfRange(start) ? start : null,
            end: moment.isMoment(end) && !this._isOutOfRange(end) ? end : null,
        };
    }

    private _setWeekRows(): void {
        const firstDay: moment.Moment = this._referenceDate.clone().startOf('month').startOf('isoWeek');
        const lastDay: moment.Moment = this._referenceDate.clone().endOf('month').endOf('isoWeek');
        const size = lastDay.diff(firstDay, 'd') + 1;
        const days: DatepickerCalendarDay[] = new Array(size)
            .fill(firstDay)
            .map((date, index) => this._mapDateToCalendarDay(date.clone().add(index, 'd')));

        this.weekRows = chunk(days, NUMBER_OF_DAYS_PER_WEEK)
            .map(weekDays => this._mapDateToCalendarWeek(weekDays));
    }

    private _setMonthRows(): void {
        const months = moment.monthsShort()
            .map((label, value) => ({label, value}));

        this.monthRows = chunk(months, NUMBER_OF_COLUMNS_PER_VIEW);
    }

    private _setWeekdays(): void {
        const weekdays = moment.weekdaysShort();

        weekdays.push(weekdays.shift());
        this.weekdays = weekdays;
    }

    private _setYearRows(): void {
        const currentYear = this._referenceDate.year();
        const years = range(currentYear, currentYear + NUMBER_OF_YEARS_PER_VIEW);

        this.yearRows = chunk(years, NUMBER_OF_COLUMNS_PER_VIEW);
    }

    private _updateReferenceDate(): void {
        if (moment.isMoment(this._selectedDate)) {
            this.referenceDate = this._selectedDate;
        } else {
            this.referenceDate = this._isSelectingStart()
                ? this._selectedRange?.start
                : this._selectedRange?.end;
        }
    }
}
