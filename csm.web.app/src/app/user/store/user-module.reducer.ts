/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    ActionReducer,
    combineReducers
} from '@ngrx/store';

import {LEGAL_DOCUMENTS_REDUCER} from './legal-documents/legal-documents.reducer';
import {PAT_REDUCER} from './pats/pat.reducer';
import {USER_REDUCER} from './user/user.reducer';
import {UserModuleSlice} from './user-module.slice';

export const USER_MODULE_REDUCERS = {
    userSlice: USER_REDUCER,
    legalDocumentsSlice: LEGAL_DOCUMENTS_REDUCER,
    patSlice: PAT_REDUCER,
};

export const USER_MODULE_REDUCER: ActionReducer<UserModuleSlice> = combineReducers(USER_MODULE_REDUCERS);
