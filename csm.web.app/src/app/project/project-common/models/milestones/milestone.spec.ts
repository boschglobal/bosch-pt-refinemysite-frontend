/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS,
} from '../../../../../test/mocks/milestones';
import {Milestone} from './milestone';

describe('Milestone', () => {

    it('should return null if the milestone resource is null when fromMilestoneResource is called', () => {
        const milestoneResource = null;
        const expectedMilestone = null;

        expect(Milestone.fromMilestoneResource(milestoneResource)).toBe(expectedMilestone);
    });

    it('should return null if the milestone resource is undefined when fromMilestoneResource is called', () => {
        const milestoneResource = undefined;
        const expectedMilestone = null;

        expect(Milestone.fromMilestoneResource(milestoneResource)).toBe(expectedMilestone);
    });

    it('should return a milestone with all permissions when fromMilestoneResource is called', () => {
        const milestoneResource = MOCK_MILESTONE_RESOURCE_HEADER;
        const {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date,
            header,
            creator,
            position,
            craft,
            workArea,
            description,
            _links,
        } = milestoneResource;

        const expectedMilestone: Milestone = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date: moment(date),
            header,
            creator,
            position,
            craft,
            workArea,
            description,
            permissions: {
                canUpdate: _links.hasOwnProperty('update'),
                canDelete: _links.hasOwnProperty('delete'),
            }
        };

        expect(Milestone.fromMilestoneResource(milestoneResource)).toEqual(expectedMilestone);
    });

    it('should return a milestone without any permissions when fromMilestoneResource is called', () => {
        const milestoneResource = MOCK_MILESTONE_RESOURCE_WITHOUT_PERMISSIONS;
        const {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date,
            header,
            creator,
            position,
            craft,
            workArea,
            description,
            _links,
        } = milestoneResource;

        const expectedMilestone: Milestone = {
            id,
            version,
            createdBy,
            createdDate,
            lastModifiedBy,
            lastModifiedDate,
            project,
            name,
            type,
            date: moment(date),
            header,
            creator,
            position,
            craft,
            workArea,
            description,
            permissions: {
                canUpdate: _links.hasOwnProperty('update'),
                canDelete: _links.hasOwnProperty('delete'),
            }
        };

        expect(Milestone.fromMilestoneResource(milestoneResource)).toEqual(expectedMilestone);
    });
});
