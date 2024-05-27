/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AttachmentResource} from '../../app/project/project-common/api/attachments/resources/attachment.resource';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';

export const MOCK_MESSAGE_FILE_1: AttachmentResource = {
    id: '123',
    createdBy: new ResourceReferenceWithPicture('', '', ''),
    createdDate: new Date().toISOString(),
    captureDate: new Date().toISOString(),
    lastModifiedDate: new Date().toISOString(),
    lastModifiedBy: new ResourceReferenceWithPicture('', '', ''),
    fileName: '',
    fileSize: 1024,
    imageHeight: 500,
    _links: {
        self: {href: ''},
        preview: {href: ''},
        data: {href: ''},
        original: {href: ''}
    },
};
