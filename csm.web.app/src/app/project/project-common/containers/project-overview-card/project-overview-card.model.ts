/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {TaskDonutChartModel} from '../task-donut-chart/task-donut-chart.model';

export class ProjectOverviewCardModel {
    id: string;
    criticalTopics: number;
    donutSlice: TaskDonutChartModel;
    image: string;
    title: string;

    constructor(id: string,
                criticalTopics: number,
                donutSlice: TaskDonutChartModel,
                image: string,
                title: string) {
        this.id = id;
        this.criticalTopics = criticalTopics;
        this.donutSlice = donutSlice;
        this.image = image;
        this.title = title;
    }
}
