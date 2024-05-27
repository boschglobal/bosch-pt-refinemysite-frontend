/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NewsListResource} from '../../app/project/project-common/api/news/resources/news-list.resource';
import {NewsResource} from '../../app/project/project-common/api/news/resources/news.resource';
import {ObjectIdentifierPair} from '../../app/shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../app/shared/misc/enums/object-type.enum';

export const MOCK_NEW_A: NewsResource = {
    context: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    parent: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    root: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    createdDate: new Date('12/12/1999'),
    lastModifiedDate: new Date('12/12/1999'),
};

export const MOCK_NEW_B: NewsResource = {
    context: new ObjectIdentifierPair(ObjectTypeEnum.Topic, 'bar'),
    parent: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    root: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    createdDate: new Date('13/12/1999'),
    lastModifiedDate: new Date('13/12/1999'),
};

export const MOCK_NEW_C: NewsResource = {
    context: new ObjectIdentifierPair(ObjectTypeEnum.Message, 'qux'),
    parent: new ObjectIdentifierPair(ObjectTypeEnum.Topic, 'bar'),
    root: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'foo'),
    createdDate: new Date('11/12/1999'),
    lastModifiedDate: new Date('11/12/1999'),
};

export const MOCK_NEW_D: NewsResource = {
    context: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'baz'),
    parent: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'baz'),
    root: new ObjectIdentifierPair(ObjectTypeEnum.Task, 'baz'),
    createdDate: new Date(),
    lastModifiedDate: new Date(),
};

export const MOCK_NEWS_ITEMS: NewsResource[] = [
    MOCK_NEW_A,
    MOCK_NEW_B,
    MOCK_NEW_C,
    MOCK_NEW_D,
];

export const MOCK_NEWS_LIST: NewsListResource = {
    items: MOCK_NEWS_ITEMS,
    _links: {
        self: {
            href: ''
        }
    }
};
