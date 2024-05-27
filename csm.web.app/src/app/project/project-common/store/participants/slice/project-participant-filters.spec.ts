/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ParticipantStatusEnum} from '../../../enums/participant-status.enum';
import {ProjectParticipantFilters} from './project-participant-filters';

describe('Project Participant Filters', () => {

    it('should return the correct All participant status', () => {
        const expectedResult = [
            ParticipantStatusEnum.ACTIVE,
            ParticipantStatusEnum.INVITED,
            ParticipantStatusEnum.VALIDATION,
        ];

        expect(ProjectParticipantFilters.getAllParticipantStatus()).toEqual(expectedResult);
    });

    it('should return the correct Active participant status', () => {
        const expectedResult = [ParticipantStatusEnum.ACTIVE];

        expect(ProjectParticipantFilters.getActiveParticipantStatus()).toEqual(expectedResult);
    });

    it('should return the correct Pending participant status', () => {
        const expectedResult = [
            ParticipantStatusEnum.VALIDATION,
            ParticipantStatusEnum.INVITED,
        ];

        expect(ProjectParticipantFilters.getParticipantPendingStatus()).toEqual(expectedResult);
    });
});
