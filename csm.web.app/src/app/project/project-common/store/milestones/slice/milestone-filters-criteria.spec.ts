/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {CommonFilterFormData} from '../../../containers/common-filter-capture/common-filter-capture.component';
import {MilestoneFilterFormData} from '../../../containers/milestone-filter-capture/milestone-filter-capture.component';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';
import {
    MilestoneFiltersCriteria,
    MilestoneFiltersCriteriaType,
    MilestoneFiltersCriteriaWorkArea
} from './milestone-filters-criteria';

describe('Milestone Filters Criteria', () => {
    const milestoneFilters: MilestoneFilterFormData = {
        types: [MilestoneTypeEnum.Project],
        projectCraftIds: [],
    };
    const milestoneFiltersWithCraftIds: MilestoneFilterFormData = {
        types: [MilestoneTypeEnum.Project],
        projectCraftIds: ['123'],
    };
    const milestoneFiltersWithoutCraftsIds: MilestoneFilterFormData = {
        types: [MilestoneTypeEnum.Project],
    };
    const commonFilters: CommonFilterFormData = {
        range: {
            start: moment('2021-09-08'),
            end: null,
        },
        workArea: {
            workAreaIds: ['123'],
            header: true,
        },
    };

    it('should generate a MilestoneFiltersCriteria when calling fromFormData', () => {
        const {range: {start: from, end: to}, workArea: {workAreaIds, header}} = commonFilters;
        const {types: selectedTypes, projectCraftIds} = milestoneFilters;
        const types = Object.assign(new MilestoneFiltersCriteriaType(), {types: selectedTypes, projectCraftIds});
        const workAreas = Object.assign(new MilestoneFiltersCriteriaWorkArea(), {workAreaIds, header});
        const expectedResult = Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria>(
            new MilestoneFiltersCriteria(),
            {
                from,
                to,
                types,
                workAreas,
            }
        );

        expect(MilestoneFiltersCriteria.fromFormData(milestoneFilters, commonFilters)).toEqual(expectedResult);
    });

    it('should generate a MilestoneFiltersCriteria with Craft type when there are projectCraftIds', () => {
        const {range: {start: from, end: to}, workArea: {workAreaIds, header}} = commonFilters;
        const {types: selectedTypes, projectCraftIds} = milestoneFiltersWithCraftIds;
        const allSelectedTypes: MilestoneTypeEnum[] = [
            ...selectedTypes,
            MilestoneTypeEnum.Craft,
        ];
        const types = Object.assign(new MilestoneFiltersCriteriaType(), {types: allSelectedTypes, projectCraftIds});
        const workAreas = Object.assign(new MilestoneFiltersCriteriaWorkArea(), {workAreaIds, header});
        const expectedResult = Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria>(
            new MilestoneFiltersCriteria(),
            {
                from,
                to,
                types,
                workAreas,
            }
        );

        expect(MilestoneFiltersCriteria.fromFormData(milestoneFiltersWithCraftIds, commonFilters)).toEqual(expectedResult);
    });

    it('should generate a MilestoneFiltersCriteria without craft types when there are no projectCraftIds', () => {
        const {range: {start: from, end: to}, workArea: {workAreaIds, header}} = commonFilters;
        const types = Object.assign(new MilestoneFiltersCriteriaType(), {types: milestoneFiltersWithoutCraftsIds.types});
        const workAreas = Object.assign(new MilestoneFiltersCriteriaWorkArea(), {workAreaIds, header});
        const expectedResult = Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria>(
            new MilestoneFiltersCriteria(),
            {
                from,
                to,
                types,
                workAreas,
            }
        );

        expect(MilestoneFiltersCriteria.fromFormData(milestoneFiltersWithoutCraftsIds, commonFilters)).toEqual(expectedResult);
    });
});
