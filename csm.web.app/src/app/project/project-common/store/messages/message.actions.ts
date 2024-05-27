/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {MessageResource} from '../../api/messages/resources/message.resource';
import {MessageListResource} from '../../api/messages/resources/message-list.resource';
import {SaveMessageResource} from '../../api/messages/resources/save-message.resource';
import {SaveMessageFileResource} from '../../api/messages/resources/save-message-file.resource';

export enum MessageActionEnum {
    InitializeAll = '[Message] Initialize all',
    InitializeAllByTopic = '[Message] Initialize all by topic',
    CreateOne = '[Message] Create one',
    CreateOneFulfilled = '[Message] Create one fulfilled',
    CreateOneRejected = '[Message] Create one rejected',
    CreateOneReset = '[Message] Create one reset',
    RequestAll = '[Message] Request all',
    RequestAllFulfilled = '[Message] Request all fulfilled',
    RequestAllRejected = '[Message] Request all rejected',
    DeleteOne = '[Message] Delete one',
    DeleteOneFulfilled = '[Message] Delete one fulfilled',
    DeleteOneRejected = '[Message] Delete one rejected',
    DeleteOneReset = '[Message] Delete one reset'
}

export enum MessageAttachmentActionEnum {
    CreateAll = '[Message Attachment] Create all'
}

export namespace MessageActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = MessageActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class AllByTopic implements Action {
            readonly type = MessageActionEnum.InitializeAllByTopic;

            constructor(public payload: string) {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            readonly type = MessageActionEnum.CreateOne;

            constructor(public payload: SaveMessageResource) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = MessageActionEnum.CreateOneFulfilled;

            constructor(public payload: MessageResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = MessageActionEnum.CreateOneRejected;

            constructor(public payload: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = MessageActionEnum.CreateOneReset;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = MessageActionEnum.RequestAll;

            constructor(public payload: RequestAllMessagesPayload) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = MessageActionEnum.RequestAllFulfilled;

            constructor(public payload: RequestAllMessagesFulfilledPayload) {
            }
        }

        export class AllRejected implements Action {
            readonly type = MessageActionEnum.RequestAllRejected;

            constructor(public payload: string) {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = MessageActionEnum.DeleteOne;

            constructor(public payload: DeleteMessagePayloadBase) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = MessageActionEnum.DeleteOneFulfilled;

            constructor(public payload: DeleteMessagePayloadBase) {
            }
        }

        export class OneRejected implements Action {
            readonly type = MessageActionEnum.DeleteOneRejected;

            constructor(public payload: string) {
            }
        }

        export class OneReset implements Action {
            readonly type = MessageActionEnum.DeleteOneReset;

            constructor(public payload: string) {
            }
        }
    }
}

export namespace MessageAttachmentActions {
    export namespace Create {
        export class All implements Action {
            readonly type = MessageAttachmentActionEnum.CreateAll;

            constructor(public payload: SaveMessageFileResource) {
            }
        }
    }
}

interface RequestAllMessagesPayload {
    topicId: string;
    lastMessageId?: string;
    limit?: number;
}

interface RequestAllMessagesFulfilledPayload {
    messageList: MessageListResource;
    topicId: string;
}

interface DeleteMessagePayloadBase {
    topicId: string;
    messageId: string;
}

export type MessageActions =
    MessageActions.Initialize.All |
    MessageActions.Initialize.AllByTopic |
    MessageActions.Create.One |
    MessageActions.Create.OneFulfilled |
    MessageActions.Create.OneRejected |
    MessageActions.Create.OneReset |
    MessageActions.Request.All |
    MessageActions.Request.AllFulfilled |
    MessageActions.Request.AllRejected |
    MessageActions.Delete.One |
    MessageActions.Delete.OneFulfilled |
    MessageActions.Delete.OneRejected |
    MessageActions.Delete.OneReset |
    MessageAttachmentActions.Create.All;
