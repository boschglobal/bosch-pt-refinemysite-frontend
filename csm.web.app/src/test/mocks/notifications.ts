/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../app/shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {ResourceReferenceWithType} from '../../app/shared/misc/api/datatypes/resource-reference-with-type.datatype';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ObjectTypeEnum} from '../../app/shared/misc/enums/object-type.enum';
import {NotificationListResource} from '../../app/shared/notification/api/resources/notification-list.resource';
import {NotificationResource} from '../../app/shared/notification/api/resources/notification.resource';

export const NOTIFICATION_MOCK: NotificationResource = {
    id: '591fffce-d4ba-4cd9-a150-ae71e23715df',
    date: new Date('01/20/1989').toISOString(),
    actor: new ResourceReferenceWithPicture('e59f3a93-8f56-41d2-a242-7f15cccc8a3d', 'Hans Mustermann', ''),
    summary: {
        template: '${actor} did something amazing!',
        values: {
            actor: new ResourceReferenceWithType('e59f3a93-8f56-41d2-a242-7f15cccc8a3d', 'Hans Mustermann', ObjectTypeEnum.ProjectParticipant),
        }
    },
    changes: 'Finished "The Project"',
    context: {
        project: new ResourceReference('017da74c-42f0-4644-b5bc-a3fc5fcfc864', 'AvP 203'),
        task: new ResourceReference('017da74c-42f0-4644-b5bc-a3fc5fcfc865', 'Install solar panels')
    },
    object: new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '017da74c-42f0-4644-b5bc-a3fc5fcfc868'),
    read: false,
};

export const NOTIFICATION_MOCK_2: NotificationResource = {
    id: '591fffce-d4ba-4cd9-a150-ae71e23715df2',
    date: new Date('01/20/1989').toISOString(),
    actor: new ResourceReferenceWithPicture('e59f3a93-8f56-41d2-a242-7f15cccc8a3d2', 'Hans Mustermann', ''),
    summary: {
        template: '${actor} wrote something strange like ${blablabla}!',
        values: {
            actor: new ResourceReferenceWithType('e59f3a93-8f56-41d2-a242-7f15cccc8a3d2', 'Hans Mustermann', ObjectTypeEnum.ProjectParticipant),
        }
    },
    changes: 'Finished "The Project"',
    context: {
        project: new ResourceReference('017da74c-42f0-4644-b5bc-a3fc5fcfc8642', 'AvP 203'),
        task: new ResourceReference('017da74c-42f0-4644-b5bc-a3fc5fcfc8652', 'Install solar panels')
    },
    object: new ObjectIdentifierPair(ObjectTypeEnum.DayCard, '017da74c-42f0-4644-b5bc-a3fc5fcfc8682'),
    read: false,
};

export const NOTIFICATION_LIST_MOCK: NotificationListResource = {
    items: [
        NOTIFICATION_MOCK,
        NOTIFICATION_MOCK_2,
    ],
    lastSeen: new Date('01/20/1989').toISOString(),
    _links: {
        self: {
            href: 'http://localhost:8080/v1/notifications',
            templated: true
        },
        prev: {
            href: 'http://localhost:8080/v1/notifications?limit=10&before=fd514020-7e7c-43cf-b755-24bb54a2c9c3'
        }
    }
};

export const NOTIFICATION_LIST_WITHOUT_PREV_LINK_MOCK: NotificationListResource = {
    items: [
        NOTIFICATION_MOCK,
        NOTIFICATION_MOCK_2,
    ],
    lastSeen: new Date('01/20/1989').toISOString(),
    _links: {
        self: {
            href: 'http://localhost:8080/v1/notifications',
            templated: true
        },
    }
};

export const NOTIFICATION_EMPTY_LIST_MOCK: NotificationListResource = {
    items: [],
    lastSeen: new Date('01/20/1989').toISOString(),
    _links: {
        self: {
            href: 'http://localhost:8080/v1/notifications',
            templated: true
        }
    }
};
