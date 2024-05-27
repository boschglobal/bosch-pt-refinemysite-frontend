/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../shared/rest/constants/date-format.constant';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';
import {MilestoneFilters} from '../../../store/milestones/slice/milestone-filters';

interface MilestoneFiltersWorkArea {
    header: boolean;
    workAreaIds: string[];
}

interface MilestoneFiltersType {
    projectCraftIds: string[];
    types: MilestoneTypeEnum[];
}

export class SaveMilestoneFilters {
    constructor(public from: string,
                public to: string,
                public workAreas: MilestoneFiltersWorkArea,
                public types: MilestoneFiltersType,
                public milestoneListIds?: string[]) {
    }

    public static fromMilestoneFilters(filters: MilestoneFilters, milestoneListIds?: string[]): SaveMilestoneFilters {
        const {from, to, workAreas, types} = filters.criteria;

        return new SaveMilestoneFilters(
            from?.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            to?.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            workAreas,
            types,
            milestoneListIds,
        );
    }
}
