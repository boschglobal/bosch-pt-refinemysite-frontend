/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {LoginComponent} from './presentationals/login-component/login.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule
    ],
    declarations: [
        LoginComponent
    ],
    exports: [
        LoginComponent
    ]
})
export class AuthLoginModule {
}
