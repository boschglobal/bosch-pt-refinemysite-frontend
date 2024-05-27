/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {JobResource} from '../../../jobs/api/resources/job.resource';

export class RealtimeEventJobDataResource {

    constructor(public job: JobResource) {
    }

    public static fromString(data: string): RealtimeEventJobDataResource {
        const job = JSON.parse(data) as JobResource;
        return new RealtimeEventJobDataResource(job);
    }
}
