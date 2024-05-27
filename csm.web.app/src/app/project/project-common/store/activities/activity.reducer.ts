/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    union,
    unionBy
} from 'lodash';

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ActivityResource} from '../../api/activities/resources/activity.resource';
import {
    ActivityActionEnum,
    ActivityActions
} from './activity.actions';
import {ACTIVITY_SLICE_INITIAL_STATE} from './activity.initial-state';
import {ActivitySlice} from './activity.slice';

export function activityReducer(state: ActivitySlice = ACTIVITY_SLICE_INITIAL_STATE, action: ActivityActions): ActivitySlice {
    switch (action.type) {

        case ActivityActionEnum.INITIALIZE_ALL_ACTIVITIES:
            return ACTIVITY_SLICE_INITIAL_STATE;

        case ActivityActionEnum.REQUEST_ALL_ACTIVITIES:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case ActivityActionEnum.REQUEST_ALL_ACTIVITIES_FULFILLED:
            const items: ActivityResource[] = action.payload.activities;
            const ids: string[] = items.map((topic: ActivityResource) => topic.id);

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractList(), state.list, {
                    ids: union(state.list.ids, ids),
                    requestStatus: RequestStatusEnum.success,
                    _links: action.payload._links
                })
            });

        case ActivityActionEnum.REQUEST_ALL_ACTIVITIES_REJECTED:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        default:
            return state;
    }
}

export const ACTIVITY_REDUCER: ActionReducer<ActivitySlice> = activityReducer;
