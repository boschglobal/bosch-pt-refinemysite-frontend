/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {AuthLoginModule} from './auth-login/auth-login.module';
import {AuthComponent} from './auth.component';
import {AUTH_ROUTES} from './auth-routing/auth-routing.routes';
import {SharedModule} from '../shared/shared.module';
import {UnauthorizedComponent} from './auth-unauthorized/unauthorized.component';

@NgModule({
    imports: [
        AuthLoginModule,
        RouterModule.forChild(AUTH_ROUTES),
        SharedModule
    ],
    declarations: [
        AuthComponent,
        UnauthorizedComponent,
    ]
})
export class AuthModule {

}
