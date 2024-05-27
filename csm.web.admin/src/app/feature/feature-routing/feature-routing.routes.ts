/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Routes} from '@angular/router';

import {FeatureListComponent} from '../feature-children/feature-list/feature-list.component';
import {FeatureComponent} from '../feature.component';

export const FEATURE_ROUTE_PATHS: any = {
    features: 'features',
};

export const FEATURE_ROUTES: Routes = [
    {
        path: `${FEATURE_ROUTE_PATHS.features}`,
        component: FeatureComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                component: FeatureListComponent,
            },
        ],
    },
];

