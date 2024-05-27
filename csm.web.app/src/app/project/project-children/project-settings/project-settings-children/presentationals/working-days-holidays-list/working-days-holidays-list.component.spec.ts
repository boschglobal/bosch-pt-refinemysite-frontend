/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {MOCK_WORK_DAYS} from '../../../../../../../test/mocks/workdays';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {MenuItem} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {
    CREATE_HOLIDAY_ITEM_ID,
    DELETE_HOLIDAY_ITEM_ID,
    EDIT_HOLIDAY_ITEM_ID,
    WorkingDaysHolidayAction,
    WorkingDaysHolidayData,
    WorkingDaysHolidaysListComponent
} from './working-days-holidays-list.component';

describe('Working Days Holidays List Component', () => {
    let component: WorkingDaysHolidaysListComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let fixture: ComponentFixture<WorkingDaysHolidaysListComponent>;

    const clickEvent: Event = new Event('click');

    const dataAutomationHolidayRowSelector = '[data-automation="holiday-list-item"]';
    const dataAutomationNewHolidaySelector = '[data-automation="create-holiday-button"]';

    const holidaysRowSelector = () => el.querySelectorAll(dataAutomationHolidayRowSelector);

    const workDaysHoliday = MOCK_WORK_DAYS.holidays[0];
    const workingDaysHolidayData: WorkingDaysHolidayData = {
        name: workDaysHoliday.name,
        date: moment(workDaysHoliday.date),
        dateLabel: workDaysHoliday.date,
        weekDay: `(${moment(workDaysHoliday.date).format('dddd')})`,
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [WorkingDaysHolidaysListComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        schemas: [NO_ERRORS_SCHEMA],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WorkingDaysHolidaysListComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        component.holidays = MOCK_WORK_DAYS.holidays;

        fixture.detectChanges();
    });

    it('should not set holidays list when is not provided', () => {
        component.holidays = null;

        expect(component.holidaysList).toEqual([]);
    });

    it('should set holidays list when is provided', () => {
        const result = MOCK_WORK_DAYS.holidays.map(holiday => ({
            name: holiday.name,
            date: moment(holiday.date),
            dateLabel: moment(holiday.date).format('DD MMM YYYY'),
            weekDay: `(${moment(holiday.date).format('dddd')})`,
        })).sort((a, b) => moment(a.date).isBefore(moment(b.date)) ? -1 : 1);

        component.holidays = MOCK_WORK_DAYS.holidays.reverse();

        expect(component.holidaysList).toEqual(result);
    });

    it('should render 1 row for each value in holiday list', () => {
        expect(holidaysRowSelector().length).toBe(MOCK_WORK_DAYS.holidays.length);
    });

    it('should call handleCreateNewHoliday when click create new holiday', () => {
        spyOn(component, 'handleCreateNewHoliday').and.callThrough();

        el.querySelector(dataAutomationNewHolidaySelector).dispatchEvent(clickEvent);

        expect(component.handleCreateNewHoliday).toHaveBeenCalled();
    });

    it(`should emit actionClicked with ${CREATE_HOLIDAY_ITEM_ID} id when handleCreateNewHoliday is called`, () => {
        spyOn(component.actionClicked, 'emit').and.callThrough();

        const result: WorkingDaysHolidayAction = {id: CREATE_HOLIDAY_ITEM_ID};

        component.handleCreateNewHoliday();

        expect(component.actionClicked.emit).toHaveBeenCalledWith(result);
    });

    it(`should emit actionClicked with ${EDIT_HOLIDAY_ITEM_ID} id when handleDropdownItemClicked is called`, () => {
        spyOn(component.actionClicked, 'emit').and.callThrough();

        const optionEdit = component.actions[0].items[0];
        const result: WorkingDaysHolidayAction = {
            id: EDIT_HOLIDAY_ITEM_ID,
            holiday: workDaysHoliday,
        };

        const editOption: MenuItem = {
            id: optionEdit.id,
            label: optionEdit.label,
            type: optionEdit.type,
        };

        component.handleDropdownItemClicked(editOption, workingDaysHolidayData);

        expect(component.actionClicked.emit).toHaveBeenCalledWith(result);
    });

    it(`should emit actionClicked with ${DELETE_HOLIDAY_ITEM_ID} id when handleDropdownItemClicked is called`, () => {
        spyOn(component.actionClicked, 'emit').and.callThrough();

        const optionDelete = component.actions[0].items[1];
        const result: WorkingDaysHolidayAction = {
            id: DELETE_HOLIDAY_ITEM_ID,
            holiday: workDaysHoliday,
        };

        const deleteOption: MenuItem = {
            id: optionDelete.id,
            label: optionDelete.label,
            type: optionDelete.type,
        };

        component.handleDropdownItemClicked(deleteOption, workingDaysHolidayData);

        expect(component.actionClicked.emit).toHaveBeenCalledWith(result);
    });

    it(`should return false showCreateButton when list have max length`, () => {
        component.holidays = new Array(200).fill(MOCK_WORK_DAYS.holidays[0]);

        expect(component.showCreateButton).toBeFalsy();
    });

    it(`should return true showCreateButton when list do not have max length`, () => {
        expect(component.showCreateButton).toBeTruthy();
    });

    it('should return name and date as a string of working days holiday ', () => {
        const expectedResult = workDaysHoliday.name + moment(workDaysHoliday.date);

        expect(component.trackByFn(null, workingDaysHolidayData)).toBe(expectedResult);
    });
});
