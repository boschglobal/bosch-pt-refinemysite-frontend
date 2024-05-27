/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListResource} from '../../api/relations/resources/relation-list.resource';
import {SaveRelationResource} from '../../api/relations/resources/save-relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {RelationTypeEnum} from '../../enums/relation-type.enum';

export enum RelationActionEnum {
    InitializeAll = '[Relation] Initialize all',
    RequestAll = '[Relation] Request all',
    RequestAllFulfilled = '[Relation] Request all fulfilled',
    RequestAllRejected = '[Relation] Request all rejected',
    RequestAllByIds = '[Relation] Request all by ids',
    RequestAllByIdsFulfilled = '[Relation] Request all by ids fulfilled',
    RequestAllByIdsRejected = '[Relation] Request all by ids rejected',
    CreateAll = '[Relation] Create all',
    CreateAllFulfilled = '[Relation] Create all fulfilled',
    CreateAllRejected = '[Relation] Create all rejected',
    DeleteOne = '[Relation] Delete one',
    DeleteOneFulfilled = '[Relation] Delete one fulfilled',
    DeleteOneRejected = '[Relation] Delete one rejected',
    SetAllCritical = '[Relation] Set all critical',
    SetAllUncritical = '[Relation] Set all uncritical',
}

export namespace RelationActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = RelationActionEnum.InitializeAll;
        }
    }

    export namespace Request {
        export class All implements Action {
            readonly type = RelationActionEnum.RequestAll;

            constructor(public payload: SaveRelationFilters,
                        public withResources?: boolean) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = RelationActionEnum.RequestAllFulfilled;

            constructor(public list: RelationListResource,
                        public withResources?: boolean) {
            }
        }

        export class AllRejected implements Action {
            readonly type = RelationActionEnum.RequestAllRejected;
        }

        export class AllByIds implements Action {
            readonly type = RelationActionEnum.RequestAllByIds;

            constructor(public ids: string[],
                        public withResources?: boolean) {
            }
        }

        export class AllByIdsFulfilled implements Action {
            readonly type = RelationActionEnum.RequestAllByIdsFulfilled;

            constructor(public list: AbstractItemsResource<RelationResource>,
                        public withResources?: boolean) {
            }
        }

        export class AllByIdsRejected implements Action {
            readonly type = RelationActionEnum.RequestAllByIdsRejected;
        }
    }

    export namespace Create {
        export class All implements Action {
            readonly type = RelationActionEnum.CreateAll;

            constructor(public items: SaveRelationResource[],
                        public successMessageKey: string) {
            }
        }

        export class AllFulfilled implements Action {
            readonly type = RelationActionEnum.CreateAllFulfilled;

            constructor(public items: RelationResource[]) {
            }
        }

        export class AllRejected implements Action {
            readonly type = RelationActionEnum.CreateAllRejected;

            constructor(public relationTypes: RelationTypeEnum[]) {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = RelationActionEnum.DeleteOne;

            constructor(public relationId: string,
                        public version: number,
                        public successMessageKey: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = RelationActionEnum.DeleteOneFulfilled;

            constructor(public relationId: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = RelationActionEnum.DeleteOneRejected;

            constructor(public relationId: string) {
            }
        }
    }

    export namespace Set {
        export class AllCritical implements Action {
            readonly type = RelationActionEnum.SetAllCritical;

            constructor(public identifierPairs: ObjectIdentifierPairWithVersion[]) {
            }
        }

        export class AllUncritical implements Action {
            readonly type = RelationActionEnum.SetAllUncritical;

            constructor(public identifierPairs: ObjectIdentifierPairWithVersion[]) {
            }
        }
    }
}

export type RelationActions =
    RelationActions.Initialize.All |
    RelationActions.Request.All |
    RelationActions.Request.AllFulfilled |
    RelationActions.Request.AllRejected |
    RelationActions.Request.AllByIds |
    RelationActions.Request.AllByIdsFulfilled |
    RelationActions.Request.AllByIdsRejected |
    RelationActions.Create.All |
    RelationActions.Create.AllFulfilled |
    RelationActions.Create.AllRejected |
    RelationActions.Delete.One |
    RelationActions.Delete.OneFulfilled |
    RelationActions.Delete.OneRejected |
    RelationActions.Set.AllCritical |
    RelationActions.Set.AllUncritical;
