/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectCraftsToolbarComponent} from './containers/craft-toolbar/project-crafts-toolbar.component';
import {ProjectCraftsCreateComponent} from './containers/crafts-create/project-crafts-create.component';
import {ProjectCraftsEditComponent} from './containers/crafts-edit/project-crafts-edit.component';
import {ProjectCraftsListComponent} from './containers/crafts-list/project-crafts-list.component';
import {ProjectCraftsComponent} from './presentationals/crafts/project-crafts.component';
import {ProjectCraftsCaptureComponent} from './presentationals/crafts-capture/project-crafts-capture.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
    ],
    declarations: [
        ProjectCraftsCaptureComponent,
        ProjectCraftsComponent,
        ProjectCraftsCreateComponent,
        ProjectCraftsEditComponent,
        ProjectCraftsListComponent,
        ProjectCraftsToolbarComponent,
    ],
    exports: [
        ProjectCraftsComponent,
    ],
})
export class ProjectCraftsModule {
}
