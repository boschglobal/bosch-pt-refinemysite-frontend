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
import {ProjectParticipantsCaptureComponent} from './containers/participants-capture/project-participants-capture.component';
import {ProjectParticipantsComponent} from './containers/participants-component/project-participants.component';
import {ProjectParticipantsContentComponent} from './containers/participants-content/project-participants-content.component';
import {ProjectParticipantsListComponent} from './presentationals/participants-list/project-participants-list.component';
import {ProjectParticipantsPaginationComponent} from './presentationals/participants-pagination/project-participants-pagination.component';
import {ProjectParticipantsSortingComponent} from './presentationals/participants-sorting/project-participants-sorting.component';
import {ProjectParticipantsTableComponent} from './presentationals/participants-table/project-participants-table.component';
import {ProjectParticipantsChildrenModule} from './project-participants-children/project-participants-children.module';

@NgModule({
    imports: [
        IconModule,
        ProjectCommonModule,
        ProjectParticipantsChildrenModule
    ],
    declarations: [
        ProjectParticipantsComponent,
        ProjectParticipantsCaptureComponent,
        ProjectParticipantsContentComponent,
        ProjectParticipantsListComponent,
        ProjectParticipantsPaginationComponent,
        ProjectParticipantsSortingComponent,
        ProjectParticipantsTableComponent
    ],
    exports: [
        ProjectParticipantsComponent
    ]
})
export class ProjectParticipantsModule {
}
