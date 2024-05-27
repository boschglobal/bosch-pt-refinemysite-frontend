/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../../app.reducers';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ProjectResource} from '../../api/projects/resources/project.resource';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {TaskDonutChartModel} from '../task-donut-chart/task-donut-chart.model';
import {ProjectOverviewCardModel} from './project-overview-card.model';

@Component({
    selector: 'ss-project-overview-card',
    templateUrl: './project-overview-card.component.html',
    styleUrls: ['./project-overview-card.component.scss'],
})
export class ProjectOverviewCardComponent {
    /**
     * @description Input for information about project
     * @param {ProjectResource} project
     */
    @Input()
    set project(project: ProjectResource) {
        this.projectOverviewModel = new ProjectOverviewCardModel(
            project.id,
            project._embedded.statistics.criticalTopics,
            new TaskDonutChartModel(project.id, project._embedded.statistics),
            project._embedded.projectPicture._links.full.href,
            project.title
        );
    }

    constructor(private _router: Router,
                private _store: Store<State>) {
    }

    /**
     * @description Model of project overview card
     */
    public projectOverviewModel: ProjectOverviewCardModel;

    /**
     * @description Handle the correct message for topic label
     * @returns {string}
     */
    public getTopicLabelKey(): string {
        return this.projectOverviewModel.criticalTopics === 1 ? 'Generic_CriticalTopic' : 'Generic_CriticalTopics';
    }

    /**
     * @description Set status filter and navigates to task list
     */
    public handleSetCriticalTopicFilter(): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.topicCriticality = ['CRITICAL'];
        this._setFiltersAndNavigateToTaskList(filters);
    }

    /**
     * @description Navigates to the project dashboard page
     */
    public handleNavigateProjectDashboard(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectUrl(this.projectOverviewModel.id));
    }

    private _setFiltersAndNavigateToTaskList(filters: ProjectTaskFilters): void {
        this._store.dispatch(new ProjectTaskActions.Set.Filters(filters));
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectTasksUrl(this.projectOverviewModel.id));
    }
}
