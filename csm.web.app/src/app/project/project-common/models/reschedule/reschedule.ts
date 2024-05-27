/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    MilestonesAndTasksIds,
    RescheduleResource
} from '../../api/reschedule/resources/reschedule.resource';
import {Milestone} from '../milestones/milestone';
import {Task} from '../tasks/task';

export class Reschedule {
    public successful: MilestonesAndTasksIds;
    public failed: {
        milestones: Milestone[];
        tasks: Task[];
    };

    public static fromRescheduleResource(
        rescheduleResource: RescheduleResource,
        failedTasks: Task[] = [],
        failedMilestones: Milestone[] = []): Reschedule {
        const reschedule = new Reschedule();

        reschedule.successful = rescheduleResource.successful;
        reschedule.failed = {
            milestones: failedMilestones,
            tasks: failedTasks,
        };

        return reschedule;
    }
}
