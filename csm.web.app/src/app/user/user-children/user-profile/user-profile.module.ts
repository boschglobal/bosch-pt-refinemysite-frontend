/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../../shared/shared.module';
import {IconModule} from '../../../shared/ui/icons/icon.module';
import {PatContentComponent} from './containers/pat-content/pat-content.component';
import {PatCreateComponent} from './containers/pat-create/pat-create.component';
import {PatEditComponent} from './containers/pat-edit/pat-edit.component';
import {UserProfileComponent} from './containers/user-profile-component/user-profile.component';
import {PatCaptureComponent} from './presentationals/pat-capture/pat-capture.component';
import {PatListComponent} from './presentationals/pat-list/pat-list.component';
import {PatTokenComponent} from './presentationals/pat-token/pat-token.component';

@NgModule({
    imports: [
        SharedModule,
        IconModule,
    ],
    declarations: [
        PatCaptureComponent,
        PatContentComponent,
        PatCreateComponent,
        PatEditComponent,
        PatListComponent,
        PatTokenComponent,
        UserProfileComponent,
    ],
    exports: [
        UserProfileComponent,
    ],
})
export class UserProfileModule {
}
