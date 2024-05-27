/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AttachmentListResourceLinks} from '../../api/attachments/resources/attachment-list.resource';
import {AttachmentSlice} from './attachment.slice';

export const ATTACHMENT_SLICE_INITIAL_STATE: AttachmentSlice = {
    currentItem: {
        id: null,
        requestStatus: RequestStatusEnum.empty
    },
    items: [],
    lists: new Map<string, AbstractList<AttachmentListResourceLinks>>()
};
