/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment/moment';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../../shared/rest/constants/date-format.constant';
import {
    MenuItem,
    MenuItemsList
} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {WorkDaysHoliday} from '../../../../../project-common/api/work-days/resources/work-days.resource';

export const CREATE_HOLIDAY_ITEM_ID = 'create-holiday';
export const DELETE_HOLIDAY_ITEM_ID = 'delete-holiday';
export const EDIT_HOLIDAY_ITEM_ID = 'edit-holiday';

@Component({
    selector: 'ss-working-days-holidays-list',
    templateUrl: './working-days-holidays-list.component.html',
    styleUrls: ['./working-days-holidays-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingDaysHolidaysListComponent {

    @Input()
    public set holidays(list: WorkDaysHoliday[]) {
        this._setHolidayList(list || []);
    }

    @Output()
    public actionClicked = new EventEmitter<WorkingDaysHolidayAction>();

    public actions: MenuItemsList[] = [{
        items: [{
            id: EDIT_HOLIDAY_ITEM_ID,
            type: 'button',
            label: 'Generic_EditDetails',
        },
        {
            id: DELETE_HOLIDAY_ITEM_ID,
            type: 'button',
            label: 'WorkingDays_DeleteNonWorkingDays_Title',
        }],
    }];

    public holidaysList: WorkingDaysHolidayData[] = [];

    public showCreateButton: boolean;

    private _currentLang: string;

    private _maxHolidays = 200;

    constructor(private _translateService: TranslateService) {
        this._setCurrentLang();
    }

    public handleDropdownItemClicked(item: MenuItem, holidayData: WorkingDaysHolidayData): void {
        const workingDayHolidayAction: WorkingDaysHolidayAction = {
            id: item.id,
            holiday: {name: holidayData.name, date: moment(holidayData.date).format(API_DATE_YEAR_MONTH_DAY_FORMAT)},
        };

        this.actionClicked.emit(workingDayHolidayAction);
    }

    public handleCreateNewHoliday(): void {
        const workingDayHolidayAction: WorkingDaysHolidayAction = {
            id: CREATE_HOLIDAY_ITEM_ID,
        };

        this.actionClicked.emit(workingDayHolidayAction);
    }

    public trackByFn(index: number, value: WorkingDaysHolidayData): string {
        return value.name + value.date;
    }

    private _setCurrentLang(): void {
        this._currentLang = this._translateService.defaultLang;
    }

    private _setHolidayList(list: WorkDaysHoliday[]): void {
        this.holidaysList = list
            .map(holiday => ({
                name: holiday.name,
                date: moment(holiday.date),
                dateLabel: moment(holiday.date).format('DD MMM YYYY'),
                weekDay: `(${moment(holiday.date).locale(this._currentLang).format('dddd')})`,
            }))
            .sort((a, b) => a.date.isBefore(b.date) ? -1 : 1);

        this.showCreateButton = this.holidaysList.length < this._maxHolidays;
    }
}

export interface WorkingDaysHolidayData {
    name: string;
    date: moment.Moment;
    dateLabel: string;
    weekDay: string;
}

export interface WorkingDaysHolidayAction {
    id: string;
    holiday?: WorkDaysHoliday;
}
