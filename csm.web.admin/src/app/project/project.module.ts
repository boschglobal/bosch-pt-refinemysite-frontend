/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatTabsModule} from '@angular/material/tabs';
import {RouterModule} from '@angular/router';

import {ProjectChildrenModule} from './project-children/project-children.module';
import {ProjectCommonModule} from './project-common/project-common.module';
import {ProjectComponent} from './project.component';
import {ProjectDetailsComponent} from './project-children/project-details/project-details.component';
import {SharedModule} from '../shared/shared.module';

@NgModule({
    declarations: [
        ProjectComponent,
        ProjectDetailsComponent,
    ],
    imports: [
        CommonModule,
        MatTabsModule,
        ProjectChildrenModule,
        ProjectCommonModule,
        RouterModule,
        SharedModule,
    ]
})
export class ProjectModule {
}
