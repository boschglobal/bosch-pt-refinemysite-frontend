/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {HeaderModule} from '../shared/header/header.module';
import {MasterDataModule} from '../shared/master-data/master-data.module';
import {DateParserStrategy} from '../shared/ui/dates/date-parser.strategy';
import {ProjectComponent} from './project.component';
import {ProjectChildrenModule} from './project-children/project-children.module';
import {ProjectDateParserStrategy} from './project-common/helpers/project-date-parser.strategy';
import {ProjectCommonModule} from './project-common/project-common.module';
import {ProjectCreateModule} from './project-create/project-create.module';
import {ProjectListModule} from './project-list/project-list.module';
import {PROJECT_ROUTES} from './project-routing/project-routing.routes';
import {ProjectToolbarModule} from './project-toolbar/project-toolbar.module';

@NgModule({
    imports: [
        HeaderModule,
        MasterDataModule,
        ProjectChildrenModule,
        ProjectCommonModule,
        ProjectCreateModule,
        ProjectListModule,
        ProjectToolbarModule,
        RouterModule.forChild(PROJECT_ROUTES),
    ],
    providers: [
        {
            provide: DateParserStrategy,
            useClass: ProjectDateParserStrategy,
        },
    ],
    declarations: [
        ProjectComponent,
    ],
})
export class ProjectModule {
}
