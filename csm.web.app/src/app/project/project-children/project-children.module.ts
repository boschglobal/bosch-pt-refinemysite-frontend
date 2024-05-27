/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {ProjectCommonModule} from '../project-common/project-common.module';
import {ProjectChildrenComponent} from './project-children.component';
import {ProjectCopyModule} from './project-copy/project-copy.module';
import {ProjectCraftsModule} from './project-crafts/project-crafts.module';
import {ProjectDashboardModule} from './project-dashboard/project-dashboard.module';
import {ProjectEditModule} from './project-edit/project-edit.module';
import {ProjectImportModule} from './project-import/project-import.module';
import {ProjectInformationModule} from './project-information/project-information.module';
import {ProjectKpisModule} from './project-kpis/project-kpis.module';
import {ProjectParticipantsModule} from './project-participants/project-participants.module';
import {ProjectSettingsModule} from './project-settings/project-settings.module';
import {ProjectTasksModule} from './project-tasks/project-tasks.module';
import {ProjectWorkareasModule} from './project-workareas/project-workareas.module';

@NgModule({
    imports: [
        ProjectCommonModule,
        ProjectCopyModule,
        ProjectCraftsModule,
        ProjectDashboardModule,
        ProjectEditModule,
        ProjectImportModule,
        ProjectInformationModule,
        ProjectKpisModule,
        ProjectParticipantsModule,
        ProjectSettingsModule,
        ProjectTasksModule,
        ProjectWorkareasModule,
    ],
    declarations: [ProjectChildrenComponent],
})
export class ProjectChildrenModule {
}
