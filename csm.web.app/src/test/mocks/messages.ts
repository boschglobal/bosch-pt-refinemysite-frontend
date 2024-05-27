/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {MessageResource} from '../../app/project/project-common/api/messages/resources/message.resource';
import {MessageListResource} from '../../app/project/project-common/api/messages/resources/message-list.resource';
import {ResourceReference} from '../../app/shared/misc/api/datatypes/resource-reference.datatype';
import {ResourceReferenceWithPicture} from '../../app/shared/misc/api/datatypes/resource-reference-with-picture.datatype';

export const MOCK_MESSAGE_1: MessageResource = {
    id: '1',
    topicId: '2',
    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
    createdDate: '2017-01-01T00:00:00.000Z',
    content: 'Test Message Content',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 1,
    _embedded: {},
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_MESSAGE_2: MessageResource = {
    id: '2',
    topicId: '2',
    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
    createdDate: '2017-01-01T00:00:00.000Z',
    content: 'Test Message Content',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 1,
    _embedded: {},
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_MESSAGE_3: MessageResource = {
    id: '3',
    topicId: '2',
    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
    createdDate: '2017-01-01T00:00:00.000Z',
    content: 'Test Message Content',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 1,
    _embedded: {},
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_MESSAGE_4: MessageResource = {
    id: '4',
    topicId: '2',
    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
    createdDate: '2017-01-01T00:00:00.000Z',
    content: 'Test Message Content',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 1,
    _embedded: {},
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_MESSAGE_FILES: MessageResource = {
    id: '2',
    topicId: '2',
    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
    createdDate: '2017-01-01T00:00:00.000Z',
    content: 'Test Message Content',
    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
    lastModifiedDate: '2016-10-01T00:00:00.000Z',
    version: 1,
    _embedded: {
        attachments: {
            attachments: [
                {
                    createdBy: new ResourceReferenceWithPicture('2', 'Ali Albatros', ''),
                    createdDate: '2017-01-01T00:00:00.000Z',
                    captureDate: '2017-01-01T00:00:00.000Z',
                    lastModifiedBy: new ResourceReference('1', 'Bob Baumeister'),
                    lastModifiedDate: '2016-10-01T00:00:00.000Z',
                    fileName: '0071104d-5af9-439b-afba-363fd99d5169',
                    fileSize: 1608240105,
                    imageHeight: 800,
                    imageWidth: 800,
                    topicId: '19816a44-c580-40da-97f3-f16b2d615a3b',
                    messageId: '3684390d-6e6a-4790-b84d-29735476c52f',
                    taskId: 'f5f7cd55-2cd9-42f8-b125-96fd1917a63b',
                    version: 1,
                    _links: {
                        self: {
                            href: 'http://localhost:8080/v1/tasks/{id}/attachments/67bb4a94-59b4-43c3-ae90-94e8afb16b09'
                        },
                        preview: {
                            href: 'http://localhost:8080/v1/tasks/{id}/attachments/67bb4a94-59b4-43c3-ae90-94e8afb16b09/preview'
                        },
                        data: {
                            href: 'http://localhost:8080/v1/tasks/{id}/attachments/67bb4a94-59b4-43c3-ae90-94e8afb16b09/data'
                        },
                        original: {
                            href: 'http://localhost:8080/v1/tasks/{id}/attachments/67bb4a94-59b4-43c3-ae90-94e8afb16b09/original'
                        }
                    },
                    id: '67bb4a94-59b4-43c3-ae90-94e8afb16b09'
                }
            ],
            _links: {
                self: {
                    href: 'self'
                }
            }
        },
    },
    _links: {
        self: {
            href: 'self'
        }
    }
};

export const MOCK_MESSAGE_LIST: MessageListResource = {
    messages: [MOCK_MESSAGE_1, MOCK_MESSAGE_2],
    _links: {
        self: {
            href: 'self'
        },
        prev: {
            href: 'self'
        }
    }
};
