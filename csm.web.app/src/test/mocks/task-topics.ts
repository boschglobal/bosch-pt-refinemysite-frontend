/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {TopicResource} from '../../app/project/project-common/api/topics/resources/topic.resource';
import {TopicListResource} from '../../app/project/project-common/api/topics/resources/topic-list.resource';
import {TopicCriticalityEnum} from '../../app/project/project-common/enums/topic-criticality.enum';

export const MOCK_TOPIC_1: TopicResource = {
    id: '591fffce-d4ba-4cd9-a150-ae71e23715df',
    createdDate: new Date().toISOString(),
    createdBy: {
        displayName: 'Hans Mustermann',
        picture: 'http://localhost:8080/default-profile-picture-male.png',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
    },
    description: 'Freie Problembeschreibung 1',
    lastModifiedDate: '1989-02-14T00:00:00.000Z',
    lastModifiedBy: {
        displayName: 'Ali Albatros',
        id: '4e029efc-b1d8-43ab-a37e-67b2ae44e0b2',
    },
    taskId: 'e0ff566b-31fe-4222-a627-017260fa5c30',
    criticality: TopicCriticalityEnum.CRITICAL,
    messages: 0,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/topics/591fffce-d4ba-4cd9-a150-ae71e23715df',
        },
    },
    _embedded: {
        attachments: {
            attachments: [
                {
                    createdBy: {
                        displayName: 'Hans Mustermann',
                        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
                        picture: 'http://localhost:8080/default-profile-picture-male.png',
                    },
                    captureDate: new Date().toISOString(),
                    lastModifiedBy: {
                        displayName: 'Hans Mustermann',
                        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
                    },
                    lastModifiedDate: new Date().toISOString(),
                    createdDate: new Date().toISOString(),
                    fileName: '7ba30b24-65fd-4aa0-a265-9d4bd5fe3d96',
                    fileSize: 1608240105,
                    imageHeight: 800,
                    imageWidth: 800,
                    topicId: '591fffce-d4ba-4cd9-a150-ae71e23715df',
                    taskId: 'c88fa385-3599-410b-a9f0-1756a643f586',
                    _links: {
                        self: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d',
                        },
                        preview: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/preview',
                        },
                        data: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/data',
                        },
                        original: {
                            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/original',
                        },
                    },
                    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d',
                },
            ],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/591fffce-d4ba-4cd9-a150-ae71e23715df/attachments',
                },
            },
        },
    },
};

export const MOCK_TOPIC_2: TopicResource = {
    id: 'fd514020-7e7c-43cf-b755-24bb54a2c9c3',
    createdDate: new Date().toISOString(),
    createdBy: {
        displayName: 'Hans Mustermann',
        picture: 'http://localhost:8080/default-profile-picture-male.png',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
    },
    description: 'Freie Problembeschreibung 2',
    lastModifiedDate: new Date().toISOString(),
    lastModifiedBy: {
        displayName: 'Ali Albatros',
        id: '4e029efc-b1d8-43ab-a37e-67b2ae44e0b2',
    },
    taskId: 'e0ff566b-31fe-4222-a627-017260fa5c30',
    criticality: TopicCriticalityEnum.UNCRITICAL,
    messages: 0,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3',
        },
        escalate: {
            href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/escalate',
        },
    },
    _embedded: {
        attachments: {
            attachments: [],
            _links: {
                self: {
                    href: 'http://localhost:8080/v1/topics/fd514020-7e7c-43cf-b755-24bb54a2c9c3/attachments',
                },
            },
        },
    },
};

export const MOCK_TOPIC_LIST: TopicListResource = {
    topics: [
        MOCK_TOPIC_1,
        MOCK_TOPIC_2,
    ],
    _links: {
        self: {
            href: 'http://localhost:8080/v1/topics/591fffce-d4ba-4cd9-a150-ae71e23715df/attachments',
            templated: true,
        },
        prev: {
            href: 'http://localhost:8080/v1/tasks/e0ff566b-31fe-4222-a627-017260fa5c30/topics?before=fd514020-7e7c-43cf-b755-24bb54a2c9c3&limit=50',
        },
    },
};
