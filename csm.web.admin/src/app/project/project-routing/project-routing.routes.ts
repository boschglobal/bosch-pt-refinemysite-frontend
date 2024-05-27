/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {ProjectComponent} from '../project.component';
import {
    ProjectDetailFeaturesComponent
} from '../project-children/project-details/project-detail-features/project-detail-features.component';
import {ProjectDetailGeneralComponent} from '../project-children/project-details/project-detail-general/project-detail-general.component';
import {ProjectDetailsComponent} from '../project-children/project-details/project-details.component';
import {ProjectDetailsGuard} from './guards/project-details.guard';
import {ProjectListComponent} from '../project-children/project-list/project-list.component';

export const PROJECT_ROUTE_PATHS: any = {
    projects: 'projects',
};

export const PROJECT_ROUTES: Routes = [
    {
        path: PROJECT_ROUTE_PATHS.projects,
        component: ProjectComponent,
        children: [
            {
                path: '',
                component: ProjectListComponent,
            },
            {
                path: `:id`,
                canActivate: [ProjectDetailsGuard],
                component: ProjectDetailsComponent,
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'detail'
                    },
                    {
                        path: 'detail',
                        component: ProjectDetailGeneralComponent
                    },
                    {
                        path: 'features',
                        component: ProjectDetailFeaturesComponent
                    },
                ]
            }
        ]
    }
];
