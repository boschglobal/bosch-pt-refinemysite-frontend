/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {JobStatusEnum} from '../enums/job-status.enum';
import {JobTypeEnum} from '../enums/job-type.enum';

export class JobResource<C = any, R = any> {
    public id: string;
    public type: JobTypeEnum;
    public status: JobStatusEnum;
    public createdDate: string;
    public lastModifiedDate: string;
    public context: C;
    public read: boolean;
    public result?: R;
}

export class JobResult {
    public url?: string;
    public fileName?: string;
    public projectId?: string;
    public projectName?: string;

    constructor(url?: string, fileName?: string, projectId?: string, projectName?: string) {
        this.url = url;
        this.fileName = fileName;
        this.projectId = projectId;
        this.projectName = projectName;
    }
}
