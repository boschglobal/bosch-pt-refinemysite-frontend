/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {AuthCommonModule} from '../auth-common/auth-common.module';
import {RegisterComponent} from './containers/register/register.component';

@NgModule({
    imports: [
        AuthCommonModule,
    ],
    declarations: [
        RegisterComponent,
    ],
    exports: [
        RegisterComponent,
    ],
})
export class AuthRegisterModule {

}
