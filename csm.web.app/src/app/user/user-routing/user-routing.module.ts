/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {UserEditModule} from '../user-children/user-edit/user-edit.module';
import {UserProfileModule} from '../user-children/user-profile/user-profile.module';

@NgModule({
    imports: [
        UserEditModule,
        UserProfileModule
    ]
})
export class UserRoutingModule {
}
