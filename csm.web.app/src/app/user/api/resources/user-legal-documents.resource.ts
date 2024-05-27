/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {LegalDocumentTypeEnum} from '../../user-common/enums/legal-document-type.enum';

export class LegalDocumentResource {
    public id: string;
    public type: LegalDocumentTypeEnum;
    public displayName: string;
    public url: string;
    public consented?: boolean;
}
