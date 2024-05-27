/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {EffectsModule} from '@ngrx/effects';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {EmployableUserEffects} from './store/employable-user/employable-user.effects';
import {SharedModule} from '../shared/shared.module';
import {UserChildrenModule} from './user-children/user-children.module';
import {UserCommonModule} from './user-common/user-common.module';
import {UserComponent} from './user.component';
import {UserEffects} from './store/user/user.effects';

@NgModule({
    imports: [
        EffectsModule.forFeature([UserEffects, EmployableUserEffects]),
        RouterModule,
        SharedModule,
        UserChildrenModule,
        UserCommonModule
    ],
    declarations: [
        UserComponent
    ],
})
export class UserModule {
}
