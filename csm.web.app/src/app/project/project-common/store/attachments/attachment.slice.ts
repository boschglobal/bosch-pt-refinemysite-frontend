/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {AttachmentListResourceLinks} from '../../api/attachments/resources/attachment-list.resource';

export interface AttachmentSlice {
    currentItem: AbstractItem;
    items: AttachmentResource[];
    lists: Map<string, AbstractList<AttachmentListResourceLinks>>;
}
