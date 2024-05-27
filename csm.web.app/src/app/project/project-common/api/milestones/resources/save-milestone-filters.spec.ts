/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {MOCK_MILESTONE_FILTERS} from '../../../../../../test/mocks/milestones';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {SaveMilestoneFilters} from './save-milestone-filters';

describe('Save Milestone Filters', () => {
    const milestoneFilters = MOCK_MILESTONE_FILTERS;

    it('should generate SaveMilestoneFilters from MilestoneFilters', () => {
        const {from, to, workAreas, types} = milestoneFilters.criteria;
        const milestoneListIds = ['foo', 'bar'];
        const expectedResult = new SaveMilestoneFilters(
            from.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            to.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            workAreas,
            types,
            milestoneListIds,
        );

        expect(SaveMilestoneFilters.fromMilestoneFilters(milestoneFilters, milestoneListIds)).toEqual(expectedResult);
    });
});
