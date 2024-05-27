/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {LEGAL_DOCUMENTS_SLICE_INITIAL_STATE} from './legal-documents/legal-documents.initial-state';
import {PAT_SLICE_INITIAL_STATE} from './pats/pat.initial-state';
import {USER_SLICE_INITIAL_STATE} from './user/user.initial-state';
import {UserModuleSlice} from './user-module.slice';

export const USER_MODULE_INITIAL_STATE: UserModuleSlice = {
    userSlice: USER_SLICE_INITIAL_STATE,
    legalDocumentsSlice: LEGAL_DOCUMENTS_SLICE_INITIAL_STATE,
    patSlice: PAT_SLICE_INITIAL_STATE,
};
