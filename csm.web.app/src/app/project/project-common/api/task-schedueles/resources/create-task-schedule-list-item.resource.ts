/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SaveTaskScheduleResource} from '../../tasks/resources/save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from '../../tasks/resources/save-task-schedule-slot.resource';

export class CreateTaskScheduleListItemResource extends SaveTaskScheduleResource {

    public id?: string;

    public taskId: string;

    constructor(taskId: string, start: string, end: string, slots: SaveTaskScheduleSlotResource[] = [], id?: string) {
        super(start, end, slots);

        this.id = id;
        this.taskId = taskId;
    }

}
