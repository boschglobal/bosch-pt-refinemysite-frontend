/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    Subject,
    Subscription
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {WorkDaysHoliday} from '../../../../project/project-common/api/work-days/resources/work-days.resource';
import {WorkingDaysHelper} from '../../../../project/project-common/helpers/working-days.helper';
import {WeekDaysEnum} from '../../../misc/enums/weekDays.enum';
import {DateParserStrategy} from '../../dates/date-parser.strategy';

export interface CalendarHeaderData {
    week: CalendarHeaderWeek;
    days: CalendarHeaderWeekDay[];
}

export interface CalendarHeaderWeek {
    number: number;
    monthLabel: string;
    isCurrent: boolean;
}

export interface CalendarHeaderWeekDay {
    number: string;
    label: string;
    classes: { [key: string]: boolean };
    dayHasMilestones: boolean;
}

const LIST_ITEM_PADDING = 2;

export const CSS_CLASS_WEEK_DAY_CURRENT = 'ss-calendar-header__week-days__day--current';
export const CSS_CLASS_WEEK_DAY_FOCUSED = 'ss-calendar-header__week-days__day--focused';
export const CSS_CLASS_WEEK_DAY_NON_WORKING_DAY = 'ss-calendar-header__week-days__day--non-working-day';

@Component({
    selector: 'ss-calendar-header',
    templateUrl: './calendar-header.component.html',
    styleUrls: ['./calendar-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarHeaderComponent implements AfterViewInit, OnInit, OnDestroy {
    @Input()
    public set lowestCalendarRelatedHeight(lowestCalendarRelatedHeight: number) {
        this._lowestCalendarRelatedHeight = lowestCalendarRelatedHeight;
        this._setTodayLineInCurrentWeek$.next(this._lowestCalendarRelatedHeight);
    }

    @Input()
    public set week(week: moment.Moment) {
        this._week = week.clone();
        this._parseWeek(this._week);
    }

    @Input()
    public set focusedDay(focusDay: moment.Moment) {
        this._focusedDay = focusDay;
        this._parseWeek(this._week);
    }

    @Input()
    public set daySlotsWithMilestones(daySlotsWithMilestones: boolean[]) {
        this._daySlotsWithMilestones = daySlotsWithMilestones;
        this._parseWeek(this._week);
    }

    @Input()
    public set isExpanded(value: boolean) {
        this._isExpanded = value;
        this._parseWeek(this._week);
    }

    @Input()
    public set holidays(value: WorkDaysHoliday[]) {
        this._holidays = value;
        this._parseWeek(this._week);
    }

    @Input()
    public set workingDays(value: WeekDaysEnum[]) {
        this._workingDays = value;
        this._parseWeek(this._week);
    }

    @Output()
    public headerClick: EventEmitter<null> = new EventEmitter<null>();

    @ViewChild('calendarHeader', {static: true})
    public calendarHeaderElement: ElementRef<HTMLElement>;

    public get isExpanded(): boolean {
        return this._isExpanded;
    }

    public parsedWeek: CalendarHeaderData;

    public todayLineHeight: string;

    public readonly cssClassWeekDayCurrent = CSS_CLASS_WEEK_DAY_CURRENT;

    private _currentLang: string;

    private _daySlotsWithMilestones: boolean[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _focusedDay: moment.Moment;

    private _isExpanded: boolean;

    private _holidays: WorkDaysHoliday[] = [];

    private _lowestCalendarRelatedHeight: number;

    private _setTodayLineInCurrentWeek$ = new Subject<number>();

    private _week: moment.Moment;

    private _workingDays: WeekDaysEnum[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _dateParser: DateParserStrategy,
                private _translateService: TranslateService) {
        this._setCurrentLang();
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngAfterViewInit(): void {
        this._setTodayLineInCurrentWeek$.next(this._lowestCalendarRelatedHeight);
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleHeaderClick(): void {
        this.headerClick.emit();
    }

    public trackByDay(index: number, day: CalendarHeaderWeekDay): string {
        return day.number;
    }

    private _setTodayLineHeight(calendarWrapperHeight: number): void {
        const calendarHeaderHeight = this.calendarHeaderElement.nativeElement.offsetHeight + LIST_ITEM_PADDING;
        this.todayLineHeight = `${calendarWrapperHeight - calendarHeaderHeight}px`;
    }

    private _getDayClassStyles(day: moment.Moment): { [key: string]: boolean } {
        return {
            [CSS_CLASS_WEEK_DAY_CURRENT]: day.isSame(moment(), 'd'),
            [CSS_CLASS_WEEK_DAY_FOCUSED]: this._focusedDay && day.isSame(this._focusedDay, 'd'),
            [CSS_CLASS_WEEK_DAY_NON_WORKING_DAY]: !WorkingDaysHelper.isDayAWorkingDay(day, this._workingDays) ||
            WorkingDaysHelper.isDayAHoliday(day, this._holidays),
        };
    }

    private _getDays(week: moment.Moment): CalendarHeaderWeekDay[] {
        const firstDay: moment.Moment = this._dateParser.startOfWeek(week);
        const lastDay: moment.Moment = this._dateParser.endOfWeek(week);
        const numberOfWeekDays = Math.ceil(lastDay.diff(firstDay, 'd', true));

        return new Array(numberOfWeekDays)
            .fill(firstDay)
            .map((refDay, index) => refDay.clone().add(index, 'd'))
            .map((day, index) => ({
                number: day.format('d'),
                label: this._getDayLabel(day),
                classes: this._getDayClassStyles(day),
                dayHasMilestones: this._daySlotsWithMilestones[index],
            }));
    }

    private _getDayLabel(day: moment.Moment): string {
        return this.isExpanded
            ? `${day.locale(this._currentLang).format('ddd')} ${day.locale(this._currentLang).format('D')}`
            : `${day.locale(this._currentLang).format('D')}`;
    }

    private _getWeekMonthLabel(week: moment.Moment): string {
        const monthFormat = 'MMM';
        const firstWeekDay: moment.Moment = this._dateParser.startOfWeek(week);
        const lastWeekDay: moment.Moment = this._dateParser.endOfWeek(week);
        const weekDaysSameMonth = firstWeekDay.isSame(lastWeekDay, 'month');
        const startDayMonth = firstWeekDay.locale(this._currentLang).format(monthFormat);
        const endDayMonth = lastWeekDay.locale(this._currentLang).format(monthFormat);

        return weekDaysSameMonth ? startDayMonth : `${startDayMonth} / ${endDayMonth}`;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => {
                    this._setCurrentLang();
                    this._parseWeek(this._week);
                }));

        this._disposableSubscriptions.add(
            this._setTodayLineInCurrentWeek$
                .pipe(
                    filter(() => this.parsedWeek.week.isCurrent)
                )
                .subscribe(calendarWrapperHeight => {
                    this._setTodayLineHeight(calendarWrapperHeight);
                    this._changeDetectorRef.detectChanges();
                })
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setCurrentLang(): void {
        this._currentLang = this._translateService.defaultLang;
    }

    private _parseWeek(week: moment.Moment): void {
        this.parsedWeek = {
            week: {
                number: this._dateParser.week(week),
                monthLabel: this._getWeekMonthLabel(week),
                isCurrent: this._dateParser.isSame(week, moment(), 'w'),
            },
            days: this._getDays(week),
        };
    }
}
