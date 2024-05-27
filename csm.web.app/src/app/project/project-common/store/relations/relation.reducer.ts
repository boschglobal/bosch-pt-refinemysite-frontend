/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    groupBy,
    union,
    unionBy,
    uniq,
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {RelationListLinks} from '../../api/relations/resources/relation-list.resource';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {
    RelationActionEnum,
    RelationActions,
} from './relation.actions';
import {RELATION_INITIAL_STATE} from './relation.initial-state';
import {RelationSlice} from './relation.slice';

const getRelationType = (state: RelationSlice, relationId: string): RelationTypeEnum => {
    const relation = state.items.find(({id}) => id === relationId);

    return relation?.type;
};

const updateListsWithItems = (state: RelationSlice,
                              items: RelationResource[],
                              requestStatus?: RequestStatusEnum): Map<RelationTypeEnum, AbstractList<RelationListLinks>> => {
    const groupedItems = groupBy(items, 'type');
    const updatedLists = Object.keys(groupedItems).reduce((lists, type) => {
        const newIds = groupedItems[type].map(item => item.id);
        const existingIds = state.lists[type]?.ids || [];

        return {
            ...lists,
            [type]: Object.assign(new AbstractList(), state.lists[type], {
                ids: union(newIds, existingIds),
                ...requestStatus ? {requestStatus} : {},
            }),
        };
    }, {});

    return Object.assign(new Map(), state.lists, updatedLists);
};

const updateListsRequestStatus = (state: RelationSlice,
                                  types: RelationTypeEnum[],
                                  requestStatus: RequestStatusEnum): Map<RelationTypeEnum, AbstractList<RelationListLinks>> => {
    const updatedLists = types.reduce((lists, type) => ({
        ...lists,
        [type]: Object.assign(new AbstractList(), state.lists[type], {requestStatus}),
    }), {});

    return Object.assign(new Map(), state.lists, updatedLists);
};

const updateListsFromDelete = (state: RelationSlice, relationId: string): Map<RelationTypeEnum, AbstractList<RelationListLinks>> => {
    const relationType = getRelationType(state, relationId);
    const existingIds = state.lists[relationType]?.ids || [];
    const updatedLists = relationType
        ? {
            [relationType]: Object.assign(new AbstractList(), state.lists[relationType], {
                requestStatus: RequestStatusEnum.success,
                ids: existingIds.filter(id => id !== relationId),
            }),
        }
        : {};

    return Object.assign(new Map(), state.lists, updatedLists);
};

export function relationReducer(state: RelationSlice = RELATION_INITIAL_STATE, action: RelationActions): RelationSlice {
    switch (action.type) {

        case RelationActionEnum.InitializeAll:
            return RELATION_INITIAL_STATE;

        case RelationActionEnum.RequestAllFulfilled:
        case RelationActionEnum.RequestAllByIdsFulfilled:
            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                items: unionBy(action.list.items, state.items, 'id'),
                lists: updateListsWithItems(state, action.list.items),
            });

        case RelationActionEnum.CreateAll: {
            const types = uniq(action.items.map(item => item.type));

            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                lists: updateListsRequestStatus(state, types, RequestStatusEnum.progress),
            });
        }

        case RelationActionEnum.CreateAllFulfilled:
            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                items: unionBy(action.items, state.items, 'id'),
                lists: updateListsWithItems(state, action.items, RequestStatusEnum.success),
            });

        case RelationActionEnum.CreateAllRejected:
            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                lists: updateListsRequestStatus(state, action.relationTypes, RequestStatusEnum.error),
            });

        case RelationActionEnum.DeleteOne: {
            const relationType = getRelationType(state, action.relationId);

            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                lists: updateListsRequestStatus(state, [relationType], RequestStatusEnum.progress),
            });
        }

        case RelationActionEnum.DeleteOneFulfilled: {
            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                items: state.items.filter(item => item.id !== action.relationId),
                lists: updateListsFromDelete(state, action.relationId),
            });
        }

        case RelationActionEnum.DeleteOneRejected: {
            const relationType = getRelationType(state, action.relationId);

            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                lists: updateListsRequestStatus(state, [relationType], RequestStatusEnum.error),
            });
        }

        case RelationActionEnum.SetAllCritical:
        case RelationActionEnum.SetAllUncritical: {
            const {identifierPairs, type} = action;
            const critical = type === RelationActionEnum.SetAllCritical;
            const updatedRelations = state.items
                .filter(relation => identifierPairs.some(item => item.id === relation.id))
                .map(relation => [relation, identifierPairs.find(item => item.id === relation.id)])
                .map(([relation, {version}]) =>
                    Object.assign(new RelationResource(), relation, {critical, version}));

            return Object.assign<Object, RelationSlice, Partial<RelationSlice>>({}, state, {
                items: unionBy(updatedRelations, state.items, 'id'),
            });
        }

        default:
            return state;
    }
}

export const RELATION_REDUCER: ActionReducer<RelationSlice> = relationReducer;
