/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ParticipantStatusEnum} from '../../../enums/participant-status.enum';
import {ProjectParticipantFilters} from './project-participant-filters';
import {ProjectParticipantFiltersResource} from './project-participant-filters-resource';

describe('Project Participant Filters Resource', () => {
    const projectParticipantsFilters = new ProjectParticipantFilters(['CSM'], [ParticipantStatusEnum.ACTIVE]);

    it('should generate ProjectParticipantFiltersResource from ProjectParticipantFilters', () => {
        const {roles, status} = projectParticipantsFilters;
        const expectedResult = new ProjectParticipantFiltersResource(roles, status);

        expect(ProjectParticipantFiltersResource.fromProjectParticipantFilters(projectParticipantsFilters)).toEqual(expectedResult);
    });
});
