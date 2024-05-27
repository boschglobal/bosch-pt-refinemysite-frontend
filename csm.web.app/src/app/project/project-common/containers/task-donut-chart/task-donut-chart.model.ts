/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DonutChartSliceInterface} from '../../../../shared/ui/charts/donut-chart-component/donut-chart.component';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {ProjectStatistics} from '../../api/projects/resources/project.resource';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper
} from '../../enums/task-status.enum';

export class TaskDonutChartModel {
    public projectId?: string;
    public donutChartSlices: DonutChartSliceInterface[];

    constructor(id: string, statistics: ProjectStatistics) {
        this.projectId = id;
        this.donutChartSlices = TaskDonutChartModel.createDonutSlices(statistics);
    }

    public static createDonutSlices(statistics: ProjectStatistics): DonutChartSliceInterface[] {
        return [
            {
                id: TaskStatusEnum.CLOSED,
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.CLOSED),
                value: statistics.closedTasks,
                color: COLORS.light_green_80,
            },
            {
                id: TaskStatusEnum.STARTED,
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED),
                value: statistics.startedTasks,
                color: COLORS.dark_blue,
            },
            {
                id: TaskStatusEnum.OPEN,
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN),
                value: statistics.openTasks,
                color: COLORS.dark_grey_50,
            },
            {
                id: TaskStatusEnum.DRAFT,
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.DRAFT),
                value: statistics.draftTasks,
                color: COLORS.light_grey_50,
            },
            {
                id: TaskStatusEnum.ACCEPTED,
                label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.ACCEPTED),
                value: statistics.acceptedTasks,
                color: COLORS.light_green,
            },
        ];
    }
}
