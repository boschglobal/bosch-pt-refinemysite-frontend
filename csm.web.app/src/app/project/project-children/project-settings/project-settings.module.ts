/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectSettingsComponent} from './presentationals/settings/project-settings.component';
import {ProjectSettingsChildrenModule} from './project-settings-children/project-settings-children.module';

@NgModule({
    declarations: [ProjectSettingsComponent],
    imports: [
        ProjectCommonModule,
        ProjectSettingsChildrenModule,
        RouterModule,
    ],
    exports: [
        ProjectSettingsComponent,
    ],
})
export class ProjectSettingsModule {
}
