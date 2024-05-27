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
    Output
} from '@angular/core';
import * as moment from 'moment';

import {CalendarScopeHelper} from '../../../../../shared/misc/helpers/calendar-scope.helper';
import {DateParserStrategy} from '../../../../../shared/ui/dates/date-parser.strategy';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {
    TasksCalendarModeEnum,
    TasksCalendarModeEnumHelper
} from '../../../../project-common/enums/tasks-calendar-mode.enum';

const TASK_CALENDAR_MODE_GROUP: { [key in TasksCalendarModeEnum]: 'lookahead' | 'roadmap' } = {
    [TasksCalendarModeEnum.FourWeeks]: 'lookahead',
    [TasksCalendarModeEnum.SixWeeks]: 'lookahead',
    [TasksCalendarModeEnum.EighteenWeeks]: 'roadmap',
    [TasksCalendarModeEnum.TwentySixWeeks]: 'roadmap',
};

@Component({
    selector: 'ss-tasks-calendar-mappings',
    templateUrl: './tasks-calendar-mappings.component.html',
    styleUrls: ['./tasks-calendar-mappings.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksCalendarMappingsComponent {

    @Input()
    public scopeStart: moment.Moment;

    @Input()
    public set mode(mode: TasksCalendarModeEnum) {
        this.selectedMode = mode;
        this.scopeDuration = this._calendarScopeHelper.getModeDuration(mode);

        this._setModeItems();
    }

    @Output()
    public collapseWeeks: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public modeChange: EventEmitter<TasksCalendarModeEnum> = new EventEmitter<TasksCalendarModeEnum>();

    @Output()
    public scopeStartChange: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

    @Output()
    public todayButtonClicked: EventEmitter<void> = new EventEmitter<void>();

    public modeItems: MenuItemsList[] = [];

    public scopeDuration: number;

    public selectedMode: TasksCalendarModeEnum;

    constructor(private _calendarScopeHelper: CalendarScopeHelper,
                private _dateParser: DateParserStrategy) {
    }

    public handleMenuItemClicked(item: MenuItem): void {
        if (this._newModeIsAlreadySelected(item)) {
            return;
        }

        this.modeChange.emit(item.value);
    }

    public handleScopeStartChange(start: moment.Moment = moment()): void {
        if (this._newStartAlreadySelected(start)) {
            return;
        }

        this._updateCalendarParameters(start);
        this.collapseWeeks.emit();
    }

    public handleTodayClicked(): void {
        this.handleScopeStartChange();
        this.todayButtonClicked.emit();
    }

    public handleWeekNavigation(difference: number): void {
        this._updateCalendarParameters(this.scopeStart.clone().add(difference, 'w'));
    }

    private _updateCalendarParameters(date: moment.Moment): void {
        this.scopeStartChange.emit(this._dateParser.startOfWeek(date));
    }

    private _newModeIsAlreadySelected(item: MenuItem): boolean {
        return item.value === this.selectedMode;
    }

    private _newStartAlreadySelected(newStart: moment.Moment): boolean {
        return this._dateParser.isSame(this.scopeStart, newStart, 'w');
    }

    private _setModeItems(): void {
        const items: MenuItem[] = TasksCalendarModeEnumHelper.getMenuItems('select-icon').map(item => ({
            ...item,
            selected: this.selectedMode === item.value,
        }));

        const lookAheadItems: MenuItem[] = items.filter(item => TASK_CALENDAR_MODE_GROUP[item.value] === 'lookahead');
        const roadmapItems: MenuItem[] = items.filter(item => TASK_CALENDAR_MODE_GROUP[item.value] === 'roadmap');

        this.modeItems = [
            {
                items: lookAheadItems,
                title: 'TasksCalendar_LookAhead_Title',
            },
            {
                items: roadmapItems,
                title: 'TasksCalendar_Roadmap_Title',
            },
        ];
    }
}
