/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AttachmentResource} from '../../app/project/project-common/api/attachments/resources/attachment.resource';
import {AttachmentListResource} from '../../app/project/project-common/api/attachments/resources/attachment-list.resource';

export const MOCK_ATTACHMENT_1: AttachmentResource = {
    createdBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
        picture: 'http://localhost:8080/default-profile-picture-male.png'
    },
    captureDate: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0'
    },
    lastModifiedDate: new Date().toISOString(),
    fileName: '7ba30b24-65fd-4aa0-a265-9d4bd5fe3d96',
    fileSize: 1608240105,
    imageHeight: 800,
    imageWidth: 800,
    messageId: '590dffce-d4ba-4cd9-a150-ae71e23715de',
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
        }
    },
    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d0'
};

export const MOCK_ATTACHMENT_2: AttachmentResource = {
    createdBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
        picture: 'http://localhost:8080/default-profile-picture-male.png'
    },
    captureDate: new Date().toISOString(),
    createdDate: new Date().toISOString(),
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0'
    },
    lastModifiedDate: new Date().toISOString(),
    fileName: '7ba30b24-65fd-4aa0-a265-9d4bd5fe3d96',
    fileSize: 1608240105,
    imageHeight: 800,
    imageWidth: 800,
    messageId: '590dffce-d4ba-4cd9-a150-ae71e23715de',
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
        delete: {
            href: 'http://localhost:8080/v1/tasks/c88fa385-3599-410b-a9f0-1756a643f586/attachments/9dc079c0-e679-45e4-8aab-91b680ba6a7d/delete',
        }
    },
    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d1'
};

export const MOCK_ATTACHMENT_3: AttachmentResource = {
    createdBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0',
        picture: 'http://localhost:8080/default-profile-picture-male.png'
    },
    captureDate: null,
    createdDate: new Date().toISOString(),
    lastModifiedBy: {
        displayName: 'Hans Mustermann',
        id: '6f669d4a-17fe-4d27-afee-53bfa0a4d8d0'
    },
    lastModifiedDate: new Date().toISOString(),
    fileName: '7ba30b24-65fd-4aa0-a265-9d4bd5fe3d96',
    fileSize: 1608240105,
    imageHeight: 800,
    imageWidth: 800,
    messageId: '590dffce-d4ba-4cd9-a150-ae71e23715df',
    topicId: '591fffce-d4ba-4cd9-a150-ae71e23715dd',
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
        }
    },
    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d2'
};

export const MOCK_ATTACHMENTS: AttachmentResource[] = [
    MOCK_ATTACHMENT_1,
    MOCK_ATTACHMENT_2,
    MOCK_ATTACHMENT_3
];

export const MOCK_ATTACHMENTS_LIST: AttachmentListResource = {
    attachments: MOCK_ATTACHMENTS,
    _links: {
        self: {
            href: ''
        }
    }
};
