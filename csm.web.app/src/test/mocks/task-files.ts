/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AttachmentResource} from '../../app/project/project-common/api/attachments/resources/attachment.resource';
import {AttachmentListResource} from '../../app/project/project-common/api/attachments/resources/attachment-list.resource';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';

export const MOCK_TASK_FILE_1: AttachmentResource = {
    id: '123',
    createdBy: new ResourceReferenceWithPicture('', '', ''),
    lastModifiedBy: {id: '', displayName: ''},
    createdDate: new Date().toISOString(),
    captureDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
    fileName: '',
    fileSize: 1024,
    imageHeight: 500,
    imageWidth: 500,
    taskId: '123',
    _links: {
        self: {href: ''},
        preview: {href: ''},
        data: {href: ''},
        original: {href: ''}
    },
};

export const MOCK_TASK_FILE_LIST: AttachmentListResource = {
    attachments: [MOCK_TASK_FILE_1],
    _links: {
        self: {href: ''},
    },
};
