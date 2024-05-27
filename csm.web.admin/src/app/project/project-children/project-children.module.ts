/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {ProjectCommonModule} from '../project-common/project-common.module';
import {ProjectDetailFeaturesComponent} from './project-details/project-detail-features/project-detail-features.component';
import {ProjectDetailGeneralComponent} from './project-details/project-detail-general/project-detail-general.component';
import {ProjectListComponent} from './project-list/project-list.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        CommonModule,
        ProjectCommonModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        ProjectListComponent,
        ProjectDetailGeneralComponent,
        ProjectDetailFeaturesComponent,
    ],
})
export class ProjectChildrenModule {
}
