/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../../shared/shared.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectEditComponent} from './containers/edit-component/project-edit.component';

@NgModule({
    imports: [
        ProjectCommonModule,
        SharedModule
    ],
    declarations: [
        ProjectEditComponent
    ],
    exports: [
        ProjectEditComponent
    ]
})
export class ProjectEditModule {
}
