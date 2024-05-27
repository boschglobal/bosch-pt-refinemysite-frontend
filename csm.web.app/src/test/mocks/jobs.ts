/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {RescheduleResource} from '../../app/project/project-common/api/reschedule/resources/reschedule.resource';
import {JobStatusEnum} from '../../app/shared/jobs/api/enums/job-status.enum';
import {JobTypeEnum} from '../../app/shared/jobs/api/enums/job-type.enum';
import {JobContextCalendarExport} from '../../app/shared/jobs/api/resources/job-context-calendar-export.resource';
import {JobContextProjectExport} from '../../app/shared/jobs/api/resources/job-context-project-export.resource';
import {JobContextProjectImport} from '../../app/shared/jobs/api/resources/job-context-project-import.resource';
import {JobContextProjectRescheduleResource} from '../../app/shared/jobs/api/resources/job-context-project-reschedule.resource';
import {JobListResource} from '../../app/shared/jobs/api/resources/job-list.resource';
import {
    JobResource,
    JobResult,
} from '../../app/shared/jobs/api/resources/job.resource';
import {MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE} from './project-reschedule';

export const JOB_MOCK_1: JobResource<JobContextCalendarExport> = {
    id: 'foo',
    type: JobTypeEnum.CalendarExportPdf,
    status: JobStatusEnum.Running,
    createdDate: new Date('01/20/1989').toISOString(),
    lastModifiedDate: new Date('01/20/1989').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    read: false,
};

export const JOB_MOCK_2: JobResource<JobContextCalendarExport> = {
    id: 'bar',
    type: JobTypeEnum.CalendarExportCsv,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/1989').toISOString(),
    lastModifiedDate: new Date('01/20/1989').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    read: false,
    result: new JobResult('bosch-refinemysite.com/artifact.pdf', 'exported.pdf'),
};

export const JOB_MOCK_3: JobResource<JobContextCalendarExport> = {
    id: 'foo2',
    type: JobTypeEnum.CalendarExportJson,
    status: JobStatusEnum.Failed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    read: false,
};

export const JOB_MOCK_4: JobResource<JobContextCalendarExport> = {
    id: 'bar2',
    type: JobTypeEnum.CalendarExportPdf,
    status: JobStatusEnum.Queued,
    createdDate: new Date('01/20/1989').toISOString(),
    lastModifiedDate: new Date('01/20/1989').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    read: false,
};

export const JOB_MOCK_5: JobResource<JobContextCalendarExport> = {
    id: 'foo3',
    type: JobTypeEnum.CalendarExportJson,
    status: JobStatusEnum.Rejected,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    read: false,
};

export const JOB_MOCK_6: JobResource<JobContextProjectImport> = {
    id: 'foo6',
    type: JobTypeEnum.ProjectImport,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4644-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
        fileName: 'foo.xml',
    },
    read: true,
};

export const JOB_MOCK_7: JobResource<JobContextProjectExport> = {
    id: 'foo6',
    type: JobTypeEnum.ProjectExport,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4654-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
        fileName: 'foo.xer',
    },
    read: true,
};

export const JOB_MOCK_8: JobResource<JobContextProjectExport> = {
    id: 'foo8',
    type: JobTypeEnum.ProjectCopy,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4654-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
        fileName: 'foo.xer',
    },
    result: new JobResult(null, null, 'foobarId', 'foobar name'),
    read: true,
};

export const JOB_MOCK_9: JobResource<JobContextProjectRescheduleResource, RescheduleResource> = {
    id: 'foo9',
    type: JobTypeEnum.ProjectReschedule,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4654-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
    },
    result: MOCK_RESCHEDULE_RESOURCE_WITH_FAILED_MILESTONE,
    read: true,
};

export const JOB_MOCK_10: JobResource<JobContextProjectExport> = {
    id: 'foo10',
    type: JobTypeEnum.ProjectExportZip,
    status: JobStatusEnum.Completed,
    createdDate: new Date('01/20/2022').toISOString(),
    lastModifiedDate: new Date('01/20/2022').toISOString(),
    context: {
        project: {
            id: '017da74c-42f0-4654-b5bc-a3fc5fcfc864',
            displayName: 'AvP 203',
        },
        fileName: 'foo.zip',
    },
    read: true,
};

export const JOB_LIST_MOCK_ONE_OF_ONE_PAGE: JobListResource = {
    items: [
        JOB_MOCK_1,
        JOB_MOCK_2,
    ],
    lastSeen: new Date('01/20/1989').toISOString(),
    pageNumber: 1,
    pageSize: 100,
    totalElements: 2,
    totalPages: 1,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/jobs',
        },
    },
};

export const JOB_LIST_MOCK_ONE_OF_TWO_PAGE: JobListResource = {
    items: [
        JOB_MOCK_1,
        JOB_MOCK_2,
    ],
    lastSeen: new Date('01/20/1989').toISOString(),
    pageNumber: 1,
    pageSize: 2,
    totalElements: 2,
    totalPages: 2,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/jobs',
        },
    },
};

export const JOB_LIST_MOCK_TWO_OF_TWO_PAGE: JobListResource = {
    items: [
        JOB_MOCK_1,
        JOB_MOCK_2,
    ],
    lastSeen: new Date('01/20/1989').toISOString(),
    pageNumber: 2,
    pageSize: 2,
    totalElements: 2,
    totalPages: 2,
    _links: {
        self: {
            href: 'http://localhost:8080/v1/jobs',
        },
    },
};
