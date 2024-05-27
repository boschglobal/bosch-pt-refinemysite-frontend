/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {LegalDocumentsSlice} from './legal-documents/legal-documents.slice';
import {PATSlice} from './pats/pat.slice';
import {UserSlice} from './user/user.slice';

export interface UserModuleSlice {
    userSlice: UserSlice;
    legalDocumentsSlice: LegalDocumentsSlice;
    patSlice: PATSlice;
}
