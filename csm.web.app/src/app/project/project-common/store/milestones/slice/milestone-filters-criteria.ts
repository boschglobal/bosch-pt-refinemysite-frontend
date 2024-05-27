/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {union} from 'lodash';
import * as moment from 'moment';

import {CommonFilterFormData} from '../../../containers/common-filter-capture/common-filter-capture.component';
import {MilestoneFilterFormData} from '../../../containers/milestone-filter-capture/milestone-filter-capture.component';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';

export class MilestoneFiltersCriteriaWorkArea {
    public header = false;
    public workAreaIds: string[] = [];
}

export class MilestoneFiltersCriteriaType {
    public projectCraftIds: string[] = [];
    public types: MilestoneTypeEnum[] = [];
}

export class MilestoneFiltersCriteria {
    public from?: moment.Moment = null;
    public to?: moment.Moment = null;
    public workAreas = new MilestoneFiltersCriteriaWorkArea();
    public types = new MilestoneFiltersCriteriaType();

    public static fromFormData(milestoneFilters: MilestoneFilterFormData,
                               commonFilters: CommonFilterFormData): MilestoneFiltersCriteria {
        const {range: {start: from, end: to}, workArea: {workAreaIds, header}} = commonFilters;
        const {types: selectedTypes, projectCraftIds} = milestoneFilters;
        const allSelectedTypes = projectCraftIds?.length ? union(selectedTypes, [MilestoneTypeEnum.Craft]) : selectedTypes;
        const workAreas = Object.assign(new MilestoneFiltersCriteriaWorkArea(),{workAreaIds, header});
        const types = Object.assign(new MilestoneFiltersCriteriaType(), {types: allSelectedTypes, projectCraftIds: projectCraftIds || []});

        return Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria>(
            new MilestoneFiltersCriteria(),
            {
                from,
                to,
                workAreas,
                types,
            }
        );
    }
}
