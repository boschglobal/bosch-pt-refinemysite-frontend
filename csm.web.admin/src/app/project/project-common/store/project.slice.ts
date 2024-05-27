/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {BaseSlice} from '../../../shared/misc/store/base.slice';
import {AbstractItem} from '../../../shared/misc/store/datatypes/abstract-item.datatype';
import {AbstractPageableList} from '../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';

import {ProjectFiltersResource} from '../api/resources/project-filters.resource';
import {ProjectListLinks} from '../api/resources/project-list.resource';
import {ProjectResource} from '../api/resources/project.resource';

export interface ProjectSlice extends BaseSlice<AbstractItem, ProjectList, ProjectResource> {
    userActivated: boolean;
}

export class ProjectList extends AbstractPageableList<ProjectListLinks> {
    filters: ProjectFiltersResource;
}
