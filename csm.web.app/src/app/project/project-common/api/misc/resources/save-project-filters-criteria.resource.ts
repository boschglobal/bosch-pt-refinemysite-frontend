/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {SaveProjectTaskFilters} from '../../../store/tasks/slice/save-project-task-filters';
import {SaveMilestoneFilters} from '../../milestones/resources/save-milestone-filters';

export class SaveProjectFiltersCriteriaResource {
    public tasks: SaveProjectTaskFilters;
    public milestones: SaveMilestoneFilters;
}
