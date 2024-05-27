/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Task} from '../../../models/tasks/task';
import {SaveTaskResource} from './save-task.resource';

export class SaveTaskListItemResource extends SaveTaskResource {

    public id: string;

    public version: number;

    constructor(id: string,
                version: number,
                projectId: string,
                name: string,
                description: string,
                status: string,
                location: string,
                projectCraftId: string,
                workAreaId: string,
                start: string,
                end: string,
                assigneeId: string,
                files: File[]) {

        super(projectId, name, description, status, location, projectCraftId, workAreaId, start, end, assigneeId, files);

        this.id = id;
        this.version = version;
    }

    public static fromTask(task: Task): SaveTaskListItemResource {
        const {
            projectId,
            name,
            description,
            status,
            location,
            projectCraftId,
            workAreaId,
            assigneeId,
            files
        } = SaveTaskResource.fromTask(task);

        return new SaveTaskListItemResource(
            task.id,
            task.version,
            projectId,
            name,
            description,
            status,
            location,
            projectCraftId,
            workAreaId,
            task.schedule.start,
            task.schedule.end,
            assigneeId,
            files
        );
    }

}
