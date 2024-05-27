/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    isEqual,
    uniqWith
} from 'lodash';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {NewsResource} from '../../api/news/resources/news.resource';
import {
    NewsActionEnum,
    NewsActions
} from './news.actions';
import {NEWS_SLICE_INITIAL_STATE} from './news.initial-state';
import {NewsSlice} from './news.slice';

export function newsReducer(state: NewsSlice = NEWS_SLICE_INITIAL_STATE, action: NewsActions): NewsSlice {
    switch (action.type) {

        case NewsActionEnum.InitializeAll:
        case NewsActionEnum.DeleteAllFulfilled:
            return NEWS_SLICE_INITIAL_STATE;

        case NewsActionEnum.RequestAllFulfilled:
            const items: NewsResource[] = action.payload.items.map(item => {
                const {context, parent, root} = item;
                return Object.assign({}, item, {
                    context: new ObjectIdentifierPair(context.type, context.identifier),
                    parent: new ObjectIdentifierPair(parent.type, parent.identifier),
                    root: new ObjectIdentifierPair(root.type, root.identifier),
                });
            });

            return Object.assign({}, state, {
                items: uniqWith([...items, ...state.items], isEqual),
            });

        case NewsActionEnum.DeleteFulfilled:
            return Object.assign({}, state, {
                items: state.items.filter((item) => !item.root.isSame(action.payload)),
            });

        default:
            return state;
    }
}

export const NEWS_REDUCER: ActionReducer<NewsSlice> = newsReducer;
