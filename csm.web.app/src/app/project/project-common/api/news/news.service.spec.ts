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
import {
    MOCK_NEW_A,
    MOCK_NEW_B,
    MOCK_NEWS_LIST
} from '../../../../../test/mocks/news';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {NewsService} from './news.service';
import {NewsListResource} from './resources/news-list.resource';

describe('News Service', () => {
    let newService: NewsService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const identifier = MOCK_NEW_A.context.id;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllUrl = `${baseUrl}/projects/tasks/news/search`;
    const findAllIncludeNestedUrl = `${baseUrl}/projects/tasks/${identifier}/news`;
    const deleteAllUrl = `${baseUrl}/projects/${MOCK_PROJECT_1.id}/news`;
    const deleteByIdUrl = `${baseUrl}/projects/tasks/${identifier}/news`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        newService = TestBed.inject(NewsService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a news list', waitForAsync(() => {
        newService
            .findAll([MOCK_NEW_A.context.id, MOCK_NEW_B.context.id])
            .subscribe((response: NewsListResource) =>
                expect(response).toEqual(MOCK_NEWS_LIST));

        request = httpMock.expectOne(findAllUrl);
        request.flush(MOCK_NEWS_LIST);
    }));

    it('should call findAllIncludeNested and return a news list', waitForAsync(() => {
        newService
            .findAllIncludeNested([MOCK_NEW_A.context.id])
            .subscribe((response: NewsListResource) =>
                expect(response).toEqual(MOCK_NEWS_LIST));

        request = httpMock.expectOne(findAllIncludeNestedUrl);
        request.flush(MOCK_NEWS_LIST);
    }));

    it('should call deleteAll and return null', waitForAsync(() => {
        newService
            .deleteAll(MOCK_PROJECT_1.id)
            .subscribe((response: void) =>
                expect(response).toBe(null));

        request = httpMock.expectOne(deleteAllUrl);
        request.flush(null);
    }));

    it('should call deleteById and return null', waitForAsync(() => {
        newService
            .deleteById(MOCK_NEW_A.context.id)
            .subscribe((response: void) =>
                expect(response).toBe(null));

        request = httpMock.expectOne(deleteByIdUrl);
        request.flush(null);
    }));
});
