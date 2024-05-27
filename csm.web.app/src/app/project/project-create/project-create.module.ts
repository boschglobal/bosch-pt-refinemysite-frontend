/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {ProjectCommonModule} from '../project-common/project-common.module';
import {ProjectCreateComponent} from './containers/project-create/project-create.component';

@NgModule({
    imports: [
        ProjectCommonModule
    ],
    declarations: [
        ProjectCreateComponent,
    ]
})
export class ProjectCreateModule {
}
