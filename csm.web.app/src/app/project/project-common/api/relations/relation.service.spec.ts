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
    waitForAsync,
} from '@angular/core/testing';

import {ApiVersionsEnum} from '../../../../../configurations/api/api-versions.enum';
import {configuration} from '../../../../../configurations/configuration.local-with-dev-backend';
import {
    MOCK_ABSTRACT_RELATION_LIST,
    MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE,
    MOCK_RELATION_RESOURCE_1,
    MOCK_SAVE_RELATION_RESOURCE_1,
    MOCK_SAVE_RELATION_RESOURCE_2,
} from '../../../../../test/mocks/relations';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RelationTypeEnum} from '../../enums/relation-type.enum';
import {RelationService} from './relation.service';
import {RelationResource} from './resources/relation.resource';
import {RelationListResource} from './resources/relation-list.resource';
import {SaveRelationResource} from './resources/save-relation.resource';
import {SaveRelationFilters} from './resources/save-relation-filters';

describe('Relation Service', () => {
    let relationService: RelationService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = '1234';
    const {id, version} = MOCK_RELATION_RESOURCE_1;

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findOneUrl = `${baseUrl}/projects/${projectId}/relations/${id}`;
    const findAllUrl = `${baseUrl}/projects/${projectId}/relations/search`;
    const createUrl = `${baseUrl}/projects/${projectId}/relations`;
    const createAllUrl = `${baseUrl}/projects/${projectId}/relations/batch/create`;
    const deleteUrl = `${baseUrl}/projects/${projectId}/relations/${id}`;
    const batchFindUrl = `${baseUrl}/projects/${projectId}/relations/batch/find`;

    const findAllParamUrl = (pageNumber: number, size: number) => `${findAllUrl}?page=${pageNumber}&size=${size}`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        relationService = TestBed.inject(RelationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findOne and return relation', waitForAsync(() => {
        relationService.findOne(projectId, id)
            .subscribe((response: RelationResource) =>
                expect(response).toEqual(MOCK_RELATION_RESOURCE_1));

        req = httpMock.expectOne(findOneUrl);
        expect(req.request.method).toBe('GET');
        req.flush(MOCK_RELATION_RESOURCE_1);
    }));

    it('should call findAll and return a relation list', waitForAsync(() => {
        const relationFilters: SaveRelationFilters = {
            types: [RelationTypeEnum.FinishToStart],
            sources: [new ObjectIdentifierPair(ObjectTypeEnum.Milestone, '123')],
        };
        const pageNumber = 0;
        const pageSize = 20;

        relationService.findAll(projectId, pageNumber, pageSize, relationFilters)
            .subscribe((response: RelationListResource) =>
                expect(response).toEqual(MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE));

        req = httpMock.expectOne(findAllParamUrl(pageNumber, pageSize));
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(relationFilters);
        req.flush(MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE);
    }));

    it('should call create and return created relation', waitForAsync(() => {
        relationService.create(projectId, MOCK_SAVE_RELATION_RESOURCE_1)
            .subscribe((response: RelationResource) =>
                expect(response).toEqual(MOCK_RELATION_RESOURCE_1));

        req = httpMock.expectOne(createUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_RELATION_RESOURCE_1);
    }));

    it('should call createAll and return created relations', waitForAsync(() => {
        const saveRelationResources: SaveRelationResource[] = [
            MOCK_SAVE_RELATION_RESOURCE_1,
            MOCK_SAVE_RELATION_RESOURCE_2,
        ];
        const {items} = MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE;

        relationService.createAll(projectId, saveRelationResources)
            .subscribe((response: RelationResource[]) =>
                expect(response).toEqual(items));

        req = httpMock.expectOne(createAllUrl);
        expect(req.request.method).toBe('POST');
        req.flush(MOCK_RELATION_LIST_RESOURCE_PAGE_ONE_OF_ONE);
    }));

    it('should call delete and return nothing', waitForAsync(() => {
        relationService.delete(projectId, id, version)
            .subscribe((response: void) =>
                expect(response).toEqual(null));

        req = httpMock.expectOne(deleteUrl);
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    }));

    it('should call findAllByIds and return list of relations', waitForAsync(() => {
        const ids = MOCK_ABSTRACT_RELATION_LIST.items.map(item => item.id);

        relationService
            .findAllByIds(projectId, ids)
            .subscribe((response: AbstractItemsResource<RelationResource>) =>
                expect(response).toBe(MOCK_ABSTRACT_RELATION_LIST));

        req = httpMock.expectOne(batchFindUrl);
        req.flush(MOCK_ABSTRACT_RELATION_LIST);
    }));
});
