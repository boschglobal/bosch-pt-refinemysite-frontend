/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../../app.reducers';
import {DonutChartSliceInterface} from '../../../../shared/ui/charts/donut-chart-component/donut-chart.component';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {TaskDonutChartModel} from './task-donut-chart.model';

@Component({
    selector: 'ss-task-donut-chart',
    templateUrl: './task-donut-chart.component.html',
})
export class TaskDonutChartComponent {

    /**
     * @description Input with donut chart slice
     */
    @Input()
    public taskChart: TaskDonutChartModel;

    constructor(private _store: Store<State>,
                private _router: Router) {
    }

    /**
     * @description Handle the correct message for task label
     * @returns {string}
     */
    public getTaskLabelKey(): string {
        const totalTasks = this.taskChart.donutChartSlices.reduce((a: number, b: DonutChartSliceInterface) => a + b.value, 0);
        return totalTasks === 1 ? 'Generic_Task' : 'Generic_Tasks';
    }

    /**
     * @description Set status filter and navigates to task list
     * @param {DonutChartSliceInterface} slice
     */
    public handleSetStatusFilter(slice: DonutChartSliceInterface): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        filters.criteria.status = [slice.id];
        this._store.dispatch(new ProjectTaskActions.Set.Filters(filters));
        this._navigateToTaskList();
    }

    public handleClickCenter(): void {
        const filters: ProjectTaskFilters = new ProjectTaskFilters();
        this._store.dispatch(new ProjectTaskActions.Set.Filters(filters));
        this._navigateToTaskList();
    }

    private _navigateToTaskList(): void {
        this._router.navigateByUrl(ProjectUrlRetriever.getProjectTasksUrl(this.taskChart.projectId));
    }
}
