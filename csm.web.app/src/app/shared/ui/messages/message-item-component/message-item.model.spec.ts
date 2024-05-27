/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {MOCK_MESSAGE_1} from '../../../../../test/mocks/messages';
import {MOCK_NEW_D} from '../../../../../test/mocks/news';
import {MessageResource} from '../../../../project/project-common/api/messages/resources/message.resource';
import {NewsResource} from '../../../../project/project-common/api/news/resources/news.resource';
import {ObjectIdentifierPair} from '../../../misc/api/datatypes/object-identifier-pair.datatype';
import {ResourceReferenceWithPicture} from '../../../misc/api/datatypes/resource-reference-with-picture.datatype';
import {ObjectTypeEnum} from '../../../misc/enums/object-type.enum';
import {MessageItemModel} from './message-item.model';

describe('Message Model', () => {

    const currentLang = 'en';
    const today = new Date();
    const lastModifiedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 10);
    const formattedDate = 'Today at 10:10 AM';
    const message: MessageResource = {
        ...MOCK_MESSAGE_1,
        lastModifiedDate: lastModifiedDate.toISOString(),
    };
    const messageWithDeleteLink: MessageResource = {
        ...message,
        _links: {
            ...MOCK_MESSAGE_1._links,
            delete: {
                href: 'delete',
            },
        },
    };
    const messageWithoutDeleteLink: MessageResource = {
        ...message,
        _links: {
            self: {
                href: 'self',
            },
        },
    };
    const newsWithCurrentMessage: NewsResource[] = [
        {...MOCK_NEW_D, context: new ObjectIdentifierPair(ObjectTypeEnum.Message, MOCK_MESSAGE_1.id)},
    ];
    const newsWithoutCurrentMessage: NewsResource[] = [
        {...MOCK_NEW_D, context: new ObjectIdentifierPair(ObjectTypeEnum.Message, 'abc')},
    ];

    it('should return a message item model with delete permissions when the delete link is present', () => {
        const {id, content, createdBy} = messageWithDeleteLink;
        const expectedMessage: MessageItemModel = {
            id,
            attachments: undefined,
            canDelete: true,
            createdBy: createdBy as ResourceReferenceWithPicture,
            description: content,
            isNew: false,
            lastModifiedDate: formattedDate,
        };

        expect(MessageItemModel.fromMessageResource(messageWithDeleteLink, [], currentLang)).toEqual(expectedMessage);
    });

    it('should return a message item model without delete permissions when the delete link is not present', () => {
        const {id, content, createdBy} = messageWithoutDeleteLink;
        const expectedMessage: MessageItemModel = {
            id,
            attachments: undefined,
            canDelete: false,
            createdBy: createdBy as ResourceReferenceWithPicture,
            description: content,
            isNew: false,
            lastModifiedDate: formattedDate,
        };

        expect(MessageItemModel.fromMessageResource(messageWithoutDeleteLink, [], currentLang)).toEqual(expectedMessage);
    });

    it('should return a message item model with isNew to true when there are news for the current message', () => {
        const {id, content, createdBy} = message;
        const expectedMessage: MessageItemModel = {
            id,
            attachments: undefined,
            canDelete: false,
            createdBy: createdBy as ResourceReferenceWithPicture,
            description: content,
            isNew: true,
            lastModifiedDate: formattedDate,
        };

        expect(MessageItemModel.fromMessageResource(message, newsWithCurrentMessage, currentLang)).toEqual(expectedMessage);
    });

    it('should return a message item model with isNew to false when there are no news for the current message', () => {
        const {id, content, createdBy} = message;
        const expectedMessage: MessageItemModel = {
            id,
            attachments: undefined,
            canDelete: false,
            createdBy: createdBy as ResourceReferenceWithPicture,
            description: content,
            isNew: false,
            lastModifiedDate: formattedDate,
        };

        expect(MessageItemModel.fromMessageResource(message, newsWithoutCurrentMessage, currentLang)).toEqual(expectedMessage);
    });
});
