/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {UserCaptureComponent} from './presentationals/user-capture-component/user-capture.component';
import {UserDescriptionDetailsComponent} from './presentationals/user-description-details-component/user-description-details.component';
import {UserEmployeeDetailsComponent} from './presentationals/user-employee-details-component/user-employee-details.component';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        UserCaptureComponent,
        UserDescriptionDetailsComponent,
        UserEmployeeDetailsComponent
    ],
    exports: [
        UserCaptureComponent,
        UserDescriptionDetailsComponent,
        UserEmployeeDetailsComponent
    ]
})
export class UserCommonModule {

}
