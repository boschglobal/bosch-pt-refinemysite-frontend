/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {ObjectIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {NewsResource} from '../../../../../project-common/api/news/resources/news.resource';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {TopicCriticalityEnum} from '../../../../../project-common/enums/topic-criticality.enum';

export class ProjectTaskTopicCardModel {

    public id: string;
    public canDelete: boolean;
    public canChangeCriticality: boolean;
    public criticality: TopicCriticalityEnum;
    public description: string;
    public creationDate: string;
    public createdBy: ResourceReferenceWithPicture;
    public replyAmount: number;
    public hasNewReplies: boolean;
    public isNew: boolean;
    public attachments: AttachmentResource[];
    public isCritical: boolean;

    public static fromTopicResource(topic: TopicResource, news: NewsResource[], currentLang: string): ProjectTaskTopicCardModel {
        const context: ObjectIdentifierPair = new ObjectIdentifierPair(ObjectTypeEnum.Topic, topic.id);

        return {
            id: topic.id,
            criticality: topic.criticality,
            hasNewReplies: news.some(item => item.context.isSame(context)),
            isNew: news.some(item => item.parent.isSame(context) && item.context.type === ObjectTypeEnum.Message),
            canDelete: 'delete' in topic._links,
            canChangeCriticality: Boolean(topic._links.deescalate || topic._links.escalate),
            description: topic.description,
            creationDate: this._getFormattedCreationDate(topic, currentLang),
            createdBy: topic.createdBy as ResourceReferenceWithPicture,
            replyAmount: Number(topic.messages),
            isCritical: topic.criticality === TopicCriticalityEnum.CRITICAL,
            attachments: topic._embedded.attachments.attachments,
        };
    }

    private static _getFormattedCreationDate(topic: TopicResource, currentLang: string): string {
        return moment(topic.createdDate).locale(currentLang).calendar();
    }
}
