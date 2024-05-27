/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {FeatureChildrenComponent} from './feature-children.component';
import {FeatureCommonModule} from '../feature-common/feature-common.module';
import {FeatureCreateComponent} from './feature-create/feature-create.component';
import {FeatureEditComponent} from './feature-edit/feature-edit.component';
import {FeatureListComponent} from './feature-list/feature-list.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        FeatureCommonModule,
        RouterModule,
        SharedModule,
    ],
    declarations: [
        FeatureChildrenComponent,
        FeatureCreateComponent,
        FeatureEditComponent,
        FeatureListComponent,
    ]
})
export class FeatureChildrenModule {
}
