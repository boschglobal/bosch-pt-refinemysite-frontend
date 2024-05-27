/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MasterDataModule} from '../shared/master-data/master-data.module';
import {AuthComponent} from './auth.component';
import {AuthCommonModule} from './auth-common/auth-common.module';
import {AuthLoginModule} from './auth-login/auth-login.module';
import {AuthRegisterModule} from './auth-register/auth-register.module';
import {AUTH_ROUTES} from './auth-routing/auth-routing.routes';
import {AuthSignupModule} from './auth-signup/auth-signup.module';

@NgModule({
    imports: [
        AuthCommonModule,
        AuthLoginModule,
        AuthRegisterModule,
        AuthSignupModule,
        MasterDataModule,
        RouterModule.forChild(AUTH_ROUTES),
    ],
    declarations: [
        AuthComponent,
    ],
})
export class AuthModule {

}
