/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectParticipantListLinks} from '../../api/participants/resources/project-participant-list.resource';
import {ProjectParticipantList} from './slice/project-participant-list';

export interface ProjectParticipantSlice {
    items: ProjectParticipantResource[];
    currentItem: AbstractItem;
    list: ProjectParticipantList;
    fullList: AbstractList<ProjectParticipantListLinks>;
}

export class ProjectParticipantSlicePermissions {
    canInviteProjectParticipant = false;
}

export class CurrentProjectParticipantPermissions {
}
