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
    TestRequest,
} from '@angular/common/http/testing';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_MILESTONE_LIST,
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_SAVE_MILESTONE,
} from '../../../../../test/mocks/milestones';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {MilestoneService} from './milestone.service';
import {MilestoneResource} from './resources/milestone.resource';
import {MilestoneListResource} from './resources/milestone-list.resource';
import {SaveMilestoneFilters} from './resources/save-milestone-filters';

describe('Milestone Service', () => {
    let milestoneService: MilestoneService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const abstractMilestoneList: AbstractItemsResource<MilestoneResource> = {
        items: MOCK_MILESTONE_LIST.items,
        _links: MOCK_MILESTONE_LIST._links,
    };
    const projectId = '1234';
    const {id, version} = MOCK_MILESTONE_RESOURCE_HEADER;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findOneUrl = `${baseUrl}/projects/milestones/${id}`;
    const updateUrl = `${baseUrl}/projects/milestones/${id}`;
    const deleteUrl = `${baseUrl}/projects/milestones/${id}`;
    const createUrl = `${baseUrl}/projects/milestones`;
    const findAllUrl = `${baseUrl}/projects/${projectId}/milestones/search`;
    const batchFindUrl = `${baseUrl}/projects/${projectId}/milestones/batch/find`;

    const findAllParamUrl = (pageNumber: number, size: number) => `${findAllUrl}?page=${pageNumber}&size=${size}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        milestoneService = TestBed.inject(MilestoneService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return milestone', waitForAsync(() => {
        milestoneService.findOne(id)
            .subscribe((response: MilestoneResource) =>
                expect(response).toEqual(MOCK_MILESTONE_RESOURCE_HEADER));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_MILESTONE_RESOURCE_HEADER);
    }));

    it('should call findAll and return a milestone list', waitForAsync(() => {
        const milestoneFilters = new SaveMilestoneFilters(
            '2019-01-01',
            '2019-02-01',
            {
                workAreaIds: [],
                header: false,
            },
            {
                types: [],
                projectCraftIds: [],
            },
        );
        const pageNumber = 0;
        const pageSize = 20;

        milestoneService.findAll(projectId, pageNumber, pageSize, milestoneFilters)
            .subscribe((response: MilestoneListResource) =>
                expect(response).toEqual(MOCK_MILESTONE_LIST));

        req = httpMock.expectOne(findAllParamUrl(pageNumber, pageSize));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(milestoneFilters);
        req.flush(MOCK_MILESTONE_LIST);
    }));

    it('should call create and return created milestone', waitForAsync(() => {
        milestoneService.create(MOCK_SAVE_MILESTONE)
            .subscribe((response: MilestoneResource) =>
                expect(response).toEqual(MOCK_MILESTONE_RESOURCE_HEADER));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_MILESTONE_RESOURCE_HEADER);
    }));

    it('should call update and return updated milestone', waitForAsync(() => {
        milestoneService.update(id, MOCK_SAVE_MILESTONE, version)
            .subscribe((response: MilestoneResource) =>
                expect(response).toEqual(MOCK_MILESTONE_RESOURCE_HEADER));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_MILESTONE_RESOURCE_HEADER);
    }));

    it('should call delete and return nothing', waitForAsync(() => {
        milestoneService.delete(id, version)
            .subscribe((response: void) =>
                expect(response).toEqual(null));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    }));

    it('should call findAllByIds and return list of milestones', waitForAsync(() => {
        const ids = abstractMilestoneList.items.map(item => item.id);

        milestoneService
            .findAllByIds(projectId, ids)
            .subscribe((response: MilestoneResource[]) =>
                expect(response).toBe(abstractMilestoneList.items));

        req = httpMock.expectOne(batchFindUrl);
        req.flush(abstractMilestoneList);
    }));
});
