/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SaveTaskResource} from './save-task.resource';

export class CreateTaskListItemResource extends SaveTaskResource {

    public id?: string;

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
                files: File[],
                id?: string) {
        super(projectId, name, description, status, location, projectCraftId, workAreaId, start, end, assigneeId, files);

        this.id = id;
    }

}
