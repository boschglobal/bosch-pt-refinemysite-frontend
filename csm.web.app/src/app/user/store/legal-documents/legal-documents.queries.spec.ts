/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';

import {
    MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1
} from '../../../../test/mocks/user-legal-documents';
import {State} from '../../../app.reducers';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {LegalDocumentResource} from '../../api/resources/user-legal-documents.resource';
import {LegalDocumentTypeEnum} from '../../user-common/enums/legal-document-type.enum';
import {USER_MODULE_INITIAL_STATE} from '../user-module.initial-state';
import {LEGAL_DOCUMENTS_SLICE_INITIAL_STATE} from './legal-documents.initial-state';
import {LegalDocumentsQueries} from './legal-documents.queries';

describe('Legal Documents Queries', () => {
    let legalDocumentsQueries: LegalDocumentsQueries;
    let store: MockStore;

    const initialState: Pick<State, 'userModule'> = {
        userModule: {
            ...USER_MODULE_INITIAL_STATE,
            legalDocumentsSlice: LEGAL_DOCUMENTS_SLICE_INITIAL_STATE,
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
        ],
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        legalDocumentsQueries = TestBed.inject(LegalDocumentsQueries);
        store = TestBed.inject(MockStore);
    });

    it('should observe legal documents status', () => {
        legalDocumentsQueries
            .observeLegalDocumentsRequestStatus()
            .subscribe(result => {
                expect(result).toEqual(RequestStatusEnum.empty);
            });
    });

    it('should observe legal documents list', () => {
        legalDocumentsQueries
            .observeLegalDocumentsList()
            .subscribe(result => {
                expect(result).toEqual(LEGAL_DOCUMENTS_SLICE_INITIAL_STATE.items);
            });
    });

    it('should observe legal documents list only with supported document types', () => {
        const newState = cloneDeep(initialState);
        const unsupportedLegalDocument: LegalDocumentResource = {
            ...MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
            type: 'AAA' as LegalDocumentTypeEnum,
        };
        const items = [
            unsupportedLegalDocument,
            MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
        ];
        const expectedResult = [MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1];

        newState.userModule.legalDocumentsSlice.items = items;
        setStoreState(newState);

        legalDocumentsQueries
            .observeLegalDocumentsList()
            .subscribe(result => {
                expect(result).toEqual(expectedResult);
            });
    });

    it('should not emit legal documents to consent when there no are documents to consent', () => {
        const results = [];

        legalDocumentsQueries
            .observeLegalDocumentsListToConsent()
            .subscribe(result => results.push(result));

        expect(results.length).toBe(0);
    });

    it('should observe to consent legal documents list when there are documents to consent', () => {
        const results = [];
        const newState = cloneDeep(initialState);
        const items = [MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
            MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1];
        const expectedResult = [MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1];

        newState.userModule.legalDocumentsSlice.items = items;
        newState.userModule.legalDocumentsSlice.delayed = 0;

        setStoreState(newState);

        legalDocumentsQueries
            .observeLegalDocumentsListToConsent()
            .subscribe(result => results.push(result));

        expect(results.length).toBe(1);
        expect(results[0]).toEqual(expectedResult);
    });

    it('should not emit legal documents to consent when there are documents to consent but the user has delayed the consent', () => {
        const results = [];
        const newState = cloneDeep(initialState);
        const items = [MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1];

        newState.userModule.legalDocumentsSlice.items = items;
        newState.userModule.legalDocumentsSlice.delayed = 10;

        setStoreState(newState);
        legalDocumentsQueries
            .observeLegalDocumentsListToConsent()
            .subscribe(result => results.push(result));

        expect(results.length).toBe(0);
    });
});
