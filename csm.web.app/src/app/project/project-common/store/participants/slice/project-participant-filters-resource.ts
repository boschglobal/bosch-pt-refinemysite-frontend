/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ParticipantStatusEnum} from '../../../enums/participant-status.enum';
import {ProjectParticipantFilters} from './project-participant-filters';

export class ProjectParticipantFiltersResource {
    constructor(public roles?: string[],
                public status?: ParticipantStatusEnum[]) {
    }

    public static fromProjectParticipantFilters(filters: ProjectParticipantFilters) {
        const {roles, status} = filters;

        return new ProjectParticipantFiltersResource(roles, status);
    }
}
