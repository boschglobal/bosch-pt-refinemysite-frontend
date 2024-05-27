/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AttachmentResource} from '../../app/project/project-common/api/attachments/resources/attachment.resource';

export const MOCK_TOPIC_FILE: AttachmentResource = {
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
    id: '9dc079c0-e679-45e4-8aab-91b680ba6a7d'
};

export const MOCK_TOPIC_FILE_LIST: AttachmentResource[] = [MOCK_TOPIC_FILE, MOCK_TOPIC_FILE];
