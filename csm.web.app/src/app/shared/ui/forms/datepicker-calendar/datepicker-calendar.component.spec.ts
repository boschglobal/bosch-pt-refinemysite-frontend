/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {UIModule} from '../../ui.module';
import {
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_END,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_START,
    CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY,
    CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED,
    CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED,
    CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED,
    DatepickerCalendarComponent,
    DatepickerCalendarSelectionTypeEnum,
    DateRange,
} from './datepicker-calendar.component';
import {DatepickerCalendarTestComponent} from './datepicker-calendar.test.component';

describe('DatepickerCalendarComponent', () => {
    let comp: DatepickerCalendarComponent;
    let testHostComp: DatepickerCalendarTestComponent;
    let fixture: ComponentFixture<DatepickerCalendarTestComponent>;
    let de: DebugElement;

    const datepickerCalendarComponentHostSelector = 'ss-datepicker-calendar';
    const dataAutomationCalendarFlyout = '[data-automation="calendar-dropdown"]';
    const dataAutomationInputChangeViewLabelSelector = `${dataAutomationCalendarFlyout} [data-automation="change-view"]`;
    const dataAutomationNextArrowSelector = `${dataAutomationCalendarFlyout} [data-automation="next"]`;
    const dataAutomationPreviousArrowSelector = `${dataAutomationCalendarFlyout} [data-automation="previous"]`;
    const clickEvent: Event = new Event('click');
    const enterEvent: Event = new Event('mouseenter');
    const leaveEvent: Event = new Event('mouseleave');

    const referenceDate = moment('2020-09-08');

    const getChangeViewLabelElement = (): HTMLElement =>
        getElement(dataAutomationInputChangeViewLabelSelector);

    const getNextArrowElement = (): HTMLElement =>
        getElement(dataAutomationNextArrowSelector);

    const getPreviousArrowElement = (): HTMLElement =>
        getElement(dataAutomationPreviousArrowSelector);

    const getDayElement = (date: moment.Moment): HTMLElement =>
        getElement(`[data-automation="day-${date.format('D-M-YYYY')}"]`);

    const getWeekElement = (date: moment.Moment): HTMLElement =>
        getElement(`[data-automation="week-${date.isoWeek()}-${date.format('YYYY')}"]`);

    const getMonthElement = (date: moment.Moment): HTMLElement =>
        getElement(`[data-automation="month-${date.format('M')}"]`);

    const getYearElement = (date: moment.Moment): HTMLElement =>
        getElement(`[data-automation="year-${date.format('Y')}"]`);

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            TranslationModule.forRoot(),
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            DatepickerCalendarComponent,
            DatepickerCalendarTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DatepickerCalendarTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(datepickerCalendarComponentHostSelector));
        comp = de.componentInstance;

        testHostComp.referenceDate = referenceDate;
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate;
        fixture.detectChanges();
    });

    it('should not update the referenceDate when an invalid one is received', () => {
        const previousReferenceDate = comp.referenceDate;

        testHostComp.referenceDate = null;
        fixture.detectChanges();

        expect(comp.referenceDate).toBe(previousReferenceDate);
    });

    it('should change the referenceDate to equal the selectedDate', () => {
        const selectedDate = referenceDate.clone().add(2, 'd');

        testHostComp.selectedDate = selectedDate;
        fixture.detectChanges();

        expect(comp.referenceDate).toEqual(selectedDate);
    });

    it('should change the referenceDate when the selectionType changes', () => {
        const selectedDate: DateRange = {
            start: referenceDate.clone().subtract(2, 'd'),
            end: referenceDate.clone().add(2, 'd'),
        };

        testHostComp.selectedDate = selectedDate;
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        fixture.detectChanges();

        expect(comp.referenceDate).toEqual(selectedDate.start);

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        fixture.detectChanges();

        expect(comp.referenceDate).toEqual(selectedDate.end);
    });

    it('should select a date 12 years in the future by navigating in the calendar', () => {
        const spy = spyOn(comp.pick, 'emit');
        const expectedDate = referenceDate.clone()
            .add(12, 'y')
            .add(1, 'M')
            .add(1, 'd');

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getNextArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getYearElement(expectedDate).dispatchEvent(clickEvent);
        fixture.detectChanges();

        getMonthElement(expectedDate).dispatchEvent(clickEvent);
        fixture.detectChanges();

        getDayElement(expectedDate).dispatchEvent(clickEvent);
        fixture.detectChanges();

        const selectedDate = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedDate.isSame(expectedDate, 'd')).toBeTruthy();
    });

    it('should not be able to select a day after maximum defined', () => {
        spyOn(comp.pick, 'emit');
        const max = referenceDate.clone().add(1, 'd');
        const afterMax = max.clone().add(1, 'd');

        testHostComp.max = max;
        fixture.detectChanges();
        getDayElement(afterMax).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should not be able to select a day before minimum defined', () => {
        spyOn(comp.pick, 'emit');
        const min = referenceDate.clone().subtract(1, 'd');
        const beforeMin = min.clone().subtract(1, 'd');

        testHostComp.min = min;
        fixture.detectChanges();
        getDayElement(beforeMin).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should not be able to select a days that matches defined disabled dates', () => {
        spyOn(comp.pick, 'emit');
        const disabledDates = [referenceDate.clone().add(1, 'day')];

        testHostComp.disabledDates = disabledDates;
        fixture.detectChanges();

        getDayElement(disabledDates[0]).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should navigate to next month', () => {
        const expectedValue = referenceDate.clone().add(1, 'month').format('MMMM');

        getNextArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should navigate to previous month', () => {
        const expectedValue = referenceDate.clone().subtract(1, 'month').format('MMMM');

        getPreviousArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should navigate to next year', () => {
        const expectedValue = referenceDate.clone().add(1, 'year').format('YYYY');

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getNextArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should navigate to previous year', () => {
        const expectedValue = referenceDate.clone().subtract(1, 'year').format('YYYY');

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getPreviousArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should navigate to 12 years from now', () => {
        const expectedValue = referenceDate.clone().add(12, 'year').format('YYYY');

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getNextArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should navigate to 12 years into past', () => {
        const expectedValue: string = referenceDate.clone().subtract(12, 'year').format('YYYY');

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getChangeViewLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        getPreviousArrowElement().dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(getChangeViewLabelElement().textContent).toContain(expectedValue);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day is after the maximum defined', () => {
        const max = referenceDate.clone().add(1, 'd');
        const afterMax = max.clone().add(1, 'd');

        testHostComp.max = max;
        fixture.detectChanges();

        expect(getDayElement(afterMax).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day is before the maximum defined', () => {
        const max = referenceDate.clone().add(1, 'd');
        const beforeMax = max.clone().subtract(1, 'd');

        testHostComp.max = max;
        fixture.detectChanges();

        expect(getDayElement(beforeMax).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day is before the minimum defined', () => {
        const min = referenceDate.clone().subtract(1, 'd');
        const beforeMin = min.clone().subtract(1, 'd');

        testHostComp.min = min;
        fixture.detectChanges();

        expect(getDayElement(beforeMin).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day is after the minimum defined', () => {
        const min = referenceDate.clone().subtract(1, 'd');
        const afterMin = min.clone().add(1, 'd');

        testHostComp.min = min;
        fixture.detectChanges();

        expect(getDayElement(afterMin).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day matches with the defined disabled dates', () => {
        const disabledDates = [referenceDate.clone().add(1, 'd')];

        testHostComp.disabledDates = disabledDates;
        fixture.detectChanges();

        expect(getDayElement(disabledDates[0]).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED when the day doesn\'t matches with the defined disabled dates', () => {
        const disabledDates = [referenceDate.clone().add(1, 'd')];
        const notDisabledDate = referenceDate.clone().add(2, 'd');

        testHostComp.disabledDates = disabledDates;
        fixture.detectChanges();

        expect(getDayElement(notDisabledDate).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_DISABLED);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH when the day is not in the current month', () => {
        const dayNotInCurrentMonth = moment('2020-08-31');

        expect(getDayElement(dayNotInCurrentMonth).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH when the day is in the current month', () => {
        const dayInCurrentMonth = referenceDate.clone().add(5, 'd');

        expect(getDayElement(dayInCurrentMonth).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_NOT_IN_CURRENT_MONTH);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY when the day is today', () => {
        const today = moment();

        testHostComp.referenceDate = today;
        fixture.detectChanges();

        expect(getDayElement(today).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY when the day isn\'t today', () => {
        const today = moment();
        const notToday = today.clone().add(1, 'd').isSame(today, 'month') ?
            today.clone().add(1, 'd') :
            today.clone().subtract(1, 'd');

        testHostComp.referenceDate = today;
        fixture.detectChanges();

        expect(getDayElement(notToday).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_TODAY);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED when the day is selected', () => {
        const selectedDay = referenceDate.clone().add(5, 'd');

        testHostComp.selectedDate = selectedDay;
        fixture.detectChanges();

        expect(getDayElement(selectedDay).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED when the day isn\'t selected', () => {
        const selectedDay = referenceDate.clone().add(5, 'd');
        const notSelectedDay = referenceDate.clone().add(4, 'd');

        testHostComp.selectedDate = selectedDay;
        fixture.detectChanges();

        expect(getDayElement(notSelectedDay).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED when all days of that week area disabled', () => {
        const min = referenceDate.clone().startOf('isoWeek');
        const dateBeforeMin = min.clone().subtract(1, 'd');

        testHostComp.min = min;
        fixture.detectChanges();

        expect(getWeekElement(dateBeforeMin).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED when one or more days of week area active', () => {
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        expect(getWeekElement(min).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_DISABLED);
    });

    it('should select first available day of a week when clicking week header', () => {
        spyOn(comp.pick, 'emit');
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(min).dispatchEvent(clickEvent);

        expect(comp.pick.emit).toHaveBeenCalled();
    });

    it('should not be able to select a disabled week', () => {
        spyOn(comp.pick, 'emit');
        const min = referenceDate.clone().startOf('isoWeek');
        const dateBeforeMin = min.clone().subtract(1, 'd');

        testHostComp.min = min;
        fixture.detectChanges();

        getWeekElement(dateBeforeMin).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should generate all weeks of the month with 7 days each', () => {
        const weekRows = comp.weekRows;
        const firstDay: moment.Moment = referenceDate.clone().startOf('month').startOf('isoWeek');
        const lastDay: moment.Moment = referenceDate.clone().endOf('month').endOf('isoWeek');
        const expectedNumberOfDaysPerWeek = 7;
        const expectedNumberOfWeeks = (lastDay.diff(firstDay, 'd') + 1) / expectedNumberOfDaysPerWeek;

        expect(weekRows.length).toBe(expectedNumberOfWeeks);
        weekRows.forEach(week => {
            expect(week.days.length).toBe(expectedNumberOfDaysPerWeek);
        });
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED to first available day when hovering the week number', () => {
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(min).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(min).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getWeekElement(min).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED when hovering the week number on a week without available dates', () => {
        const min = referenceDate.clone();
        const max = referenceDate.clone().add(2, 'd');
        const disabledWeek = max.clone().add(1, 'w');
        const firstDayOfDisabledWeek = disabledWeek.clone().startOf('isoWeek');

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(disabledWeek).dispatchEvent(enterEvent);

        expect(getDayElement(firstDayOfDisabledWeek).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getWeekElement(disabledWeek).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED to first available day ' +
        'when hovering the week number and selecting start date', () => {
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(min).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(min).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getWeekElement(min).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED to last available day ' +
        'when hovering the week number and selecting end date', () => {
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(max).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(max).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getWeekElement(max).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED when transitioning from day to day', () => {
        const max = referenceDate.clone().endOf('isoWeek');
        const min = max.clone().subtract(1, 'd');

        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getDayElement(min).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(min).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);
        expect(getDayElement(max).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getDayElement(max).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(max).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);
        expect(getDayElement(min).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED);

        getDayElement(max).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START when range is selected', () => {
        const rangeSize = 5;
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        expect(getDayElement(range.start).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END when range is selected', () => {
        const rangeSize = 5;
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        expect(getDayElement(range.end).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END);
    });

    it('should add both CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START and CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END ' +
        'when range is selected with only one day', () => {
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        expect(getDayElement(range.start)).toEqual(getDayElement(range.end));
        expect(getDayElement(range.start).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START);
        expect(getDayElement(range.end).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE for all days of a selected range', () => {
        const rangeSize = 3;
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE);
            });
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE when start date is after end date', () => {
        const rangeSize = 3;
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().subtract(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE);
            });
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_START when selecting start date', () => {
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = {
            start: null,
            end: null,
        };
        fixture.detectChanges();

        expect(getDayElement(referenceDate).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_START);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_END when selecting end date', () => {
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = {
            start: null,
            end: null,
        };
        fixture.detectChanges();

        expect(getDayElement(referenceDate).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTING_END);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting end date after start date', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().add(rangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting start date before end date', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().subtract(rangeSize, 'd');
        const range = {
            start: null,
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting a later end date ' +
        'but start date was not previously selected', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().add(rangeSize, 'd');
        const range = {
            start: null,
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting a earlier start date ' +
        'but end date was not previously selected', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().subtract(rangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting a earlier end date ' +
        'but start date was not previously selected', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().subtract(rangeSize, 'd');
        const range = {
            start: null,
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when selecting a later start date ' +
        'but end date was not previously selected', () => {
        const rangeSize = 3;
        const hoverDay = referenceDate.clone().add(rangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when picking start date that is after current start date', () => {
        const rangeSize = 5;
        const hoveredRangeSize = 3;
        const hoverDay = referenceDate.clone().add(hoveredRangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(hoveredRangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE when picking end date that is before current end date', () => {
        const rangeSize = 5;
        const hoveredRangeSize = 3;
        const hoverDay = referenceDate.clone().subtract(hoveredRangeSize, 'd');
        const range = {
            start: referenceDate.clone().subtract(rangeSize, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(hoveredRangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE between start and end dates ' +
        'when picking start date that is after the end date', () => {
        const rangeSize = 5;
        const hoverDay = referenceDate.clone().subtract(rangeSize + 1, 'd');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().subtract(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE between start and end dates ' +
        'when picking end date that is before the start date', () => {
        const rangeSize = 5;
        const hoverDay = referenceDate.clone().add(rangeSize + 1, 'd');
        const range = {
            start: referenceDate.clone().add(rangeSize, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START when selecting start date and hovering a valid date', () => {
        const rangeSize = 5;
        const hoverDay = referenceDate.clone().subtract(2, 'd');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(hoverDay).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START);

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END when selecting end date and hovering a valid date', () => {
        const rangeSize = 5;
        const hoverDay = referenceDate.clone().add(2, 'd');
        const range = {
            start: referenceDate.clone().subtract(rangeSize, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(hoverDay).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END);

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED when week contains part for the range', () => {
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().endOf('isoWeek'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        expect(getWeekElement(referenceDate).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED when week does not contain part for the range', () => {
        const previousWeek = referenceDate.clone().subtract(1, 'w');
        const nextWeek = referenceDate.clone().add(1, 'w');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().endOf('isoWeek'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        expect(getWeekElement(previousWeek).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED);
        expect(getWeekElement(nextWeek).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED);
    });

    it('should add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED when week contains part for the hovered range', () => {
        const hoverDay = referenceDate.clone().add(1, 'w');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getWeekElement(hoverDay).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED);
    });

    it('should not add CSS_CLASS_DATEPICKER_CALENDAR_WEEK_SELECTED when week does not contain part for the range', () => {
        const previousWeek = referenceDate.clone().subtract(1, 'w');
        const hoverDay = referenceDate.clone().add(1, 'w');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getWeekElement(previousWeek).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED);
        expect(getWeekElement(hoverDay).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_WEEK_HOVERED);
    });

    it('should not preview hovered range when hovering disabled date', () => {
        const rangeSize = 5;
        const hoveredRangeSize = 2;
        const hoverDay = referenceDate.clone().subtract(hoveredRangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        testHostComp.disabledDates = [hoverDay];
        fixture.detectChanges();

        getDayElement(hoverDay).dispatchEvent(enterEvent);
        fixture.detectChanges();

        expect(getDayElement(hoverDay).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START);
        new Array(hoveredRangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = hoverDay.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_RANGE);
            });

        getDayElement(hoverDay).dispatchEvent(leaveEvent);
    });

    it('should not preview range selection when start is a disabled date', () => {
        const rangeSize = 5;
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        testHostComp.disabledDates = [referenceDate.clone()];
        fixture.detectChanges();

        expect(getDayElement(range.start).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_START);
        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().add(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE);
            });
    });

    it('should not preview range selection when end is a disabled date', () => {
        const rangeSize = 5;
        const range = {
            start: referenceDate.clone().subtract(rangeSize, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        testHostComp.disabledDates = [referenceDate.clone()];
        fixture.detectChanges();

        expect(getDayElement(range.end).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_HOVERED_END);
        new Array(rangeSize)
            .fill(null)
            .forEach((item, index) => {
                const day = referenceDate.clone().subtract(index, 'd');
                expect(getDayElement(day).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_RANGE);
            });
    });

    it('should emit range when selecting end date', () => {
        const spy = spyOn(comp.pick, 'emit');
        const rangeSize = 5;
        const end = referenceDate.clone().add(rangeSize, 'd');
        const range = {
            start: referenceDate.clone(),
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(end).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start.isSame(range.start, 'd')).toBeTruthy();
        expect(selectedRange.end.isSame(end, 'd')).toBeTruthy();
    });

    it('should emit range when selecting start date', () => {
        const spy = spyOn(comp.pick, 'emit');
        const rangeSize = 5;
        const start = referenceDate.clone().subtract(rangeSize, 'd');
        const range = {
            start: null,
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(start).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start.isSame(start, 'd')).toBeTruthy();
        expect(selectedRange.end.isSame(range.end, 'd')).toBeTruthy();
    });

    it('should emit range when selecting end date without start date', () => {
        const spy = spyOn(comp.pick, 'emit');
        const end = referenceDate.clone();
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(end).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start).toBeNull();
        expect(selectedRange.end.isSame(end, 'd')).toBeTruthy();
    });

    it('should emit range when selecting start date without end date', () => {
        const spy = spyOn(comp.pick, 'emit');
        const start = referenceDate.clone();
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(start).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start.isSame(start, 'd')).toBeTruthy();
        expect(selectedRange.end).toBeNull();
    });

    it('should reset end and emit range when start is selected after end', () => {
        const spy = spyOn(comp.pick, 'emit');
        const rangeSize = 5;
        const nextStart = referenceDate.clone().add(rangeSize + 1, 'd');
        const range = {
            start: referenceDate.clone(),
            end: referenceDate.clone().add(rangeSize, 'd'),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(nextStart).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start.isSame(nextStart, 'd')).toBeTruthy();
        expect(selectedRange.end).toBeNull();
    });

    it('should reset start and emit range when end is selected before start', () => {
        const spy = spyOn(comp.pick, 'emit');
        const rangeSize = 5;
        const nextEnd = referenceDate.clone().subtract(rangeSize + 1, 'd');
        const range = {
            start: referenceDate.clone().subtract(rangeSize, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        fixture.detectChanges();

        getDayElement(nextEnd).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start).toBeNull();
        expect(selectedRange.end.isSame(nextEnd, 'd')).toBeTruthy();
    });

    it('should pick first available day of the week when selecting start', () => {
        const spy = spyOn(comp.pick, 'emit');
        const min = referenceDate.clone().add(2, 'd');
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        testHostComp.min = min;
        fixture.detectChanges();

        getWeekElement(min).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.start.isSame(min, 'd')).toBeTruthy();
    });

    it('should pick last available day of the week when selecting end', () => {
        const spy = spyOn(comp.pick, 'emit');
        const max = referenceDate.clone().add(2, 'd');
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(max).dispatchEvent(clickEvent);

        const selectedRange = spy.calls.mostRecent().args[0];

        expect(comp.pick.emit).toHaveBeenCalled();
        expect(selectedRange.end.isSame(max, 'd')).toBeTruthy();
    });

    it('should not pick date when selecting start on a week without available dates', () => {
        spyOn(comp.pick, 'emit');
        const min = referenceDate.clone();
        const max = referenceDate.clone().add(2, 'd');
        const disabledWeek = min.clone().subtract(1, 'w');
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = range;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(disabledWeek).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should not pick date when selecting end on a week without available dates', () => {
        spyOn(comp.pick, 'emit');
        const min = referenceDate.clone();
        const max = referenceDate.clone().add(2, 'd');
        const disabledWeek = max.clone().add(1, 'w');
        const range = {
            start: null,
            end: null,
        };

        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        testHostComp.selectedDate = range;
        testHostComp.min = min;
        testHostComp.max = max;
        fixture.detectChanges();

        getWeekElement(disabledWeek).dispatchEvent(clickEvent);

        expect(comp.pick.emit).not.toHaveBeenCalled();
    });

    it('should not allow the selection of a date from outside that is after the maximum defined', () => {
        const max = referenceDate.clone().add(1, 'd');
        const selection: DateRange = {
            start: referenceDate.clone(),
            end: max.clone().add(1, 'd'),
        };

        testHostComp.max = max;
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = selection;
        fixture.detectChanges();

        expect(getDayElement(selection.start).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START);
        expect(getDayElement(selection.end).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END);
    });

    it('should not allow the selection of a date from outside that is before minimum defined', () => {
        const min = referenceDate.clone().subtract(1, 'd');
        const selection: DateRange = {
            start: min.clone().subtract(1, 'd'),
            end: referenceDate.clone(),
        };

        testHostComp.min = min;
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = selection;
        fixture.detectChanges();

        expect(getDayElement(selection.start).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START);
        expect(getDayElement(selection.end).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END);
    });

    it('should not allow the selection of a date from outside that matches the defines disabled dates', () => {
        const disabledDates = [referenceDate.clone().add(1, 'day')];
        const selection: DateRange = {
            start: disabledDates[0],
            end: referenceDate.clone(),
        };

        testHostComp.disabledDates = disabledDates;
        testHostComp.selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        testHostComp.selectedDate = selection;
        fixture.detectChanges();

        expect(getDayElement(selection.start).classList).not.toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_START);
        expect(getDayElement(selection.end).classList).toContain(CSS_CLASS_DATEPICKER_CALENDAR_DAY_SELECTED_END);
    });
});
