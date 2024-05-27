/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {AuthCommonModule} from '../auth-common/auth-common.module';
import {LoginComponent} from './presentationals/login-component/login.component';

@NgModule({
    imports: [
        AuthCommonModule,
        IconModule,
        RouterModule,
    ],
    declarations: [
        LoginComponent,
    ],
    exports: [
        LoginComponent,
    ],
})
export class AuthLoginModule {
}
