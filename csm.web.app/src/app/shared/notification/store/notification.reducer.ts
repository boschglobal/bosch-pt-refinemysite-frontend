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
import * as moment from 'moment';

import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {NotificationResource} from '../api/resources/notification.resource';
import {
    NotificationActionEnum,
    NotificationActions
} from './notification.actions';
import {NOTIFICATION_SLICE_INITIAL_STATE} from './notification.initial-state';
import {NotificationSlice} from './notification.slice';

export function notificationReducer(state: NotificationSlice = NOTIFICATION_SLICE_INITIAL_STATE, action: NotificationActions): NotificationSlice {
    switch (action.type) {

        case NotificationActionEnum.RequestAll:
        case NotificationActionEnum.RequestAllAfter:
        case NotificationActionEnum.RequestAllBefore:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    requestStatus: RequestStatusEnum.progress
                })
            });

        case NotificationActionEnum.RequestAllFulfilled: {
            const {items, lastSeen, _links} = action.payload;
            const ids = items.map(item => item.id);
            const lastAdded = items.length ? items[0].date : null;

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    ids,
                    lastAdded,
                    lastSeen,
                    _links,
                    requestStatus: RequestStatusEnum.success,
                })
            });
        }

        case NotificationActionEnum.RequestAllAfterFulfilled: {
            const items = [...action.payload.items].reverse();
            const ids = items.map(item => item.id);

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    ids: union(ids, state.list.ids),
                    requestStatus: RequestStatusEnum.success,
                })
            });
        }

        case NotificationActionEnum.RequestAllBeforeFulfilled: {
            const {items, _links} = action.payload;
            const ids = items.map(item => item.id);

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    _links,
                    ids: union(state.list.ids, ids),
                    requestStatus: RequestStatusEnum.success,
                })
            });
        }

        case NotificationActionEnum.RequestAllRejected:
        case NotificationActionEnum.RequestAllAfterRejected:
        case NotificationActionEnum.RequestAllBeforeRejected:
            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    requestStatus: RequestStatusEnum.error
                })
            });

        case NotificationActionEnum.SetAsReadFulfilled: {
            const itemId = action.payload;
            const oldItem = state.items.find(item => item.id === itemId);
            const updatedItem = Object.assign(new NotificationResource(), oldItem, {read: true});

            return Object.assign({}, state, {
                items: unionBy([updatedItem], state.items, 'id'),
            });
        }

        case NotificationActionEnum.SetAsSeenFulfilled: {
            const lastSeen = action.payload;

            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    lastSeen,
                })
            });
        }

        case NotificationActionEnum.SetLastAdded: {
            const lastAdded = action.payload;
            const isLastAddedNewer = !state.list.lastAdded || moment(lastAdded).isAfter(moment(state.list.lastAdded));
            let updatedState = state;

            if (isLastAddedNewer) {
                updatedState = Object.assign({}, state, {
                    list: Object.assign(new AbstractMarkableList(), state.list, {
                        lastAdded,
                    })
                });
            }

            return updatedState;
        }

        default:
            return state;
    }
}

export const NOTIFICATION_REDUCER: ActionReducer<NotificationSlice> = notificationReducer;
