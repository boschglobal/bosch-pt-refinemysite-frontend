/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ResourceReference} from '../../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {TaskStatistics} from '../../../../project-common/api/tasks/resources/task.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {Task} from '../../../../project-common/models/tasks/task';
import {CraftLabel} from '../../../../project-common/presentationals/craft-label/craft-label.component';
import {ProjectTaskCardAssigneeModel} from '../../../../project-common/presentationals/project-tasks-card-assignee.model';

export class ProjectTaskContentModel {
    public assignPermission: boolean;
    public company: ProjectTaskCardAssigneeModel;
    public craft: CraftLabel;
    public end: string | null;
    public id: string;
    public isNew?: boolean;
    public name: string;
    public news: TaskStatistics;
    public project: ResourceReference;
    public sendPermission: boolean;
    public start: string | null;
    public status: TaskStatusEnum;
    public workArea: WorkareaResource | null;

    constructor(id: string, name: string, status: TaskStatusEnum, project: ResourceReference,
                start: string | null, end: string | null, craft: CraftLabel,
                company: ProjectTaskCardAssigneeModel, news: TaskStatistics, assignPermission: boolean,
                sendPermission: boolean, workArea: WorkareaResource | null) {
        this.id = id;
        this.name = name;
        this.status = status;
        this.project = project;
        this.start = start;
        this.end = end;
        this.craft = craft;
        this.company = company;
        this.news = news;
        this.assignPermission = assignPermission;
        this.sendPermission = sendPermission;
        this.workArea = workArea;
    }

    public static fromTaskAndWorkAreaResource(task: Task, workArea: WorkareaResource = null): ProjectTaskContentModel {
        const start = task.schedule && task.schedule.start ? task.schedule.start : null;
        const end = task.schedule && task.schedule.end ? task.schedule.end : null;
        const {name: craftName, color: craftColor} = task.projectCraft;

        return new ProjectTaskContentModel(
            task.id,
            task.name,
            task.status,
            task.project,
            start,
            end,
            {name: craftName, color: craftColor},
            new ProjectTaskCardAssigneeModel(
                task.id,
                task.project.id,
                task.assigned,
                task.assignee,
                task.company,
                task.status,
                task.permissions.canAssign,
                task.permissions.canSend,
                task.assignee && task.assignee.id ? task.assignee.id : null
            ),
            task.statistics,
            task.permissions.canAssign,
            task.permissions.canSend,
            workArea,
        );
    }
}
