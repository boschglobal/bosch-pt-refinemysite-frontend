/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {CriticalityChange} from '../../../project-children/project-tasks/project-task-children/presentationals/task-topic-card/project-task-topic-card.component';
import {SaveTopicResource} from '../../api/topics/resources/save-topic.resource';
import {SaveTopicAttachmentResource} from '../../api/topics/resources/save-topic-attachment.resource';
import {TopicResource} from '../../api/topics/resources/topic.resource';
import {TopicListResource} from '../../api/topics/resources/topic-list.resource';
import {MessageActions} from '../messages/message.actions';

export enum TopicActionEnum {
    InitializeAll = '[Topic] Initialize all',
    CreateOne = '[Topic] Create one',
    CreateOneFulfilled = '[Topic] Create one fulfilled',
    CreateOneRejected = '[Topic] Create one rejected',
    CreateOneReset = '[Topic] Create one reset',
    RequestOne = '[Topic] Request one',
    RequestOneFulfilled = '[Topic] Request one fulfilled',
    RequestOneRejected = '[Topic] Request one rejected',
    RequestAll = '[Topic] Request all',
    RequestAllFulfilled = '[Topic] Request all fulfilled',
    RequestAllRejected = '[Topic] Request all rejected',
    UpdateCriticality = '[Topic] Update criticality',
    UpdateCriticalityFulfilled = '[Topic] Update criticality fulfilled',
    UpdateList = '[Topic] Update list',
    DeleteOne = '[Topic] Delete one',
    DeleteOneFulfilled = '[Topic] Delete one fulfilled',
    DeleteOneRejected = '[Topic] Delete one rejected',
    DeleteOneReset = '[Topic] Delete one reset',
}

export enum TopicAttachmentActionEnum {
    CreateAll = '[Topic Attachment] Create all',
}

export namespace TopicActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = TopicActionEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            readonly type = TopicActionEnum.CreateOne;

            constructor(public payload: SaveTopicResource, public taskId?: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = TopicActionEnum.CreateOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = TopicActionEnum.CreateOneRejected;
        }

        export class OneReset implements Action {
            readonly type = TopicActionEnum.CreateOneReset;
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = TopicActionEnum.RequestAll;

            constructor(public lastTopicId?: string, public limit: number = 5, public taskId?: string) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = TopicActionEnum.RequestAllFulfilled;

            constructor(public payload: TopicListResource) {
            }
        }

        export class AllRejected implements Action {
            readonly type = TopicActionEnum.RequestAllRejected;
        }

        export class One implements Action {
            readonly type = TopicActionEnum.RequestOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = TopicActionEnum.RequestOneFulfilled;

            constructor(public payload: TopicResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = TopicActionEnum.RequestOneRejected;
        }
    }

    export namespace Update {
        export class Criticality implements Action {
            readonly type = TopicActionEnum.UpdateCriticality;

            constructor(public payload: CriticalityChange) {
            }
        }

        export class CriticalityFulfilled implements Action {
            readonly type = TopicActionEnum.UpdateCriticalityFulfilled;

            constructor(public payload: TopicResource) {
            }
        }

        export class List implements Action {
            readonly type = TopicActionEnum.UpdateList;

            constructor(public payload: string) {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = TopicActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = TopicActionEnum.DeleteOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = TopicActionEnum.DeleteOneRejected;
        }

        export class OneReset implements Action {
            readonly type = TopicActionEnum.DeleteOneReset;
        }
    }
}

export namespace TopicAttachmentActions {
    export namespace Create {
        export class All implements Action {
            readonly type = TopicAttachmentActionEnum.CreateAll;

            constructor(public payload: SaveTopicAttachmentResource) {
            }
        }
    }
}

export type TopicActions =
    TopicActions.Initialize.All |
    TopicActions.Create.One |
    TopicActions.Create.OneFulfilled |
    TopicActions.Create.OneRejected |
    TopicActions.Create.OneReset |
    TopicActions.Request.All |
    TopicActions.Request.AllFulfilled |
    TopicActions.Request.AllRejected |
    TopicActions.Request.One |
    TopicActions.Request.OneFulfilled |
    TopicActions.Request.OneRejected |
    TopicActions.Update.Criticality |
    TopicActions.Update.CriticalityFulfilled |
    TopicActions.Update.List |
    TopicActions.Delete.One |
    TopicActions.Delete.OneFulfilled |
    TopicActions.Delete.OneRejected |
    TopicActions.Delete.OneReset |
    MessageActions.Create.OneFulfilled |
    MessageActions.Delete.OneFulfilled;
