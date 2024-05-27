/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectWorkareasCreateComponent} from './containers/workareas-create/project-workareas-create.component';
import {ProjectWorkareasEditComponent} from './containers/workareas-edit/project-workareas-edit.component';
import {ProjectWorkareasListComponent} from './containers/workareas-list/project-workareas-list.component';
import {ProjectWorkareasToolbarComponent} from './containers/workareas-toolbar/project-workareas-toolbar.component';
import {ProjectWorkareasComponent} from './presentationals/workareas/project-workareas.component';
import {ProjectWorkareasCaptureComponent} from './presentationals/workareas-capture/project-workareas-capture.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
    ],
    declarations: [
        ProjectWorkareasComponent,
        ProjectWorkareasCaptureComponent,
        ProjectWorkareasCreateComponent,
        ProjectWorkareasEditComponent,
        ProjectWorkareasListComponent,
        ProjectWorkareasToolbarComponent,
    ],
    exports: [
        ProjectWorkareasComponent,
    ],
})
export class ProjectWorkareasModule {
}
