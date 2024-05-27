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

import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {TaskStatistics} from '../../../../project-common/api/tasks/resources/task.resource';

@Component({
    selector: 'ss-project-tasks-news-label',
    templateUrl: './project-tasks-news-label.component.html',
    styleUrls: ['./project-tasks-news-label.component.scss']
})
export class ProjectTasksNewsLabelComponent {
    /**
     * @description Property with task statistics
     */
    @Input()
    public news: TaskStatistics;

    /**
     * @description Define the news icon color
     * @type {string}
     */
    public iconColorNews: string = COLORS.dark_grey;

    /**
     * @description Get the number of critical topics
     * @returns {number}
     */
    public get getCriticalTopics(): number {
        return this.news.criticalTopics;
    }

    /**
     * @description Get the number of uncritical topics
     * @returns {number}
     */
    public get getUncriticalTopics(): number {
        return this.news.uncriticalTopics;
    }
}
