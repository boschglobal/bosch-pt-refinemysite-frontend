/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../../shared/shared.module';
import {UserCommonModule} from '../../user-common/user-common.module';
import {UserEditComponent} from './containers/user-edit-component/user-edit.component';

@NgModule({
    imports: [
        SharedModule,
        UserCommonModule
    ],
    declarations: [
        UserEditComponent
    ],
    exports: [
        UserEditComponent
    ]
})
export class UserEditModule {
}
