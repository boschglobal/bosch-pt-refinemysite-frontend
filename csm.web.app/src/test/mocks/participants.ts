/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ProjectParticipantListResource} from '../../app/project/project-common/api/participants/resources/project-participant-list.resource';
import {ProjectParticipantResource} from '../../app/project/project-common/api/participants/resources/project-participant.resource';
import {ParticipantStatusEnum} from '../../app/project/project-common/enums/participant-status.enum';
import {PhoneNumber} from '../../app/shared/misc/api/datatypes/phone-number.datatype';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {MOCK_COMPANY_1} from './companies';

export const MOCK_PARTICIPANT: ProjectParticipantResource = {
    id: '123',
    version: 1,
    company: {
        displayName: 'A',
        id: '1',
    },
    crafts: [new ResourceReference('123', 'craft-1'), new ResourceReference('456', 'craft-2')],
    email: 'c@c.pt',
    gender: 'MALE',
    phoneNumbers: [new PhoneNumber('123', '123456789', 'TAX')],
    project: {
        displayName: 'D',
        id: '4',
    },
    projectRole: 'CSM',
    user: {
        displayName: 'D',
        id: '4',
        picture: 'http://localhost:8000/somelink',
    },
    status: ParticipantStatusEnum.ACTIVE,
    _links: {
        self: {
            href: '1',
        },
    },
};

export const MOCK_PARTICIPANT_2: ProjectParticipantResource = {
    id: '456',
    version: 1,
    company: {
        displayName: 'A',
        id: '1',
    },
    crafts: [new ResourceReference('123', 'craft-1'), new ResourceReference('456', 'craft-2')],
    email: 'c@c.pt',
    gender: 'FEMALE',
    phoneNumbers: [new PhoneNumber('123', '123456789', 'TAX')],
    project: {
        displayName: 'D',
        id: '4',
    },
    projectRole: 'FM',
    user: {
        displayName: 'D',
        id: '4',
        picture: 'http://localhost:8000/somelink',
    },
    status: ParticipantStatusEnum.ACTIVE,
    _links: {
        self: {
            href: '1',
        },
        delete: {
            href: '2',
        },
        update: {
            href: '3',
        },
    },
};

export const MOCK_PARTICIPANT_3: ProjectParticipantResource = {
    id: '789',
    version: 1,
    company: {
        displayName: 'A',
        id: '1',
    },
    crafts: [new ResourceReference('123', 'craft-1'), new ResourceReference('456', 'craft-2')],
    email: 'c@c.pt',
    gender: 'FEMALE',
    phoneNumbers: [new PhoneNumber('123', '123456789', 'TAX')],
    project: {
        displayName: 'D',
        id: '4',
    },
    projectRole: 'CSM',
    user: {
        displayName: 'D',
        id: '4',
        picture: 'http://localhost:8000/somelink',
    },
    status: ParticipantStatusEnum.VALIDATION,
    _links: {
        self: {
            href: '1',
        },
        delete: {
            href: '2',
        },
    },
};

export const MOCK_PARTICIPANT_4: ProjectParticipantResource = {
    id: '101',
    version: 1,
    company: {
        displayName: MOCK_COMPANY_1.name,
        id: MOCK_COMPANY_1.id,
    },
    crafts: [new ResourceReference('123', 'craft-1'), new ResourceReference('456', 'craft-2')],
    email: 'c@c.pt',
    gender: 'MALE',
    phoneNumbers: [new PhoneNumber('123', '123456789', 'TAX')],
    project: {
        displayName: 'D',
        id: '4',
    },
    projectRole: 'CSM',
    user: {
        displayName: 'E',
        id: '5',
        picture: 'http://localhost:8000/somelink',
    },
    status: ParticipantStatusEnum.INVITED,
    _links: {
        self: {
            href: '1',
        },
        delete: {
            href: '2',
        },
        resend: {
            href: '3',
        },
    },
};

export const MOCK_PARTICIPANTS: ProjectParticipantResource[] = [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2, MOCK_PARTICIPANT_4];
export const MOCK_PARTICIPANTS_NOT_ACTIVE: ProjectParticipantResource[] = [MOCK_PARTICIPANT_4];

export const MOCK_PARTICIPANTS_LIST: ProjectParticipantListResource = {
    pageNumber: 1,
    pageSize: 10,
    totalPages: 5,
    totalElements: 100,
    items: MOCK_PARTICIPANTS,
    _links: {
        self: {
            href: '1',
        },
        assign: {
            href: '2',
        },
    },
};

export const MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE: ProjectParticipantListResource = Object.assign({}, MOCK_PARTICIPANTS_LIST, {
    pageNumber: 0,
    totalPages: 1,
    totalElements: 5,
});

export const MOCK_PARTICIPANTS_LIST_ONE_OF_TWO_PAGE: ProjectParticipantListResource = Object.assign({}, MOCK_PARTICIPANTS_LIST, {
    pageNumber: 0,
    totalPages: 2,
    totalElements: 15,
});

export const MOCK_PARTICIPANTS_LIST_TWO_OF_TWO_PAGE: ProjectParticipantListResource = Object.assign({}, MOCK_PARTICIPANTS_LIST, {
    pageNumber: 1,
    totalPages: 2,
    totalElements: 15,
});

export const MOCK_POST_PARTICIPANT_PAYLOAD: any = {
    projectId: '123',
    email: 'foo@bar.com',
};

export const MOCK_PUT_PARTICIPANT_PAYLOAD: any = {
    role: 'CSM',
};

export const MOCK_POST_PARTICIPANT_ACTIVE_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: 'Participant_Create_ActiveSuccessMessage',
    },
};

export const MOCK_POST_PARTICIPANT_INVITED_SUCCESS_ALERT_PAYLOAD: any = {
    message: {
        key: 'Participant_Create_InvitedSuccessMessage',
    },
};
