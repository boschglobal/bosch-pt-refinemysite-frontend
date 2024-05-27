/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {UserChildrenComponent} from './user-children.component';
import {UserProfileModule} from './user-profile/user-profile.module';

@NgModule({
    imports: [
        RouterModule,
        UserProfileModule
    ],
    declarations: [
        UserChildrenComponent
    ]
})
export class UserChildrenModule {
}
