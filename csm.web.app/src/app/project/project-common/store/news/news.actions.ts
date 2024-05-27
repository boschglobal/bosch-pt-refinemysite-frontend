/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {NewsListResource} from '../../api/news/resources/news-list.resource';

export enum NewsActionEnum {
    InitializeAll = '[News] Initialize all',
    DeleteAll = '[News] Delete all',
    DeleteAllFulfilled = '[News] Delete all fulfilled',
    DeleteAllRejected = '[News] Delete all rejected',
    Delete = '[News] Delete',
    DeleteFulfilled = '[News] Delete fulfilled',
    DeleteRejected = '[News] Delete rejected',
    RequestAll = '[News] Request all',
    RequestAllFulfilled = '[News] Request all fulfilled',
    RequestAllRejected = '[News] Request all rejected',
}

export namespace NewsActions {

    export namespace Initialize {
        export class News implements Action {
            public readonly type = NewsActionEnum.InitializeAll;

            constructor() {
            }
        }
    }

    export namespace Delete {
        export class AllNews implements Action {
            public readonly type = NewsActionEnum.DeleteAll;

            constructor() {
            }
        }

        export class News implements Action {
            public readonly type = NewsActionEnum.Delete;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class NewsFulfilled implements Action {
            public readonly type = NewsActionEnum.DeleteFulfilled;

            constructor(public payload: ObjectIdentifierPair) {
            }
        }

        export class AllNewsFulfilled implements Action {
            public readonly type = NewsActionEnum.DeleteAllFulfilled;

            constructor() {
            }
        }

        export class NewsRejected implements Action {
            public readonly type = NewsActionEnum.DeleteRejected;

            constructor() {
            }
        }

        export class AllNewsRejected implements Action {
            public readonly type = NewsActionEnum.DeleteAllRejected;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class AllNews implements Action {
            public readonly type = NewsActionEnum.RequestAll;

            constructor(public payload: ObjectIdentifierPair[]) {
            }
        }

        export class AllNewsFulfilled implements Action {
            public readonly type = NewsActionEnum.RequestAllFulfilled;

            constructor(public payload: NewsListResource) {
            }
        }

        export class AllNewsRejected implements Action {
            public readonly type = NewsActionEnum.RequestAllRejected;

            constructor() {
            }
        }
    }
}

export type NewsActions =
    NewsActions.Initialize.News |
    NewsActions.Delete.AllNews |
    NewsActions.Delete.AllNewsFulfilled |
    NewsActions.Delete.AllNewsRejected |
    NewsActions.Delete.News |
    NewsActions.Delete.NewsFulfilled |
    NewsActions.Delete.NewsRejected |
    NewsActions.Request.AllNews |
    NewsActions.Request.AllNewsFulfilled |
    NewsActions.Request.AllNewsRejected;
