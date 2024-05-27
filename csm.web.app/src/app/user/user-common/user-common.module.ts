/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared/shared.module';
import {LegalDocumentsModalComponent} from './containers/legal-documents-modal/legal-documents-modal.component';
import {LegalDocumentsComponent} from './presentationals/legal-documents/legal-documents.component';
import {UserCaptureComponent} from './presentationals/user-capture-component/user-capture.component';

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        LegalDocumentsComponent,
        LegalDocumentsModalComponent,
        UserCaptureComponent,
    ],
    exports: [
        UserCaptureComponent,
        LegalDocumentsModalComponent,
    ],
})
export class UserCommonModule {

}
