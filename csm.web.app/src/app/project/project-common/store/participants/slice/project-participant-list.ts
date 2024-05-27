/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {AbstractPageableList} from '../../../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {ProjectParticipantListLinks} from '../../../api/participants/resources/project-participant-list.resource';
import {ProjectParticipantFilters} from './project-participant-filters';

export class ProjectParticipantList extends AbstractPageableList<ProjectParticipantListLinks> {
    filters: ProjectParticipantFilters = new ProjectParticipantFilters();
}
