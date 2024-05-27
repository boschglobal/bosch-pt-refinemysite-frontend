/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {
    cloneDeep,
    groupBy,
} from 'lodash';

import {
    MOCK_ABSTRACT_RELATION_LIST,
    MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE,
    MOCK_RELATION_RESOURCE_1,
    MOCK_RELATION_RESOURCE_2,
    MOCK_RELATION_RESOURCE_3,
    MOCK_SAVE_RELATION_RESOURCE_1,
    MOCK_SAVE_RELATION_RESOURCE_2,
} from '../../../../../test/mocks/relations';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {ObjectIdentifierPairWithVersion} from '../../../../shared/misc/api/datatypes/object-identifier-pair-with-version.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListResource} from '../../api/relations/resources/relation-list.resource';
import {SaveRelationResource} from '../../api/relations/resources/save-relation.resource';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {RelationActions} from './relation.actions';
import {RELATION_INITIAL_STATE} from './relation.initial-state';
import {RELATION_REDUCER} from './relation.reducer';
import {RelationSlice} from './relation.slice';

describe('Relation Reducer', () => {
    let initialState: RelationSlice;
    let midState: RelationSlice;
    let nextState: RelationSlice;

    const relationListResource: RelationListResource = MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE;
    const abstractRelationList: AbstractItemsResource<RelationResource> = MOCK_ABSTRACT_RELATION_LIST;
    const saveRelationResources: SaveRelationResource[] = [
        MOCK_SAVE_RELATION_RESOURCE_1,
        MOCK_SAVE_RELATION_RESOURCE_2,
    ];

    beforeEach(() => {
        initialState = RELATION_INITIAL_STATE;
        midState = cloneDeep(RELATION_INITIAL_STATE);
        nextState = cloneDeep(RELATION_INITIAL_STATE);
    });

    it('should handle RelationActions.Initialize.All()', () => {
        const action = new RelationActions.Initialize.All();

        expect(RELATION_REDUCER(initialState, action)).toBe(initialState);
    });

    it('should handle RelationActions.Request.AllFulfilled()', () => {
        const action: Action = new RelationActions.Request.AllFulfilled(relationListResource);
        const existingRelationId = MOCK_RELATION_RESOURCE_3.id;
        const groupedItems = groupBy(relationListResource.items, 'type');

        midState.items = [MOCK_RELATION_RESOURCE_3];
        midState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: [existingRelationId],
            }),
        });

        nextState.items = [...relationListResource.items, ...midState.items];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: [
                    ...groupedItems[RelationTypeEnum.FinishToStart].map(item => item.id),
                    existingRelationId,
                ],
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                ids: [...groupedItems[RelationTypeEnum.PartOf].map(item => item.id)],
            }),
        });

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Request.AllByIdsFulfilled()', () => {
        const action: Action = new RelationActions.Request.AllByIdsFulfilled(abstractRelationList);
        const existingRelationId = MOCK_RELATION_RESOURCE_3.id;
        const groupedItems = groupBy(abstractRelationList.items, 'type');

        midState.items = [MOCK_RELATION_RESOURCE_3];
        midState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: [existingRelationId],
            }),
        });

        nextState.items = [...abstractRelationList.items, ...midState.items];
        nextState.lists = Object.assign(new Map(), midState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: [
                    ...groupedItems[RelationTypeEnum.FinishToStart].map(item => item.id),
                    existingRelationId,
                ],
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                ids: [...groupedItems[RelationTypeEnum.PartOf].map(item => item.id)],
            }),
        });

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Create.All()', () => {
        const action: Action = new RelationActions.Create.All(saveRelationResources, 'foo');

        nextState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        expect(RELATION_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Create.AllFulfilled()', () => {
        const createdRelations = relationListResource.items;
        const existingRelation = MOCK_RELATION_RESOURCE_3;
        const action: Action = new RelationActions.Create.AllFulfilled(createdRelations);
        const groupedItems = groupBy(createdRelations, 'type');

        midState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
                ids: [existingRelation.id],
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });
        midState.items = [existingRelation];

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.success,
                ids: [
                    ...groupedItems[RelationTypeEnum.FinishToStart].map(item => item.id),
                    existingRelation.id,
                ],
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.success,
                ids: [...groupedItems[RelationTypeEnum.PartOf].map(item => item.id)],
            }),
        });
        nextState.items = [...createdRelations, existingRelation];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Create.AllRejected()', () => {
        const relationTypes: RelationTypeEnum[] = [
            RelationTypeEnum.FinishToStart,
            RelationTypeEnum.PartOf,
        ];
        const action: Action = new RelationActions.Create.AllRejected(relationTypes);

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.error,
            }),
            [RelationTypeEnum.PartOf]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Delete.One()', () => {
        const {id, version, type} = MOCK_RELATION_RESOURCE_1;
        const action: Action = new RelationActions.Delete.One(id, version, 'foo');

        midState.items = [MOCK_RELATION_RESOURCE_1];

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [type]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });
        nextState.items = [MOCK_RELATION_RESOURCE_1];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Delete.OneFulfilled()', () => {
        const deletedRelation = MOCK_RELATION_RESOURCE_1;
        const existingRelation = MOCK_RELATION_RESOURCE_2;
        const {id, type} = deletedRelation;
        const action: Action = new RelationActions.Delete.OneFulfilled(id);

        midState.lists = Object.assign(new Map(), initialState.lists, {
            [type]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
                ids: [existingRelation.id, deletedRelation.id],
            }),
        });
        midState.items = [existingRelation, deletedRelation];

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [type]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.success,
                ids: [existingRelation.id],
            }),
        });
        nextState.items = [existingRelation];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Delete.OneFulfilled() when the delete relation was not in the store', () => {
        const id = 'foo-relation-id';
        const action: Action = new RelationActions.Delete.OneFulfilled(id);

        expect(RELATION_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle RelationActions.Delete.OneRejected()', () => {
        const {id, type} = MOCK_RELATION_RESOURCE_1;
        const action: Action = new RelationActions.Delete.OneRejected(id);

        midState.lists = Object.assign(new Map(), initialState.lists, {
            [type]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.progress,
            }),
        });
        midState.items = [MOCK_RELATION_RESOURCE_1];

        nextState.lists = Object.assign(new Map(), midState.lists, {
            [type]: Object.assign(new AbstractList(), {
                requestStatus: RequestStatusEnum.error,
            }),
        });
        nextState.items = [MOCK_RELATION_RESOURCE_1];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Set.AllCritical()', () => {
        const existingRelations: RelationResource[] = [
            MOCK_RELATION_RESOURCE_1,
            MOCK_RELATION_RESOURCE_2,
            MOCK_RELATION_RESOURCE_3,
        ];
        const criticalRelations: RelationResource[] = [
            MOCK_RELATION_RESOURCE_1,
            MOCK_RELATION_RESOURCE_2,
        ].map(relation => Object.assign(new RelationResource(), relation, {
            version: relation.version + 1,
            critical: true,
        }));
        const existingRelationIds: string[] = existingRelations.map(relation => relation.id);
        const criticalRelationsIdentifierPairs: ObjectIdentifierPairWithVersion[] =
            criticalRelations.map(({id, version}) => new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, version));
        const action: Action = new RelationActions.Set.AllCritical(criticalRelationsIdentifierPairs);

        midState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: existingRelationIds,
            }),
        });
        midState.items = existingRelations;

        nextState.lists = Object.assign(new Map(), midState.lists);
        nextState.items = [
            ...criticalRelations,
            existingRelations[2],
        ];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RelationActions.Set.AllUncritical()', () => {
        const existingRelations: RelationResource[] = [
            MOCK_RELATION_RESOURCE_1,
            MOCK_RELATION_RESOURCE_2,
            MOCK_RELATION_RESOURCE_3,
        ].map(relation => ({...relation, critical: true}));
        const uncriticalRelations: RelationResource[] = [
            MOCK_RELATION_RESOURCE_1,
            MOCK_RELATION_RESOURCE_2,
        ].map(relation => Object.assign(new RelationResource(), relation, {
            version: relation.version + 1,
            critical: false,
        }));
        const existingRelationIds: string[] = existingRelations.map(relation => relation.id);
        const uncriticalRelationsIdentifierPairs: ObjectIdentifierPairWithVersion[] =
            uncriticalRelations.map(({id, version}) => new ObjectIdentifierPairWithVersion(ObjectTypeEnum.Relation, id, version));
        const action: Action = new RelationActions.Set.AllUncritical(uncriticalRelationsIdentifierPairs);

        midState.lists = Object.assign(new Map(), initialState.lists, {
            [RelationTypeEnum.FinishToStart]: Object.assign(new AbstractList(), {
                ids: existingRelationIds,
            }),
        });
        midState.items = existingRelations;

        nextState.lists = Object.assign(new Map(), midState.lists);
        nextState.items = [
            ...uncriticalRelations,
            existingRelations[2],
        ];

        expect(RELATION_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: Action = {type: 'UNKNOWN'};

        expect(RELATION_REDUCER(initialState, action)).toEqual(initialState);
    });
});
