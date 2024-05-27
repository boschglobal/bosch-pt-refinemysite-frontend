/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SaveTaskScheduleSlotResource} from '../../tasks/resources/save-task-schedule-slot.resource';
import {SaveTaskScheduleResource} from '../../tasks/resources/save-task-schedule.resource';

export class SaveTaskScheduleListItemResource extends SaveTaskScheduleResource {

    public taskId: string;

    public version: number;

    constructor(taskId: string, version: number, start: string, end: string, slots: SaveTaskScheduleSlotResource[] = []) {
        super(start, end, slots);

        this.taskId = taskId;
        this.version = version;
    }

}
