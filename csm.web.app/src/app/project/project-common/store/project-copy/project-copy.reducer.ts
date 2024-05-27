/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {
    ProjectCopyActionEnum,
    ProjectCopyActions
} from './project-copy.actions';
import {PROJECT_COPY_SLICE_INITIAL_STATE} from './project-copy.initial-state';
import {ProjectCopySlice} from './project-copy.slice';

export function projectCopyReducer(state: ProjectCopySlice = PROJECT_COPY_SLICE_INITIAL_STATE,
                                   action: ProjectCopyActions): ProjectCopySlice {
    switch (action.type) {

        case ProjectCopyActionEnum.InitializeAll:
            return PROJECT_COPY_SLICE_INITIAL_STATE;

        case ProjectCopyActionEnum.CopyOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case ProjectCopyActionEnum.CopyOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case ProjectCopyActionEnum.CopyOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case ProjectCopyActionEnum.CopyOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        default:
            return state;
    }
}

export const PROJECT_COPY_REDUCER: ActionReducer<ProjectCopySlice> = projectCopyReducer;
