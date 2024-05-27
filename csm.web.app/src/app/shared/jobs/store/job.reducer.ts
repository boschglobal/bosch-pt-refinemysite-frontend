/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';
import {
    union,
    unionBy,
} from 'lodash';

import {AbstractMarkableList} from '../../misc/api/datatypes/abstract-markable-list.datatype';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {JobResource} from '../api/resources/job.resource';
import {
    JobActionEnum,
    JobActions
} from './job.actions';
import {JOB_SLICE_INITIAL_STATE} from './job.initial-state';
import {JobSlice} from './job.slice';

export function jobReducer(state: JobSlice = JOB_SLICE_INITIAL_STATE, action: JobActions): JobSlice {
    switch (action.type) {
        case JobActionEnum.RequestAll: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });
        }

        case JobActionEnum.RequestAllFulfilled: {
            const {items, lastSeen} = action.payload;
            const ids = items.map(item => item.id);

            return Object.assign({}, state, {
                items: unionBy(items, state.items, 'id'),
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    ids,
                    lastSeen,
                    requestStatus: RequestStatusEnum.success,
                }),
            });
        }

        case JobActionEnum.RequestAllRejected: {
            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });
        }

        case JobActionEnum.SetListAsSeenFulfilled: {
            const lastSeen = action.payload;

            return Object.assign({}, state, {
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    lastSeen,
                }),
            });
        }

        case JobActionEnum.SetJobAsReadFulfilled: {
            const job = state.items.find(item => item.id === action.payload);
            const updatedItem = Object.assign(new JobResource(), job, {read: true});

            return Object.assign({}, state, {
                items: unionBy([updatedItem], state.items, 'id'),
            });
        }

        case JobActionEnum.SetJobToWatch: {
            return Object.assign({}, state, {
                watchingIds: union([action.jobId], state.watchingIds),
            });
        }

        case JobActionEnum.UnsetJobToWatch: {
            return Object.assign({}, state, {
                watchingIds: state.watchingIds.filter(jobId => jobId !== action.jobId),
            });
        }

        case JobActionEnum.UpdateOneFulfilled: {
            const lastSeen = state.list.lastSeen || action.payload.lastModifiedDate;

            return Object.assign({}, state, {
                items: unionBy([action.payload], state.items, 'id'),
                list: Object.assign(new AbstractMarkableList(), state.list, {
                    lastSeen,
                    ids: union([action.payload.id], state.list.ids),
                }),
            });
        }

        default:
            return state;
    }
}

export const JOB_REDUCER: ActionReducer<JobSlice> = jobReducer;
