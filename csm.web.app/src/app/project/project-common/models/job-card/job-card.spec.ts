/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    JOB_MOCK_1,
    JOB_MOCK_2,
    JOB_MOCK_3,
    JOB_MOCK_6,
    JOB_MOCK_7,
    JOB_MOCK_8,
    JOB_MOCK_9
} from '../../../../../test/mocks/jobs';
import {JobTypeEnum} from '../../../../shared/jobs/api/enums/job-type.enum';
import {
    JobCard,
    JobCardTypesEnum
} from './job-card';
import {JobCardCalendarExportData} from './job-card-calendar-export-data';
import {JobCardProjectCopyData} from './job-card-project-copy-data';
import {JobCardProjectExportData} from './job-card-project-export-data';
import {JobCardProjectImportData} from './job-card-project-import-data';
import {JobCardProjectRescheduleData} from './job-card-project-reschedule-data';

describe('Job Card', () => {
    it('should return null when calling fromJobResource with a job resource with a not supported job type', () => {
        const notSupportedJobResource = {...JOB_MOCK_1, type: 'foo' as JobTypeEnum};

        expect(JobCard.fromJobResource(notSupportedJobResource)).toBeNull();
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type CALENDAR_EXPORT_PDF', () => {
        const {id, lastModifiedDate} = JOB_MOCK_1;
        const data = JobCardCalendarExportData.fromJobResource(JOB_MOCK_1);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.CalendarExport,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_1)).toEqual(expectedResult);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type CALENDAR_EXPORT_CSV', () => {
        const {id, lastModifiedDate} = JOB_MOCK_2;
        const data = JobCardCalendarExportData.fromJobResource(JOB_MOCK_2);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.CalendarExport,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_2)).toEqual(expectedResult);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type CALENDAR_EXPORT_JSON', () => {
        const {id, lastModifiedDate} = JOB_MOCK_3;
        const data = JobCardCalendarExportData.fromJobResource(JOB_MOCK_3);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.CalendarExport,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_3)).toEqual(expectedResult);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type PROJECT_IMPORT', () => {
        const {id, lastModifiedDate} = JOB_MOCK_6;
        const data = JobCardProjectImportData.fromJobResource(JOB_MOCK_6);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.ProjectImport,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_6)).toEqual(expectedResult);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type PROJECT_EXPORT', () => {
        const {id, lastModifiedDate} = JOB_MOCK_7;
        const data = JobCardProjectExportData.fromJobResource(JOB_MOCK_7);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.ProjectExport,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_7)).toEqual(expectedResult);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type PROJECT_COPY', () => {
        const {id, lastModifiedDate} = JOB_MOCK_8;
        const data = JobCardProjectCopyData.fromJobResource(JOB_MOCK_8);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.ProjectCopy,
        };
        const expectedUrl = `projects/foobarId/dashboard`;

        expect(JobCard.fromJobResource(JOB_MOCK_8)).toEqual(expectedResult);
        expect(JobCard.fromJobResource(JOB_MOCK_8).data.rerouteUrl).toEqual(expectedUrl);
    });

    it('should return a Job Card when calling fromJobResource with a job resource of type PROJECT_RESCHEDULE', () => {
        const {id, lastModifiedDate} = JOB_MOCK_9;
        const data = JobCardProjectRescheduleData.fromJobResource(JOB_MOCK_9);
        const expectedResult: JobCard = {
            id,
            data,
            lastModifiedDate,
            type: JobCardTypesEnum.ProjectReschedule,
        };

        expect(JobCard.fromJobResource(JOB_MOCK_9)).toEqual(expectedResult);
    });
});
