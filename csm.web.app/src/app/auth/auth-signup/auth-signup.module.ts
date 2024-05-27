/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {AuthCommonModule} from '../auth-common/auth-common.module';
import {SignupComponent} from './containers/signup-component/signup.component';

@NgModule({
    imports: [
        AuthCommonModule,
        IconModule
    ],
    declarations: [
        SignupComponent
    ],
    exports: [
        SignupComponent
    ]
})
export class AuthSignupModule {

}
