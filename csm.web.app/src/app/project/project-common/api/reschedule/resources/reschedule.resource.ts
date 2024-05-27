/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

export interface MilestonesAndTasksIds {
    milestones: string[];
    tasks: string[];
}

export class RescheduleResource {
    public successful: MilestonesAndTasksIds;
    public failed: MilestonesAndTasksIds;
}
