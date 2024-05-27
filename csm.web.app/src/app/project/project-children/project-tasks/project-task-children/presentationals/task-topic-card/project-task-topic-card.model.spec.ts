/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {MOCK_NEW_B} from '../../../../../../../test/mocks/news';
import {MOCK_TOPIC_1} from '../../../../../../../test/mocks/task-topics';
import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';
import {NewsResource} from '../../../../../project-common/api/news/resources/news.resource';
import {TopicResource} from '../../../../../project-common/api/topics/resources/topic.resource';
import {ProjectTaskTopicCardModel} from './project-task-topic-card.model';

describe('Project Task Topic Card Model', () => {

    const MOCK_TOPIC: TopicResource = MOCK_TOPIC_1;
    const news: NewsResource[] = [MOCK_NEW_B];
    const mockCurrentLang = 'en';

    describe('#fromTopicResource', () => {
        it('should set correct topic data, given topic, news and current language', () => {
            const expectedTopicResource: ProjectTaskTopicCardModel = {
                id: MOCK_TOPIC_1.id,
                criticality: MOCK_TOPIC_1.criticality,
                hasNewReplies: false,
                isNew: false,
                canDelete: false,
                canChangeCriticality: false,
                description: MOCK_TOPIC_1.description,
                creationDate: moment(MOCK_TOPIC_1.createdDate).locale(mockCurrentLang).calendar(),
                createdBy: MOCK_TOPIC_1.createdBy as ResourceReferenceWithPicture,
                replyAmount: 0,
                isCritical: true,
                attachments: MOCK_TOPIC_1._embedded.attachments.attachments,
            };
            expect(ProjectTaskTopicCardModel.fromTopicResource(MOCK_TOPIC, news, mockCurrentLang)).toEqual(expectedTopicResource);
        });
    });
});
