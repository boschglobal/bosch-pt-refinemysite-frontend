/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {ActionReducer} from '@ngrx/store';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {
    ProjectImportActionEnum,
    ProjectImportActions,
} from './project-import.actions';
import {PROJECT_IMPORT_INITIAL_STATE} from './project-import.initial-state';
import {
    ProjectImportSlice,
    ProjectImportStep
} from './project-import.slice';

const ACTION_STEPS_MAP: { [action in ProjectImportActionEnum]: ProjectImportStep } = {
    [ProjectImportActionEnum.UploadOne]: 'upload',
    [ProjectImportActionEnum.UploadOneFulfilled]: 'upload',
    [ProjectImportActionEnum.UploadOneRejected]: 'upload',
    [ProjectImportActionEnum.UploadOneReset]: 'upload',
    [ProjectImportActionEnum.AnalyzeOne]: 'analyze',
    [ProjectImportActionEnum.AnalyzeOneFulfilled]: 'analyze',
    [ProjectImportActionEnum.AnalyzeOneRejected]: 'analyze',
    [ProjectImportActionEnum.ImportOne]: 'import',
    [ProjectImportActionEnum.ImportOneFulfilled]: 'import',
    [ProjectImportActionEnum.ImportOneRejected]: 'import',
    [ProjectImportActionEnum.InitializeAll]: null,
};

export function projectImportReducer(state: ProjectImportSlice = PROJECT_IMPORT_INITIAL_STATE,
                                     action: ProjectImportActions): ProjectImportSlice {
    switch (action.type) {
        case ProjectImportActionEnum.InitializeAll:
            return PROJECT_IMPORT_INITIAL_STATE;

        case ProjectImportActionEnum.UploadOne:
        case ProjectImportActionEnum.AnalyzeOne:
        case ProjectImportActionEnum.ImportOne:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.progress,
                }),
            });

        case ProjectImportActionEnum.UploadOneFulfilled:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.success,
                }),
                uploadResponse: action.payload,
            });

        case ProjectImportActionEnum.AnalyzeOneFulfilled:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.success,
                }),
                analyzeResponse: action.payload,
            });

        case ProjectImportActionEnum.ImportOneFulfilled:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.success,
                }),
            });

        case ProjectImportActionEnum.UploadOneRejected:
        case ProjectImportActionEnum.AnalyzeOneRejected:
        case ProjectImportActionEnum.ImportOneRejected:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.error,
                }),
            });

        case ProjectImportActionEnum.UploadOneReset:
            return Object.assign<Object, ProjectImportSlice, Partial<ProjectImportSlice>>({}, state, {
                requestStatus: Object.assign({}, state.requestStatus, {
                    [ACTION_STEPS_MAP[action.type]]: RequestStatusEnum.empty,
                }),
            });

        default:
            return state;
    }
}

export const PROJECT_IMPORT_REDUCER: ActionReducer<ProjectImportSlice> = projectImportReducer;
