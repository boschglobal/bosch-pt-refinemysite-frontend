/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../configurations/configuration.local-with-dev-backend';
import {JOB_LIST_MOCK_ONE_OF_ONE_PAGE} from '../../../../test/mocks/jobs';
import {JobService} from './job.service';

describe('Job Service', () => {
    let jobService: JobService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const jobId = 'foo';
    const pageSize = 100;
    const pageNumber = 1;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Job}`;
    const findAllUrl = `${baseUrl}/jobs?page=${pageNumber}&size=${pageSize}`;
    const markJobListAsSeenUrl = `${baseUrl}/jobs/seen`;
    const markJobAsReadUrl = `${baseUrl}/jobs/${jobId}/read`;
    const lastSeen = new Date().toISOString();

    const emptyResponseBody = {};
    const jobListResponseBody = JOB_LIST_MOCK_ONE_OF_ONE_PAGE;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        jobService = TestBed.inject(JobService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should call findAll and return list of jobs', waitForAsync(() => {
        jobService
            .findAll(pageNumber, pageSize)
            .subscribe(jobs => expect(jobs).toBe(jobListResponseBody));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(jobListResponseBody);
    }));

    it('should call markJobListAsSeen and return empty object', waitForAsync(() => {
        jobService
            .markJobListAsSeen(lastSeen)
            .subscribe(jobs => expect(jobs).toBe(emptyResponseBody));

        req = httpMock.expectOne(markJobListAsSeenUrl);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({lastSeen});
        req.flush(emptyResponseBody);
    }));

    it('should call markJobAsRead and return empty object', waitForAsync(() => {
        jobService
            .markJobAsRead(jobId)
            .subscribe(jobs => expect(jobs).toBe(emptyResponseBody));

        req = httpMock.expectOne(markJobAsReadUrl);
        expect(req.request.method).toBe('POST');
        req.flush(emptyResponseBody);
    }));
});
