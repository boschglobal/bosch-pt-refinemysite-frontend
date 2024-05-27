/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Params} from '@angular/router';

import {State} from '../../../../app.reducers';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectListLinks} from '../../api/projects/resources/project-list.resource';
import {ProjectSlice} from './project.slice';

export class ProjectQueries extends BaseQueries<ProjectResource, ProjectSlice, ProjectListLinks> {
    public moduleName = 'projectModule';
    public sliceName = 'projectSlice';

    constructor() {
        super();
    }

    /**
     * @description Retrieves selector function for project name
     * @param params
     * @returns {Function}
     */
    public static getProjectName(params: Params): Function {
        return (state: State) => {
            const projectIndex = state.projectModule.projectSlice.items
                .findIndex((project: ProjectResource) => project.id === params.projectId);
            return projectIndex !== -1 ? state.projectModule.projectSlice.items[projectIndex].title : null;
        };
    }

    /**
     * @description Retrieves permission to access tasks
     * @param {Params} params
     * @returns {Function}
     */
    public static getProjectTasksPermission(params: Params): Function {
        return ProjectQueries.getProjectPermission(params, 'tasks');
    }

    /**
     * @description Retrieves permission to access participants
     * @param {Params} params
     * @returns {Function}
     */
    public static getProjectParticipantsPermission(params: Params): Function {
        return ProjectQueries.getProjectPermission(params, 'participants');
    }

    /**
     * @description Retrieves permission to access crafts
     * @param {Params} params
     * @returns {Function}
     */
    public static getProjectCraftsPermission(params: Params): Function {
        return ProjectQueries.getProjectPermission(params, 'projectCrafts');
    }

    /**
     * @description Retrieves permission to access crafts
     * @param {Params} params
     * @returns {Function}
     */
    public static getProjectWorkareasPermission(params: Params): Function {
        return ProjectQueries.getProjectPermission(params, 'workAreas');
    }

    /**
     * @description Retrieves permission to project edit settings
     * @param {Params} params
     * @returns {Function}
     */
    public static getProjectEditSettingsPermission(params: Params): Function {
        const links = ProjectQueries.getProjectEditSettingsPermissionLinks();

        return (state: State) => links.some(link => ProjectQueries.getProjectPermission(params, link)(state));
    }

    /**
     * @description Retrieves permission links for project edit settings
     * @returns string[]
     */
    public static getProjectEditSettingsPermissionLinks(): string[] {
        return ['updateRfv', 'updateConstraints', 'updateWorkdays'];
    }

    /**
     * @description Retrieves permission to access content specified by permissionKey
     * @param {Params} params
     * @param {string} permissionKey
     * @returns {Function}
     */
    public static getProjectPermission(params: Params, permissionKey: string): Function {
        return (state: State) => {
            const projectIndex = state.projectModule.projectSlice.items
                .findIndex((project: ProjectResource) => project.id === params.projectId);
            return projectIndex !== -1 ? state.projectModule.projectSlice.items[projectIndex]._links.hasOwnProperty(permissionKey) : null;
        };
    }

    /**
     * @description Determines if a project has edit settings permissions
     * @param {ProjectResource} project
     * @returns {boolean}
     */
    public static projectHasEditSettingsPermissions(project: ProjectResource): boolean {
        return ProjectQueries.getProjectEditSettingsPermissionLinks().some(link => project._links.hasOwnProperty(link));
    }
}
