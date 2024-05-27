/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {ProjectCommonModule} from '../../../project-common/project-common.module';
import {ProjectParticipantComponent} from './containers/participant-component/project-participant.component';
import {ProjectParticipantsChildrenComponent} from './containers/participants-children/project-participants-children.component';

@NgModule({
    imports: [
        ProjectCommonModule
    ],
    declarations: [
        ProjectParticipantComponent,
        ProjectParticipantsChildrenComponent
    ],
    exports: [
        ProjectParticipantsChildrenComponent
    ]
})
export class ProjectParticipantsChildrenModule {
}
