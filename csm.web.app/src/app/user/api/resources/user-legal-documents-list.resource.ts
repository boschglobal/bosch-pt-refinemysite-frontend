/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {LegalDocumentResource} from './user-legal-documents.resource';

export class LegalDocumentListResource {
    public delayed?: number;
    public items: LegalDocumentResource[];
}
