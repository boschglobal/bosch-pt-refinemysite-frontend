/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {TaskCalendarSortingModeEnum} from '../../../enums/task-calendar-sorting-mode.enum';
import {TaskCalendarTaskViewModeEnum} from '../../../enums/task-calendar-task-view-mode.enum';
import {TaskCardDescriptionTypeEnum} from '../../../enums/task-card-description-type.enum';

export class CalendarUserSettings {
    public showDayCardIndicators = false;
    public showDependencyLines = false;
    public showUnreadNews = false;
    public sortingMode = TaskCalendarSortingModeEnum.Default;
    public taskCardDescriptionType = TaskCardDescriptionTypeEnum.Company;
    public taskViewMode: TaskCalendarTaskViewModeEnum = TaskCalendarTaskViewModeEnum.Week;
}
