/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {JOB_MOCK_1} from '../../../../../test/mocks/jobs';
import {JobStatusEnum} from '../../../../shared/jobs/api/enums/job-status.enum';
import {JobTypeEnum} from '../../../../shared/jobs/api/enums/job-type.enum';
import {JobResource} from '../../../../shared/jobs/api/resources/job.resource';
import {FileTypeEnum} from '../../../../shared/misc/enums/file.type.enum';
import {JobCardStatusEnum} from '../../enums/job-card-status.enum';
import {JobCardCalendarExportData} from './job-card-calendar-export-data';

describe('Job Card Calendar Export Data', () => {

    it('should set the correct fileType based on the Job Resource type', () => {
        let job: JobResource;

        job = {...JOB_MOCK_1, type: 'foo' as JobTypeEnum};
        expect(JobCardCalendarExportData.fromJobResource(job).titleTranslationParams.fileType).toBeNull();

        job = {...JOB_MOCK_1, type: JobTypeEnum.CalendarExportPdf};
        expect(JobCardCalendarExportData.fromJobResource(job).titleTranslationParams.fileType).toEqual(FileTypeEnum.PDF);

        job = {...JOB_MOCK_1, type: JobTypeEnum.CalendarExportCsv};
        expect(JobCardCalendarExportData.fromJobResource(job).titleTranslationParams.fileType).toEqual(FileTypeEnum.CSV);

        job = {...JOB_MOCK_1, type: JobTypeEnum.CalendarExportJson};
        expect(JobCardCalendarExportData.fromJobResource(job).titleTranslationParams.fileType).toEqual(FileTypeEnum.JSON);
    });

    it('should set the correct title based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_1, status: JobStatusEnum.Running};
        expect(JobCardCalendarExportData.fromJobResource(job).title).toBe('Job_CalendarExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_1, status: JobStatusEnum.Queued};
        expect(JobCardCalendarExportData.fromJobResource(job).title).toBe('Job_CalendarExportCard_RunningStatusTitle');

        job = {...JOB_MOCK_1, status: JobStatusEnum.Completed};
        expect(JobCardCalendarExportData.fromJobResource(job).title).toBe('Job_CalendarExportCard_CompletedStatusTitle');

        job = {...JOB_MOCK_1, status: JobStatusEnum.Failed};
        expect(JobCardCalendarExportData.fromJobResource(job).title).toBe('Job_CalendarExportCard_FailedStatusTitle');

        job = {...JOB_MOCK_1, status: JobStatusEnum.Rejected};
        expect(JobCardCalendarExportData.fromJobResource(job).title).toBe('Job_CalendarExportCard_FailedStatusTitle');
    });

    it('should set the correct status based on the Job Resources status', () => {
        let job: JobResource;

        job = {...JOB_MOCK_1, status: JobStatusEnum.Running};
        expect(JobCardCalendarExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_1, status: JobStatusEnum.Queued};
        expect(JobCardCalendarExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Running);

        job = {...JOB_MOCK_1, status: JobStatusEnum.Completed};
        expect(JobCardCalendarExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Completed);

        job = {...JOB_MOCK_1, status: JobStatusEnum.Failed};
        expect(JobCardCalendarExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);

        job = {...JOB_MOCK_1, status: JobStatusEnum.Rejected};
        expect(JobCardCalendarExportData.fromJobResource(job).status).toBe(JobCardStatusEnum.Failed);
    });

    it('should set the correct read value for different Job Resource statuses and Job Resource read values', () => {
        let job: JobResource;

        job = {...JOB_MOCK_1, status: JobStatusEnum.Running, read: false};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Running, read: true};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Queued, read: false};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Queued, read: true};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Failed, read: false};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Failed, read: true};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Completed, read: false};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeFalsy();

        job = {...JOB_MOCK_1, status: JobStatusEnum.Completed, read: true};
        expect(JobCardCalendarExportData.fromJobResource(job).read).toBeTruthy();
    });
});
