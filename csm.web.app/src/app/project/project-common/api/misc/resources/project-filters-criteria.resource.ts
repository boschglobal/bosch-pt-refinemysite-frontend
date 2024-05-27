/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MilestoneFiltersCriteria} from '../../../store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFiltersCriteria} from '../../../store/tasks/slice/project-task-filters-criteria';

export class ProjectFiltersCriteriaResource {
    public tasks: ProjectTaskFiltersCriteria = new ProjectTaskFiltersCriteria();
    public milestones: MilestoneFiltersCriteria = new MilestoneFiltersCriteria();
}
