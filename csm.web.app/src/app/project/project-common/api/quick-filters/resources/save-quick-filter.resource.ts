/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MilestoneFilters} from '../../../store/milestones/slice/milestone-filters';
import {ProjectTaskFilters} from '../../../store/tasks/slice/project-task-filters';
import {SaveProjectTaskFilters} from '../../../store/tasks/slice/save-project-task-filters';
import {SaveMilestoneFilters} from '../../milestones/resources/save-milestone-filters';
import {SaveProjectFiltersCriteriaResource} from '../../misc/resources/save-project-filters-criteria.resource';

export class SaveQuickFilterResource {
    public name: string;
    public criteria: SaveProjectFiltersCriteriaResource;
    public useMilestoneCriteria: boolean;
    public useTaskCriteria: boolean;
    public highlight: boolean;

    public static fromFormData(name: string,
                               taskFilters: ProjectTaskFilters,
                               milestoneFilters: MilestoneFilters,
                               highlight: boolean): SaveQuickFilterResource {
        const useTaskCriteria = taskFilters.useCriteria;
        const useMilestoneCriteria = milestoneFilters.useCriteria;
        const saveTaskFilters = SaveProjectTaskFilters.fromProjectTaskFilters(taskFilters);
        const saveMilestoneFilters = SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters);

        return Object.assign<SaveQuickFilterResource, SaveQuickFilterResource>(new SaveQuickFilterResource(), {
            name,
            useTaskCriteria,
            useMilestoneCriteria,
            highlight,
            criteria: {
                tasks: saveTaskFilters,
                milestones: saveMilestoneFilters,
            },
        });
    }
}
