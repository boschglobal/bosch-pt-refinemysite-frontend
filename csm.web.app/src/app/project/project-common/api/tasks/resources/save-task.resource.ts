/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import * as moment from 'moment';

import {Task} from '../../../models/tasks/task';

export class SaveTaskResource {
    public projectId: string;
    public name: string;
    public description: string;
    public status: string;
    public location: string;
    public projectCraftId: string;
    public workAreaId: string;
    public start?: string;
    public end?: string;
    public assigneeId: string;
    public files?: File[];

    constructor(projectId: string,
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
        this.projectId = projectId;
        this.name = name;
        this.description = description;
        this.status = status;
        this.location = location;
        this.projectCraftId = projectCraftId;
        this.workAreaId = workAreaId;
        this.start = start ? moment(start).format('YYYY-MM-DD') : null;
        this.end = end ? moment(end).format('YYYY-MM-DD') : null;
        this.assigneeId = assigneeId;
        this.files = files;
    }

    static fromTask(task: Task): SaveTaskResource {
        const {project, name, description, status, location, projectCraft, schedule: {start, end}, assignee, workArea} = task;
        const assigneeId = assignee ? assignee.id : null;
        const projectCraftId = projectCraft ? projectCraft.id : null;
        const workAreaId = workArea ? workArea.id : null;

        return new SaveTaskResource(project.id, name, description, status, location, projectCraftId, workAreaId, start, end, assigneeId, null);
    }
}

export class SaveTaskResourceWithVersions {
    constructor(public taskData: SaveTaskResource,
                public taskVersion: number,
                public taskScheduleVersion: number) {
    }
}
