/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {AbstractFilters} from '../../../../../shared/misc/store/datatypes/abstract-filters.datatype';
import {WORKAREA_UUID_EMPTY} from '../../../constants/workarea.constant';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';
import {Milestone} from '../../../models/milestones/milestone';
import {MilestoneFiltersCriteria} from './milestone-filters-criteria';

export class MilestoneFilters extends AbstractFilters {

    constructor(public criteria: MilestoneFiltersCriteria = new MilestoneFiltersCriteria(),
                public useCriteria: boolean = true,
                public highlight: boolean = false) {
        super();
    }

    public matchMilestone(milestone: Milestone): boolean {
        return this.matchMilestoneDate(milestone)
            && this.matchMilestoneType(milestone)
            && this.matchMilestoneWorkArea(milestone);
    }

    public matchMilestoneDate(milestone: Milestone): boolean {
        const {from, to} = this.criteria;

        return (!from && !to)
            || (!!from && !!to && moment(milestone.date).isBetween(from, to, 'd', '[]'))
            || (!!from && !to && moment(milestone.date).isSameOrAfter(from, 'd'))
            || (!from && !!to && moment(milestone.date).isSameOrBefore(to, 'd'));
    }

    public matchMilestoneType(milestone: Milestone): boolean {
        const {projectCraftIds, types} = this.criteria.types;
        const nonCraftTypes = types.filter(type => type !== MilestoneTypeEnum.Craft);

        return types.length === 0
            || nonCraftTypes.includes(milestone.type)
            || (milestone.type === MilestoneTypeEnum.Craft
                && types.includes(MilestoneTypeEnum.Craft)
                && projectCraftIds.includes(milestone.craft.id));
    }

    public matchMilestoneWorkArea(milestone: Milestone): boolean {
        const {workAreaIds, header} = this.criteria.workAreas;
        const noFiltersApplied = !header && !workAreaIds.length;
        const headerMatch = header && milestone.header;
        const workAreaMatch = !milestone.header && workAreaIds.includes(milestone.workArea?.id || WORKAREA_UUID_EMPTY);

        return noFiltersApplied || workAreaMatch || headerMatch;
    }
}
