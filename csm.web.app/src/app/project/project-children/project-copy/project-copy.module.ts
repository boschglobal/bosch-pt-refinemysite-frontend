/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';

import {SharedModule} from '../../../shared/shared.module';
import {IconModule} from '../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectCopyComponent} from './containers/project-copy-component/project-copy.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
        ReactiveFormsModule,
        SharedModule,
    ],
    declarations: [
        ProjectCopyComponent,
    ],
    exports: [
        ProjectCopyComponent,
    ],
})
export class ProjectCopyModule {
}
