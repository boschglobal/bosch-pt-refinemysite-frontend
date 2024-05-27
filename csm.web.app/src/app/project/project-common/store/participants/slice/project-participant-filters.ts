/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ParticipantStatusEnum} from '../../../enums/participant-status.enum';

export class ProjectParticipantFilters {
    constructor(public roles?: string[], public status?: ParticipantStatusEnum[]) {
    }

    public static getAllParticipantStatus(): ParticipantStatusEnum[] {
        return [
            ParticipantStatusEnum.ACTIVE,
            ParticipantStatusEnum.INVITED,
            ParticipantStatusEnum.VALIDATION,
        ];
    }

    public static getActiveParticipantStatus(): ParticipantStatusEnum[] {
        return [ParticipantStatusEnum.ACTIVE];
    }

    public static getParticipantPendingStatus(): ParticipantStatusEnum[] {
        return [
            ParticipantStatusEnum.VALIDATION,
            ParticipantStatusEnum.INVITED,
        ];
    }
}
