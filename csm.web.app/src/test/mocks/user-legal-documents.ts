/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {LegalDocumentListResource} from '../../app/user/api/resources/user-legal-documents-list.resource';
import {LegalDocumentResource} from '../../app/user/api/resources/user-legal-documents.resource';
import {LegalDocumentTypeEnum} from '../../app/user/user-common/enums/legal-document-type.enum';

export const MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1: LegalDocumentResource = {
    id: '1',
    type: LegalDocumentTypeEnum.TermsAndConditions,
    displayName: 'Legal_Document_1',
    url: 'https://www.google.com/',
    consented: true,
};

export const MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2: LegalDocumentResource = {
    id: '2',
    type: LegalDocumentTypeEnum.Eula,
    displayName: 'Legal_Document_2',
    url: 'https://www.bosch.pt/',
    consented: true,
};

export const MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1: LegalDocumentResource = {
    id: '3',
    type: LegalDocumentTypeEnum.TermsAndConditions,
    displayName: 'Legal_Document_3',
    url: 'https://www.google.com/',
    consented: false,
};

export const MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2: LegalDocumentResource = {
    id: '4',
    type: LegalDocumentTypeEnum.Eula,
    displayName: 'Legal_Document_4',
    url: 'https://www.bosch.pt/',
    consented: false,
};

export const MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_LIST: LegalDocumentListResource = {
    delayed: 10,
    items: [
        MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
        MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_2,
    ],
};

export const MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_LIST: LegalDocumentListResource = {
    delayed: 10,
    items: [
        MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
        MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2,
    ],
};

export const MOCK_USER_LEGAL_DOCUMENTS_MIXED_CONSENTED_LIST: LegalDocumentListResource = {
    delayed: 10,
    items: [
        MOCK_USER_LEGAL_DOCUMENTS_CONSENTED_1,
        MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2,
    ],
};
