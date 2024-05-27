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
    ExportProjectActionsEnum,
    ProjectExportActions
} from './project-export.actions';
import {PROJECT_EXPORT_INITIAL_STATE} from './project-export.initial-state';
import {ProjectExportSlice} from './project-export.slice';

export function projectExportReducer(
    state: ProjectExportSlice = PROJECT_EXPORT_INITIAL_STATE,
    action: ProjectExportActions
): ProjectExportSlice {
    switch (action.type) {

        case ExportProjectActionsEnum.InitializeAll:
            return PROJECT_EXPORT_INITIAL_STATE;

        case ExportProjectActionsEnum.ExportOne:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.progress,
                }),
            });

        case ExportProjectActionsEnum.ExportOneFulfilled:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.success,
                }),
            });

        case ExportProjectActionsEnum.ExportOneRejected:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.error,
                }),
            });

        case ExportProjectActionsEnum.ExportOneReset:
            return Object.assign({}, state, {
                currentItem: Object.assign(new AbstractItem(), state.currentItem, {
                    requestStatus: RequestStatusEnum.empty,
                }),
            });

        default:
            return state;
    }
}

export const PROJECT_EXPORT_REDUCER: ActionReducer<ProjectExportSlice> = projectExportReducer;
