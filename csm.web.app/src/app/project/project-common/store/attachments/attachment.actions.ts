/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ObjectListIdentifierPair} from '../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {AttachmentListResource} from '../../api/attachments/resources/attachment-list.resource';

export enum AttachmentActionEnum {
    InitializeAll = '[Attachments] Initialize all',
    RequestAllByTask = '[Attachments] Request all by task',
    RequestAllByTaskFulfilled = '[Attachments] Request all by task fulfilled',
    RequestAllByTaskRejected = '[Attachments] Request all by task rejected',
    RemoveAllByMessage = '[Attachments] Remove all by message',
    RemoveAllByTopic = '[Attachments] Remove all by topic',
    DeleteOne = '[Attachments] Delete one',
    DeleteOneFulfilled = '[Attachments] Delete one fulfilled',
    DeleteOneRejected = '[Attachments] Delete one rejected',
    DeleteOneReset = '[Attachments] Delete one reset',
}

export namespace AttachmentActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = AttachmentActionEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Remove {
        export class AllByTopic implements Action {
            readonly type = AttachmentActionEnum.RemoveAllByTopic;

            constructor(public payload: string) {
            }
        }

        export class AllByMessage implements Action {
            readonly type = AttachmentActionEnum.RemoveAllByMessage;

            constructor(public payload: string) {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = AttachmentActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = AttachmentActionEnum.DeleteOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = AttachmentActionEnum.DeleteOneRejected;
        }

        export class OneReset implements Action {
            readonly type = AttachmentActionEnum.DeleteOneReset;
        }
    }

    export namespace Request {
        export class AllByTask implements Action {
            readonly type = AttachmentActionEnum.RequestAllByTask;

            constructor(public payload: RequestAllAttachmentsPayload) {
            }
        }

        export class AllByTaskFulfilled implements Action {
            readonly type = AttachmentActionEnum.RequestAllByTaskFulfilled;

            constructor(public payload: RequestAllAttachmentsFulfilledPayload) {
            }
        }

        export class AllByTaskRejected implements Action {
            readonly type = AttachmentActionEnum.RequestAllByTaskRejected;

            constructor(public payload: string) {
            }
        }
    }
}

export interface RequestAllAttachmentsPayload {
    includeChildren?: boolean;
    objectIdentifier: ObjectListIdentifierPair;
}

interface RequestAllAttachmentsFulfilledPayload {
    attachmentList: AttachmentListResource;
    objectIdentifier: ObjectListIdentifierPair;
}

export type AttachmentActions =
    AttachmentActions.Initialize.All |
    AttachmentActions.Remove.AllByMessage |
    AttachmentActions.Remove.AllByTopic |
    AttachmentActions.Delete.One |
    AttachmentActions.Delete.OneFulfilled |
    AttachmentActions.Delete.OneRejected |
    AttachmentActions.Delete.OneReset |
    AttachmentActions.Request.AllByTask |
    AttachmentActions.Request.AllByTaskFulfilled |
    AttachmentActions.Request.AllByTaskRejected;
