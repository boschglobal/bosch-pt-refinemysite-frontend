/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared/shared.module';
import {CompanyCaptureComponent} from './presentationals/company-capture/company-capture.component';

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        CompanyCaptureComponent
    ],
    exports: [
        CompanyCaptureComponent
    ]
})
export class CompanyCommonModule {
}
