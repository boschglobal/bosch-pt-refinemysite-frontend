/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobContextProjectRescheduleResource} from '../../../../shared/jobs/api/resources/job-context-project-reschedule.resource';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardData} from './job-card';

export const JOB_PROJECT_RESCHEDULE_CARD_DATA_TITLE_MAP: { [p in JobCardStatusEnum]?: string } = {
    [JobCardStatusEnum.Running]: 'Job_ProjectRescheduleCard_RunningStatusTitle',
    [JobCardStatusEnum.Completed]: 'Job_ProjectRescheduleCard_CompletedStatusTitle',
    [JobCardStatusEnum.PartlyCompleted]: 'Job_ProjectRescheduleCard_PartlyCompletedStatusTitle',
    [JobCardStatusEnum.Failed]: 'Job_ProjectRescheduleCard_FailedStatusTitle',
};

export class JobCardProjectRescheduleData {
    public static fromJobResource(job: JobResource<JobContextProjectRescheduleResource, RescheduleResource>): JobCardData {
        const {context: {project: {displayName}}} = job;
        const cardStatus = this._getCardStatus(job);
        const title = JOB_PROJECT_RESCHEDULE_CARD_DATA_TITLE_MAP[cardStatus];

        return {
            title,
            read: true,
            status: cardStatus,
            projectName: displayName,
        };
    }

    private static _getCardStatus(job: JobResource<JobContextProjectRescheduleResource, RescheduleResource>): JobCardStatusEnum {
        switch (job.status) {
            case JobStatusEnum.Queued:
            case JobStatusEnum.Running:
                return JobCardStatusEnum.Running;
            case JobStatusEnum.Rejected:
            case JobStatusEnum.Failed:
                return JobCardStatusEnum.Failed;
            case JobStatusEnum.Completed: {
                const withErrors = !!job.result.failed.milestones.length || !!job.result.failed.tasks.length;

                return withErrors ? JobCardStatusEnum.PartlyCompleted : JobCardStatusEnum.Completed;
            }
            default:
                return null;
        }
    }
}
