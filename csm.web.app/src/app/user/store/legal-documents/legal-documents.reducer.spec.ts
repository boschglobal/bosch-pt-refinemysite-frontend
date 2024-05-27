/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST} from '../../../../test/mocks/user-legal-documents';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {LanguageEnum} from '../../../shared/translation/helper/language.enum';
import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';
import {CountryEnum} from '../../user-common/enums/country.enum';
import {LegalDocumentsActions} from './legal-documents.actions';
import {LEGAL_DOCUMENTS_SLICE_INITIAL_STATE} from './legal-documents.initial-state';
import {LEGAL_DOCUMENTS_REDUCER} from './legal-documents.reducer';
import {LegalDocumentsSlice} from './legal-documents.slice';

describe('Legal Documents Reducer', () => {
    let initialState: LegalDocumentsSlice;
    let nextState: LegalDocumentsSlice;

    beforeEach(() => {
        initialState = LEGAL_DOCUMENTS_SLICE_INITIAL_STATE;
        nextState = cloneDeep(LEGAL_DOCUMENTS_SLICE_INITIAL_STATE);
    });

    it('should handle RequestAll', () => {
        const action = new LegalDocumentsActions.Request.All();

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllFulfilled', () => {
        const action = new LegalDocumentsActions.Request.AllFulfilled(MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST);

        nextState.items = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST.items;
        nextState.delayed = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST.delayed;
        nextState.requestStatus = RequestStatusEnum.success;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllRejected', () => {
        const action = new LegalDocumentsActions.Request.AllRejected();

        nextState.requestStatus = RequestStatusEnum.error;
        nextState.items = initialState.items;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllUnregistered', () => {
        const action = new LegalDocumentsActions.Request.UnregisteredAll(CountryEnum.PT, LanguageEnum.PT);

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllUnregisteredFulfilled', () => {
        const payload: LegalDocumentListResource = {
            items: MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST.items,
        };

        const action = new LegalDocumentsActions.Request.UnregisteredAllFulfilled(payload);

        nextState.items = MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST.items;
        nextState.requestStatus = RequestStatusEnum.success;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllUnregisteredRejected', () => {
        const action = new LegalDocumentsActions.Request.UnregisteredAllRejected();

        nextState.requestStatus = RequestStatusEnum.error;
        nextState.items = initialState.items;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConsentAll', () => {
        const ids = ['123', '456'];
        const action = new LegalDocumentsActions.Consent.All(ids);

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConsentAllFulfilled', () => {
        const action = new LegalDocumentsActions.Consent.AllFulfilled();

        nextState.requestStatus = RequestStatusEnum.success;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ConsentAllRejected', () => {
        const action = new LegalDocumentsActions.Consent.AllRejected();

        nextState.requestStatus = RequestStatusEnum.error;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DelayConsent', () => {
        const action = new LegalDocumentsActions.Consent.Delay();

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DelayConsentFulfilled', () => {
        const action = new LegalDocumentsActions.Consent.DelayFulfilled();

        nextState.requestStatus = RequestStatusEnum.success;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DelayConsentRejected', () => {
        const action = new LegalDocumentsActions.Consent.DelayRejected();

        nextState.requestStatus = RequestStatusEnum.error;

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle unknown action', () => {
        const action: any = {type: 'UNKNOWN'};

        expect(LEGAL_DOCUMENTS_REDUCER(initialState, action)).toEqual(initialState);
    });
});
