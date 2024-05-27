/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JOB_MOCK_6} from '../../../../../test/mocks/jobs';
import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardProjectImportData} from './job-card-project-import-data';

describe('Job Card Project Import Data', () => {

    it('should set the correct title based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_6, status: JobStatusEnum.Running};
        expect(JobCardProjectImportData.fromJobResource(job).title).toBe('Job_ProjectImportCard_RunningStatusTitle');

        job = {...JOB_MOCK_6, status: JobStatusEnum.Queued};
        expect(JobCardProjectImportData.fromJobResource(job).title).toBe('Job_ProjectImportCard_RunningStatusTitle');

        job = {...JOB_MOCK_6, status: JobStatusEnum.Completed};
        expect(JobCardProjectImportData.fromJobResource(job).title).toBe('Job_ProjectImportCard_CompletedStatusTitle');

        job = {...JOB_MOCK_6, status: JobStatusEnum.Failed};
        expect(JobCardProjectImportData.fromJobResource(job).title).toBe('Job_ProjectImportCard_FailedStatusTitle');

        job = {...JOB_MOCK_6, status: JobStatusEnum.Rejected};
        expect(JobCardProjectImportData.fromJobResource(job).title).toBe('Job_ProjectImportCard_FailedStatusTitle');
    });

    it('should set the correct status based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_6, status: JobStatusEnum.Running};
        expect(JobCardProjectImportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_6, status: JobStatusEnum.Queued};
        expect(JobCardProjectImportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_6, status: JobStatusEnum.Completed};
        expect(JobCardProjectImportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_6, status: JobStatusEnum.Failed};
        expect(JobCardProjectImportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_6, status: JobStatusEnum.Rejected};
        expect(JobCardProjectImportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);
    });
});
