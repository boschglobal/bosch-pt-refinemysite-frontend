/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {LegalDocumentsQueries} from '../../../../user/store/legal-documents/legal-documents.queries';

@Component({
    selector: 'ss-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {

    constructor(public legalDocumentsQueries: LegalDocumentsQueries) {
    }
}
