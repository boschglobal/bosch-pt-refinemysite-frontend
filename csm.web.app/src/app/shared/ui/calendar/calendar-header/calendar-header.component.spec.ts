/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {MOCK_WORK_DAYS} from '../../../../../test/mocks/workdays';
import {DateParserStrategyStub} from '../../../../../test/stubs/date-parser.strategy.stub';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {WeekDaysEnum} from '../../../misc/enums/weekDays.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../rest/constants/date-format.constant';
import {TranslationModule} from '../../../translation/translation.module';
import {DateParserStrategy} from '../../dates/date-parser.strategy';
import {
    CalendarHeaderComponent,
    CalendarHeaderData,
    CalendarHeaderWeekDay,
    CSS_CLASS_WEEK_DAY_CURRENT,
    CSS_CLASS_WEEK_DAY_FOCUSED,
    CSS_CLASS_WEEK_DAY_NON_WORKING_DAY,
} from './calendar-header.component';

describe('Calendar Header Component', () => {
    let fixture: ComponentFixture<CalendarHeaderComponent>;
    let comp: CalendarHeaderComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let translateService: TranslateServiceStub;
    let changeDetectorRef: ChangeDetectorRef;

    const dataAutomationHeader = '[data-automation="calendar-header-header"]';
    const dataAutomationHeaderSubtitle = '[data-automation="calendar-header-subtitle"]';
    const dataAutomationWeekDay = '[data-automation="calendar-header-week-day"]';
    const dataAutomationWeekDayLabel = '[data-automation="calendar-header-week-day-label"]';
    const dataAutomationMilestoneMarker = '[data-automation="calendar-header-milestone-marker"]';

    const week = moment('2018-05-19');
    const firstDay: moment.Moment = week.clone().startOf('week');
    const lastDay: moment.Moment = week.clone().endOf('week');
    const numberOfWeekDays = Math.ceil(lastDay.diff(firstDay, 'd', true));
    const daySlotsWithMilestones = new Array(numberOfWeekDays).fill(false);

    const getElement = (selector: string): Element => el.querySelector(selector);
    const getElements = (selector: string): any => el.querySelectorAll(selector);
    const getNativeElement = (selector: string) => de.query(By.css(selector)).nativeElement;
    const clickEvent: Event = new Event('click');

    const WEEK_DAYS_COMPONENT_SORTED = [
        WeekDaysEnum.SUNDAY,
        WeekDaysEnum.MONDAY,
        WeekDaysEnum.TUESDAY,
        WeekDaysEnum.WEDNESDAY,
        WeekDaysEnum.THURSDAY,
        WeekDaysEnum.FRIDAY,
        WeekDaysEnum.SATURDAY,
    ];

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [TranslationModule],
        declarations: [
            CalendarHeaderComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
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
        fixture = TestBed.createComponent(CalendarHeaderComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);

        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);

        comp.week = week;
        comp.workingDays = MOCK_WORK_DAYS.workingDays;
        comp.daySlotsWithMilestones = daySlotsWithMilestones;

        changeDetectorRef.detectChanges();
        fixture.detectChanges();
    });

    afterEach(() => {
        translateService.setDefaultLang('en');
    });

    it('should emit headerClick when user clicks on the header', () => {
        spyOn(comp, 'handleHeaderClick').and.callThrough();
        spyOn(comp.headerClick, 'emit').and.callThrough();

        getElement(dataAutomationHeader).dispatchEvent(clickEvent);

        expect(comp.handleHeaderClick).toHaveBeenCalled();
        expect(comp.headerClick.emit).toHaveBeenCalled();
    });

    it('should format month and week day labels when language changes and header is expanded', () => {
        const expectedDEWeekLabel = 'Mai';
        const expectedDEWeekDayLabels = ['So. 13', 'Mo. 14', 'Di. 15', 'Mi. 16', 'Do. 17', 'Fr. 18', 'Sa. 19'];

        comp.isExpanded = true;

        translateService.setDefaultLang('de');
        fixture.detectChanges();

        const weekDayLabelsAfterLangChange = comp.parsedWeek.days.map(day => day.label);

        expect(comp.parsedWeek.week.monthLabel).toBe(expectedDEWeekLabel);
        expect(weekDayLabelsAfterLangChange).toEqual(expectedDEWeekDayLabels);
    });

    it('should format month and week day labels when language changes and header is collapsed', () => {
        const expectedDEWeekLabel = 'Mai';
        const expectedDEWeekDayLabels = ['13', '14', '15', '16', '17', '18', '19'];

        comp.isExpanded = false;

        translateService.setDefaultLang('de');
        fixture.detectChanges();

        const weekDayLabelsAfterLangChange = comp.parsedWeek.days.map(day => day.label);

        expect(comp.parsedWeek.week.monthLabel).toBe(expectedDEWeekLabel);
        expect(weekDayLabelsAfterLangChange).toEqual(expectedDEWeekDayLabels);
    });

    it('should contain modifier class on the header element when week is the current one', () => {
        const modifierClass = 'ss-calendar-header__header--active';

        comp.week = moment();

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationHeader).classList).toContain(modifierClass);
    });

    it('should not contain modifier class on the header element when week is not the current one', () => {
        const modifierClass = 'ss-calendar-header__header--active';

        comp.week = moment().subtract(1, 'w');

        changeDetectorRef.detectChanges();

        expect(getElement(dataAutomationHeader).classList).not.toContain(modifierClass);
    });

    it('should contain modifier class on day element if day is the current one', () => {
        const today = moment();
        const todayDaySlotIndex = today.weekday();

        comp.week = today;

        changeDetectorRef.detectChanges();

        expect(getElements(dataAutomationWeekDay)[todayDaySlotIndex].classList).toContain(CSS_CLASS_WEEK_DAY_CURRENT);
    });

    it('should not contain modifier class on day element if day is not the current one', () => {
        const today = moment();
        const todayDaySlotIndex = today.weekday();

        comp.week = today;

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDayLabel))
            .filter((day, index) => index !== todayDaySlotIndex);

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) => {
            expect(dayElement.classList).not.toContain(CSS_CLASS_WEEK_DAY_CURRENT);
        });
    });

    it('should contain modifier class on day element if day is not a working day', () => {
        const workDaysSlotsIndex = MOCK_WORK_DAYS.workingDays.map(workingDay => WEEK_DAYS_COMPONENT_SORTED.indexOf(workingDay));

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDay))
            .filter((day, index) => !workDaysSlotsIndex.includes(index));

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) =>
            expect(dayElement.classList).toContain(CSS_CLASS_WEEK_DAY_NON_WORKING_DAY));
    });

    it('should not contain modifier class on day element if day is a working day', () => {
        const workDaysSlotsIndex = MOCK_WORK_DAYS.workingDays.map(workingDay => WEEK_DAYS_COMPONENT_SORTED.indexOf(workingDay));
        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDayLabel))
            .filter((day, index) => workDaysSlotsIndex.includes(index));

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) =>
            expect(dayElement.classList).not.toContain(CSS_CLASS_WEEK_DAY_NON_WORKING_DAY));
    });

    it('should contain modifier class on day element if day is a holiday', () => {
        const date = moment();
        const holidaySlotIndex = date.weekday();
        const holiday = {
            name: 'Test',
            date: date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };

        comp.week = date;
        comp.holidays = [holiday];

        changeDetectorRef.detectChanges();

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDay))
            .filter((day, index) => index === holidaySlotIndex);

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) =>
            expect(dayElement.classList).toContain(CSS_CLASS_WEEK_DAY_NON_WORKING_DAY));
    });

    it('should not contain modifier class on day element if day is not a holiday', () => {
        const date = moment();
        const holidaySlotIndex = date.weekday();
        const holiday = {
            name: 'Test',
            date: date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
        };

        comp.week = date;
        comp.holidays = [holiday];
        comp.workingDays = Object.keys(WeekDaysEnum) as WeekDaysEnum[];

        changeDetectorRef.detectChanges();

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDayLabel))
            .filter((day, index) => index !== holidaySlotIndex);

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) =>
            expect(dayElement.classList).not.toContain(CSS_CLASS_WEEK_DAY_NON_WORKING_DAY));
    });

    it('should add milestone marker element if day slot has milestones', () => {
        const daySlotsWithMilestonesIndex = 2;
        const currentDaySlotsWithMilestones = [...daySlotsWithMilestones];

        currentDaySlotsWithMilestones[daySlotsWithMilestonesIndex] = true;
        comp.daySlotsWithMilestones = currentDaySlotsWithMilestones;

        changeDetectorRef.detectChanges();

        expect(getElements(dataAutomationWeekDay)[daySlotsWithMilestonesIndex].querySelector(dataAutomationMilestoneMarker)).not.toBeNull();
    });

    it('should not add milestone marker element if day slot has no milestones', () => {
        const daySlotsWithMilestonesIndex = 2;
        const currentDaySlotsWithMilestones = [...daySlotsWithMilestones];

        currentDaySlotsWithMilestones[daySlotsWithMilestonesIndex] = true;
        comp.daySlotsWithMilestones = currentDaySlotsWithMilestones;

        changeDetectorRef.detectChanges();

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDay))
            .filter((day, index) => index !== daySlotsWithMilestonesIndex);

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) =>
            expect(dayElement.querySelector(dataAutomationMilestoneMarker)).toBeNull());
    });

    it('should contain modifier class on day element if day is focused', () => {
        const focusedDayIndex = 2;

        comp.focusedDay = week.clone().startOf('week').add(focusedDayIndex, 'd');

        changeDetectorRef.detectChanges();

        expect(getElements(dataAutomationWeekDay)[focusedDayIndex].classList).toContain(CSS_CLASS_WEEK_DAY_FOCUSED);
    });

    it('should not contain modifier class on day element if day is not focused', () => {
        const focusedDayIndex = 2;

        comp.focusedDay = week.clone().startOf('week').add(focusedDayIndex, 'd');

        changeDetectorRef.detectChanges();

        const filteredWeekDaySlots = Array
            .from(getElements(dataAutomationWeekDayLabel))
            .filter((day, index) => index !== focusedDayIndex);

        filteredWeekDaySlots.forEach((dayElement: HTMLElement) => expect(dayElement.classList).not.toContain(CSS_CLASS_WEEK_DAY_FOCUSED));
    });

    it('should render correct subtitle label for month when week spans for more then 1 month', () => {
        const expectedResult = 'Nov / Dec';
        const weekSpansFor2Months = moment('2020-11-30');

        comp.week = weekSpansFor2Months;

        changeDetectorRef.detectChanges();

        expect(getNativeElement(dataAutomationHeaderSubtitle).innerText).toBe(expectedResult);
    });

    it('should return the day.number when we call trackByDay', () => {
        const expectedResult = '1';
        const day: CalendarHeaderWeekDay = {
            number: '1',
            label: '1',
            classes: null,
            dayHasMilestones: null,
        };

        expect(comp.trackByDay(null, day)).toBe(expectedResult);
    });

    describe('Calendar Header Component - Today line', () => {
        const boldFontFamily = 'RmS-Bold, sans-serif';
        const lightBlue = 'rgb(0, 142, 207)';
        const today = moment();
        const todayDaySlotIndex = today.weekday();

        beforeEach(() => {
            comp.week = today;
            comp.lowestCalendarRelatedHeight = 500;
            changeDetectorRef.detectChanges();
        });

        it('should have lightblue color and bold font family in current day label when day is current day', () => {
            const currentWeekDayLabel = getComputedStyle(getElements(dataAutomationWeekDayLabel)[todayDaySlotIndex]);

            expect(currentWeekDayLabel.color).toBe(lightBlue);
            expect(currentWeekDayLabel.fontFamily).toBe(boldFontFamily);
        });

        it('should not have lightblue color or bold font family in day label when day is not current day', () => {
            const filteredWeekDaySlots = Array
                .from(getElements(dataAutomationWeekDay))
                .filter((day, index) => index !== todayDaySlotIndex);

            filteredWeekDaySlots.forEach((dayElement: HTMLElement) => {
                expect(getComputedStyle(dayElement).color).not.toBe(lightBlue);
                expect(getComputedStyle(dayElement).fontFamily).not.toBe(boldFontFamily);
            });
        });

        it('should set today line height on :before when the day is the current day', () => {
            const currentWeekDayLabel = getComputedStyle(getElements(dataAutomationWeekDay)[todayDaySlotIndex], ':before');
            const expectedHeight = '469px';

            expect(comp.todayLineHeight).toBe(expectedHeight);
            expect(currentWeekDayLabel.height).toBe(expectedHeight);
        });

        it('should update today line height on :before when the lowestCalendarRelatedHeight changes', () => {
            const expectedHeightBeforeChanging = '469px';
            const expectedHeightAfterChanging = '569px';

            comp.lowestCalendarRelatedHeight = 500;
            changeDetectorRef.detectChanges();
            expect(comp.todayLineHeight).toBe(expectedHeightBeforeChanging);

            comp.lowestCalendarRelatedHeight = 600;
            changeDetectorRef.detectChanges();
            expect(comp.todayLineHeight).toBe(expectedHeightAfterChanging);
        });

        it('should not set today line height on :before when day is not current day', () => {
            const expectedHeight = 'auto';
            const filteredWeekDaySlots = Array
                .from(getElements(dataAutomationWeekDay))
                .filter((day, index) => index !== todayDaySlotIndex);

            filteredWeekDaySlots.forEach((dayElement: HTMLElement) => {
                expect(getComputedStyle(dayElement, ':before').height).toBe(expectedHeight);
            });
        });

        it('should set today line height when ngAfterViewInit is called', () => {
            const expectedHeight = '469px';
            comp.todayLineHeight = null;

            comp.ngAfterViewInit();

            expect(comp.todayLineHeight).toBe(expectedHeight);
        });

        it('should not set today line height when week is not the current one', () => {
            comp.todayLineHeight = null;
            comp.parsedWeek = {...comp.parsedWeek, week: {isCurrent: false}} as CalendarHeaderData;
            fixture.detectChanges();

            comp.ngAfterViewInit();

            expect(comp.todayLineHeight).toBeNull();
        });
    });
});
