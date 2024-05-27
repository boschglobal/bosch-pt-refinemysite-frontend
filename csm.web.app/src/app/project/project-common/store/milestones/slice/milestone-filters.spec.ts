/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    MOCK_MILESTONE_RESOURCE_CRAFT,
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_MILESTONE_RESOURCE_WORKAREA,
} from '../../../../../../test/mocks/milestones';
import {WORKAREA_UUID_EMPTY} from '../../../constants/workarea.constant';
import {MilestoneTypeEnum} from '../../../enums/milestone-type.enum';
import {Milestone} from '../../../models/milestones/milestone';
import {MilestoneFilters} from './milestone-filters';

describe('Milestone Filters', () => {

    const craftMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_CRAFT);
    const projectMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_WORKAREA);
    const investorMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_HEADER);
    const workareaMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_WORKAREA);
    const headerMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_HEADER);
    const withoutWorkareaMilestone = Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_CRAFT);

    describe('Match date', () => {

        it('should match milestone with any date when scope filter criteria is empty', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = null;
            milestoneFilters.criteria.to = null;

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should match milestone with a date that is on the same day as the scope "from" when both scope criteria are provided', () => {
            const milestoneFilters = new MilestoneFilters();
            const date = craftMilestone.date;

            milestoneFilters.criteria.from = date;
            milestoneFilters.criteria.to = date.clone().add(1, 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();

        });

        it('should match milestone with a date that is on the same day as the scope "to" when both scope criteria are provided', () => {
            const milestoneFilters = new MilestoneFilters();
            const date = craftMilestone.date;

            milestoneFilters.criteria.from = date.clone().subtract(1, 'd');
            milestoneFilters.criteria.to = date;

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should match milestone with a date that is between the scope "from" and "to" when both are provided', () => {
            const milestoneFilters = new MilestoneFilters();
            const date = craftMilestone.date;

            milestoneFilters.criteria.from = date.clone().subtract(1, 'd');
            milestoneFilters.criteria.to = date.clone().add(1, 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should not match milestone with the date that is before the "from" when both scope criteria are provided', () => {
            const milestoneFilters = new MilestoneFilters();
            const date = craftMilestone.date;

            milestoneFilters.criteria.from = date.clone().add(1, 'd');
            milestoneFilters.criteria.to = date.clone().add(2, 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeFalsy();
        });

        it('should not match milestone with the date that is after the "to" when both scope criteria are provided', () => {
            const milestoneFilters = new MilestoneFilters();
            const date = craftMilestone.date;

            milestoneFilters.criteria.from = date.clone().subtract(2, 'd');
            milestoneFilters.criteria.to = date.clone().subtract(1, 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeFalsy();
        });

        it('should match milestone with a date that is on the same day as the scope "from" when only the "from" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = craftMilestone.date.clone();
            milestoneFilters.criteria.to = null;

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should match milestone with a date that after the scope "from" when only the "from" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = craftMilestone.date.clone().subtract('1', 'd');
            milestoneFilters.criteria.to = null;

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should not match a milestone with a date that is before the scope "from" when only the "from" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = craftMilestone.date.clone().add('1', 'd');
            milestoneFilters.criteria.to = null;

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeFalsy();
        });

        it('should match milestone with a date that is on the same day as the scope "to" when only the "to" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = null;
            milestoneFilters.criteria.to = craftMilestone.date.clone();

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should match milestone with a date that before the scope "to" when only the "to" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = null;
            milestoneFilters.criteria.to = craftMilestone.date.clone().add('1', 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeTruthy();
        });

        it('should not match a milestone with a date that is after the scope "to" when only the "to" is provided', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.from = null;
            milestoneFilters.criteria.to = craftMilestone.date.clone().subtract('1', 'd');

            expect(milestoneFilters.matchMilestoneDate(craftMilestone)).toBeFalsy();
        });
    });

    describe('Match type', () => {

        it('should match milestone with any type when the types criteria is empty ', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [];

            expect(milestoneFilters.matchMilestoneType(projectMilestone)).toBeTruthy();
        });

        it('should match the milestone of type Project when it\'s provided on the types criteria', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Project];

            expect(milestoneFilters.matchMilestoneType(projectMilestone)).toBeTruthy();
        });

        it('should not match the milestone when the type it\'s not in the criteria', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Project];

            expect(milestoneFilters.matchMilestoneType(investorMilestone)).toBeFalsy();
        });

        it('should match the milestone of type Craft when it\'s provided on the types and the projectCraftIds also match', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Craft];
            milestoneFilters.criteria.types.projectCraftIds = [craftMilestone.craft.id];

            expect(milestoneFilters.matchMilestoneType(craftMilestone)).toBeTruthy();
        });

        it('should not match the milestone of type Craft when it\'s not provided in the types but the projectCraftIds match', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Project];
            milestoneFilters.criteria.types.projectCraftIds = [craftMilestone.craft.id];

            expect(milestoneFilters.matchMilestoneType(craftMilestone)).toBeFalsy();
        });

        it('should not match the milestone of type Craft when it\'s provided on the types and the projectCraftIds don\'t match', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Craft];
            milestoneFilters.criteria.types.projectCraftIds = ['craft-id-dont-match'];

            expect(milestoneFilters.matchMilestoneType(craftMilestone)).toBeFalsy();
        });
    });

    describe('Match work area', () => {

        it('should match milestone when work area criteria is empty and header criteria is false', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.header = false;
            milestoneFilters.criteria.workAreas.workAreaIds = [];

            expect(milestoneFilters.matchMilestoneWorkArea(workareaMilestone)).toBeTruthy();
        });

        it('should match milestone with same work area of the filter criteria', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.workAreaIds = [workareaMilestone.workArea.id];

            expect(milestoneFilters.matchMilestoneWorkArea(workareaMilestone)).toBeTruthy();
        });

        it('should match milestone without work area when the work area filter criteria is WORKAREA_UUID_EMPTY', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.workAreaIds = [WORKAREA_UUID_EMPTY];

            expect(milestoneFilters.matchMilestoneWorkArea(withoutWorkareaMilestone)).toBeTruthy();
        });

        it('should not match milestone with different work area from the filter criteria', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.workAreaIds = ['random-wa'];

            expect(milestoneFilters.matchMilestoneWorkArea(workareaMilestone)).toBeFalsy();
        });

        it('should match milestone when milestone header is true and header criteria is true', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.header = true;

            expect(milestoneFilters.matchMilestoneWorkArea(headerMilestone)).toBeTruthy();
        });

        it('should not match milestone when milestone header is false and header criteria is true', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.workAreas.header = true;

            expect(milestoneFilters.matchMilestoneWorkArea(workareaMilestone)).toBeFalsy();
        });
    });

    describe('Match milestone', () => {

        it('should match any milestone when the filter criteria is empty', () => {
            const milestoneFilters = new MilestoneFilters();

            expect(milestoneFilters.matchMilestone(craftMilestone)).toBeTruthy();
        });

        it('should not match milestone if one of the criteria fails', () => {
            const milestoneFilters = new MilestoneFilters();

            milestoneFilters.criteria.types.types = [MilestoneTypeEnum.Project];

            expect(milestoneFilters.matchMilestone(investorMilestone)).toBeFalsy();
        });
    });
});
