/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../project-common/project-common.module';
import {ProjectToolbarComponent} from './presentationals/project-toolbar.component';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
    ],
    declarations: [
        ProjectToolbarComponent,
    ],
    exports: [
        ProjectToolbarComponent,
    ],
})
export class ProjectToolbarModule {
}
