/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {AttachmentResource} from '../../../../project/project-common/api/attachments/resources/attachment.resource';
import {MessageResource} from '../../../../project/project-common/api/messages/resources/message.resource';
import {NewsResource} from '../../../../project/project-common/api/news/resources/news.resource';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';

export class MessageItemModel {
    public id: string;
    public attachments: AttachmentResource[];
    public canDelete: boolean;
    public createdBy: ResourceReferenceWithPicture;
    public description: string;
    public isNew: boolean;
    public lastModifiedDate: string;

    public static fromMessageResource(message: MessageResource, news: NewsResource[], currentLang: string): MessageItemModel {
        const {id, content, createdBy, _links, _embedded} = message;
        const context = new ObjectIdentifierPair(ObjectTypeEnum.Message, message.id);

        return {
            id,
            attachments: _embedded?.attachments?.attachments,
            canDelete: 'delete' in _links,
            createdBy: createdBy as ResourceReferenceWithPicture,
            description: content,
            isNew: news.some((item) => item.context.isSame(context)),
            lastModifiedDate: this._getFormattedDate(message, currentLang),
        };
    }

    private static _capitalizeFirstWord(formattedDate: string): string {
        return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    }

    private static _getFormattedDate(message: MessageResource, currentLang: string): string {
        return this._capitalizeFirstWord(moment(message.lastModifiedDate).locale(currentLang).calendar());
    }
}
