/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    select,
    Store
} from '@ngrx/store';
import {take} from 'rxjs/operators';

import {State} from '../../../app.reducers';
import {ProjectQueries} from '../../project-common/store/projects/project.queries';
import {PROJECT_ROUTE_PATHS as paths} from '../project-route.paths';

const getCurrentProjectUrl = (store: Store<State>) => {
    const _projectQueries: ProjectQueries = new ProjectQueries();
    let projectId: string;
    store
        .pipe(
            select(_projectQueries.getCurrentItemId()),
            take(1))
        .subscribe(id => projectId = id)
        .unsubscribe();
    return `/${paths.projects}/${projectId}`;
};

export class ProjectUrlRetriever {

    /**
     * @description Retrieves the project url
     * @param projectId
     * @returns {string}
     */
    public static getProjectUrl(projectId: string): string {
        return `/${paths.projects}/${projectId}`;
    }

    /**
     * Retrieves the project/list url
     * @param projectId
     * @returns {string}
     */
    public static getProjectDashboardUrl(projectId: string): string {
        return `/${paths.projects}/${projectId}/dashboard`;
    }

    /**
     * @description Retrieves the project dashboard link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectDashboardUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/dashboard`;
    }

    /**
     * @description Retrieves the create project url
     * @returns {string}
     */
    public static getProjectCreateUrl(): string {
        return `/${paths.projects}/${paths.create}`;
    }

    /**
     * @description Retrieves the project information url
     * @param projectId
     * @returns {string}
     */
    public static getProjectInformationUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.information}`;
    }

    /**
     * @description Retrieves the project information link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectInformationUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.information}`;
    }

    /**
     * @description Retrieves the project edit url
     * @param projectId
     * @returns {string}
     */
    public static getProjectEditUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.edit}`;
    }

    /**
     * @description Retrieves the project participants url
     * @param projectId
     * @returns {string}
     */
    public static getProjectParticipantsUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.participants}`;
    }

    /**
     * @description Retrieves the project participants link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectParticipantsUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.participants}`;
    }

    /**
     * @description Retrieves the participants profile url
     * @param {string} projectId
     * @param {string} participantId
     * @returns {string}
     */
    public static getProjectParticipantsProfileUrl(projectId: string, participantId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.participants}/${participantId}`;
    }

    /**
     * @description Retrieves the project tasks url
     * @param projectId
     * @returns {string}
     */
    public static getProjectTasksUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.tasks}`;
    }

    /**
     * @description Retrieves the project tasks link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectTasksUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.tasks}`;
    }

    /**
     * @description Retrieves the project task detail url
     * @param projectId
     * @param taskId
     * @returns {string}
     */
    public static getProjectTaskDetailUrl(projectId: string, taskId: string): string {
        return `${this.getProjectTasksUrl(projectId)}/${taskId}`;
    }

    /**
     * @description Retrieves the project crafts url
     * @param projectId
     * @returns {string}
     */
    public static getProjectCraftsUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.crafts}`;
    }

    /**
     * @description Retrieves the project crafts link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectCraftsUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.crafts}`;
    }

    /**
     * @description Retrieves the project workareas url
     * @param {string} projectId
     * @returns {string}
     */
    public static getProjectWorkareaUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.workareas}`;
    }

    /**
     * @description Retrieves the project workareas link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectWorkareaUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.workareas}`;
    }

    /**
     * @description Retrieves the project calendar link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectCalendarUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.calendar}`;
    }

    /**
     * @description Retrieves the project calendar url
     * @param projectId
     * @returns {string}
     */
    public static getProjectCalendarUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.calendar}`;
    }

    /**
     * @description Retrieves the project KPIs url
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectKpisUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.kpis}`;
    }

    /**
     * @description Retrieves the project KPIs url
     * @param {string} projectId
     * @returns {string}
     */
    public static getProjectKpisUrl(projectId: string): string {
        return `${this.getProjectUrl(projectId)}/${paths.kpis}`;
    }

    /**
     * @description Retrieves the project settings link for current project
     * @param {Store<State>} store
     * @returns {string}
     */
    public static getCurrentProjectSettingsUrl(store: Store<State>): string {
        return `${getCurrentProjectUrl(store)}/${paths.settings}`;
    }
}
