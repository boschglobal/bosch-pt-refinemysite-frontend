/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {LegalDocumentsSlice} from './legal-documents.slice';

export const LEGAL_DOCUMENTS_SLICE_INITIAL_STATE: LegalDocumentsSlice = {
    requestStatus: RequestStatusEnum.empty,
    items: [],
    delayed: null,
};
