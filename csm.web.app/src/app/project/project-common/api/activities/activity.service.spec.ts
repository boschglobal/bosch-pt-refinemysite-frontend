/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {MOCK_ACTIVITY_LIST} from '../../../../../test/mocks/activities';
import {ActivityService} from './activity.service';
import {ActivityListResource} from './resources/activity-list.resource';

describe('Activity Service', () => {
    let activityService: ActivityService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const taskId = '456';
    const lastActivityId = '789';
    const limit = 20;
    const testDataTask: ActivityListResource = MOCK_ACTIVITY_LIST;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllUrl = `${baseUrl}/projects/tasks/${taskId}/activities?limit=10`;
    const findAllUrlWithBefore = `${baseUrl}/projects/tasks/${taskId}/activities?limit=${limit}&before=${lastActivityId}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        activityService = TestBed.inject(ActivityService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a activity list', () => {
        activityService.findAll(taskId)
            .subscribe((response: ActivityListResource) => {
                expect(response).toEqual(testDataTask);
            });

        request = httpMock.expectOne(findAllUrl);
        request.flush(testDataTask);
    });

    it('should call findAll with lastActivityId and return a activity list', () => {
        activityService.findAll(taskId, lastActivityId, limit)
            .subscribe((response: ActivityListResource) => {
                expect(response).toEqual(testDataTask);
            });

        request = httpMock.expectOne(findAllUrlWithBefore);
        request.flush(testDataTask);
    });
});
