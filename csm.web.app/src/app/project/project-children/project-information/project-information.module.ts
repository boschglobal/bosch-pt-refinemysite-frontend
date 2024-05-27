/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectInformationComponent} from './containers/information-component/project-information.component';
import {ProjectInformationContentComponent} from './presentationals/information-content/project-information-content.component';

@NgModule({
    imports: [
        ProjectCommonModule,
        IconModule
    ],
    declarations: [
        ProjectInformationComponent,
        ProjectInformationContentComponent
    ],
    exports: [
        ProjectInformationComponent
    ]
})
export class ProjectInformationModule {
}
