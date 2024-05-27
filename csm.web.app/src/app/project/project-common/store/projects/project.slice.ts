/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {BaseSlice} from '../../../../shared/misc/store/base.slice';
import {AbstractItemWithPicture} from '../../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListLinks} from '../../api/projects/resources/project-list.resource';

export interface ProjectSlice extends BaseSlice<AbstractItemWithPicture, AbstractList<ProjectListLinks>, ProjectResource> {
    userActivated: boolean;
}

export class CurrentProjectPermissions {
    public canChangeSortingMode = false;
    public canCopyProject = false;
    public canCreateCraftMilestone = false;
    public canCreateInvestorMilestone = false;
    public canCreateProjectMilestone = false;
    public canEditProject = false;
    public canEditProjectSettings = false;
    public canExportProject = false;
    public canImportProject = false;
    public canRescheduleProject = false;
    public canSeeProjectCrafts = false;
    public canSeeProjectParticipants = false;
    public canSeeProjectTasks = false;
    public canSeeWorkareas = false;
}
