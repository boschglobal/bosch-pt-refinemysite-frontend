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
import {ProjectCopyModule} from '../project-copy/project-copy.module';
import {ProjectExportComponent} from '../project-export/project-export.component';
import {ProjectImportModule} from '../project-import/project-import.module';
import {ProjectDashboardComponent} from './containers/dashboard-component/project-dashboard.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
        ProjectCopyModule,
        ProjectImportModule,
    ],
    declarations: [
        ProjectDashboardComponent,
        ProjectExportComponent,
    ],
    exports: [ProjectDashboardComponent],
})
export class ProjectDashboardModule {
}
