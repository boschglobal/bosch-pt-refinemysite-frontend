/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../project-common/project-common.module';
import {ProjectToolbarModule} from '../project-toolbar/project-toolbar.module';
import {ProjectListComponent} from './containers/project-list/project-list.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
        ProjectToolbarModule,
    ],
    declarations: [
        ProjectListComponent,
    ],
    exports: [
        ProjectListComponent,
    ],
})
export class ProjectListModule {
}
