/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DayCardResource} from '../../app/project/project-common/api/day-cards/resources/day-card.resource';
import {SaveDayCardResource} from '../../app/project/project-common/api/day-cards/resources/save-day-card.resource';
import {DayCardStatusEnum} from '../../app/project/project-common/enums/day-card-status.enum';
import {DayCard} from '../../app/project/project-common/models/day-cards/day-card';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE} from './rfvs';

export const MOCK_DAY_CARD_RESOURCE_A: DayCardResource = {
    id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a492',
    title: 'Day card A',
    manpower: 1.5,
    status: DayCardStatusEnum.Open,
    task: {
        id: 'foo',
        displayName: 'Task name'
    },
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    _links: {
        self: {
            href: ''
        },
        update: {
            href: ''
        },
        delete: {
            href: ''
        }
    }
};

export const MOCK_DAY_CARD_A = DayCard.fromDayCardResource(MOCK_DAY_CARD_RESOURCE_A, '2018-01-20');

export const MOCK_DAY_CARD_RESOURCE_B: DayCardResource = {
    id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a494',
    title: 'Day card B',
    manpower: 0,
    status: DayCardStatusEnum.NotDone,
    reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
    notes: 'Lorem ipsum',
    task: {
        id: 'foo',
        displayName: 'Task name'
    },
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    _links: {
        self: {
            href: ''
        },
        update: {
            href: ''
        }
    }
};

export const MOCK_DAY_CARD_B = DayCard.fromDayCardResource(MOCK_DAY_CARD_RESOURCE_B, '2018-01-21');

export const MOCK_DAY_CARD_WITHOUT_DATE: DayCardResource = {
    id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a495',
    title: 'Day card C',
    manpower: 0,
    status: DayCardStatusEnum.NotDone,
    reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
    notes: 'Lorem ipsum',
    task: {
        id: 'foo',
        displayName: 'Task name'
    },
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    _links: {
        self: {
            href: ''
        },
        update: {
            href: ''
        }
    }
};

export const MOCK_DAY_CARD_WITHOUT_DATE_2: DayCardResource = {
    id: 'b8763b19-de8e-ea0d-2d6f-d77feb70a496',
    title: 'Day card C',
    manpower: 0,
    status: DayCardStatusEnum.NotDone,
    reason: MOCK_RFV_BAD_WEATHER_ENUM_REFERENCE,
    notes: 'Lorem ipsum',
    task: {
        id: 'foo',
        displayName: 'Task name'
    },
    createdBy: new ResourceReferenceWithPicture('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos', ''),
    createdDate: '1989-01-20T00:00:00.000Z',
    lastModifiedBy: new ResourceReference('b8763b19-de8e-ea0d-2d6f-d77feb70a491', 'John Pianos'),
    lastModifiedDate: '1989-01-20T00:00:00.000Z',
    version: 0,
    _links: {
        self: {
            href: ''
        },
        update: {
            href: ''
        }
    }
};

export const MOCK_SAVE_DAY_CARD_A: SaveDayCardResource = {
    title: 'Day card A',
    manpower: 1.5,
    date: '2020-03-20',
};
