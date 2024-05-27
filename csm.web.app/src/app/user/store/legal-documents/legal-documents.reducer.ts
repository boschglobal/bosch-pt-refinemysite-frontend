/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {
    LegalDocumentsActions,
    LegalDocumentsEnum
} from './legal-documents.actions';
import {LEGAL_DOCUMENTS_SLICE_INITIAL_STATE} from './legal-documents.initial-state';
import {LegalDocumentsSlice} from './legal-documents.slice';

export function legalDocumentsReducer(
    state: LegalDocumentsSlice = LEGAL_DOCUMENTS_SLICE_INITIAL_STATE, action: LegalDocumentsActions): LegalDocumentsSlice {
    switch (action.type) {

        case LegalDocumentsEnum.RequestAll:
        case LegalDocumentsEnum.RequestAllUnregistered:
        case LegalDocumentsEnum.ConsentAll:
        case LegalDocumentsEnum.DelayConsent:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.progress,
            });

        case LegalDocumentsEnum.RequestAllFulfilled:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.success,
                items: action.payload.items,
                delayed: action.payload.delayed,
            });

        case LegalDocumentsEnum.RequestAllRejected:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.error,
                items: LEGAL_DOCUMENTS_SLICE_INITIAL_STATE.items,
                delayed: LEGAL_DOCUMENTS_SLICE_INITIAL_STATE.delayed,
            });

        case LegalDocumentsEnum.ConsentAllFulfilled:
        case LegalDocumentsEnum.DelayConsentFulfilled:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.success,
            });

        case LegalDocumentsEnum.ConsentAllRejected:
        case LegalDocumentsEnum.DelayConsentRejected:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.error,
            });

        case LegalDocumentsEnum.RequestAllUnregisteredFulfilled:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.success,
                items: action.payload.items,
            });

        case LegalDocumentsEnum.RequestAllUnregisteredRejected:
            return Object.assign<Object, LegalDocumentsSlice, Partial<LegalDocumentsSlice>>({}, state, {
                requestStatus: RequestStatusEnum.error,
                items: LEGAL_DOCUMENTS_SLICE_INITIAL_STATE.items,
            });

        default:
            return state;
    }
}

export const LEGAL_DOCUMENTS_REDUCER = legalDocumentsReducer;
