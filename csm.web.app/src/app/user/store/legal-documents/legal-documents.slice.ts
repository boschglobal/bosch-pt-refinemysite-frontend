/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {LegalDocumentListResource} from '../../api/resources/user-legal-documents-list.resource';

export class LegalDocumentsSlice extends LegalDocumentListResource {
    requestStatus: RequestStatusEnum;
}
