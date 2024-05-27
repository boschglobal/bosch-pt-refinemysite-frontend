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
import {SaveQuickFilterResource} from './save-quick-filter.resource';

describe('Save Quick Filter Resource', () => {
    const defaultTaskFilters = new ProjectTaskFilters();
    const defaultMilestoneFilters = new MilestoneFilters();

    it('should generate a SaveQuickFilterResource when calling fromFormData', () => {
        const saveTaskFilters = SaveProjectTaskFilters.fromProjectTaskFilters(defaultTaskFilters);
        const saveMilestoneFilters = SaveMilestoneFilters.fromMilestoneFilters(defaultMilestoneFilters);
        const useTaskCriteria = defaultTaskFilters.useCriteria;
        const useMilestoneCriteria = defaultMilestoneFilters.useCriteria;
        const name = 'My quick filter';
        const highlight = true;
        const expectedResult = Object.assign(new SaveQuickFilterResource(), {
            name,
            useTaskCriteria,
            useMilestoneCriteria,
            highlight,
            criteria: {
                tasks: saveTaskFilters,
                milestones: saveMilestoneFilters,
            },
        });

        expect(SaveQuickFilterResource.fromFormData(name, defaultTaskFilters, defaultMilestoneFilters, highlight)).toEqual(expectedResult);
    });
});
