/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION,
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION,
    MOCK_SAVE_CONSTRAINT_RESOURCE,
} from '../../../../../test/mocks/constraints';
import {ResourceLink} from '../../../../shared/misc/api/datatypes/resource-link.datatype';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintService} from './constraint.service';
import {ConstraintResource} from './resources/constraint.resource';

describe('Constraint Service', () => {
    let constraintService: ConstraintService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'project-id';
    const mockConstraintList: ConstraintResource[] = [
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION,
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION,
    ];
    const mockConstraintEntityList: ConstraintEntity[] =
        mockConstraintList.map(constraint => ConstraintEntity.fromConstraintResource(constraint));
    const mockConstraintListResource: AbstractItemsResource<ConstraintResource> = {
        items: mockConstraintList,
        _links: {
            self: new ResourceLink(),
        },
    };

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const updateUrl = `${baseUrl}/projects/${projectId}/constraints`;
    const findAllUrl = `${baseUrl}/projects/${projectId}/constraints`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        constraintService = TestBed.inject(ConstraintService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => httpMock.verify());

    it('should call findAll and return a constraint entity list', waitForAsync(() => {
        constraintService.findAll(projectId)
            .subscribe((response: ConstraintEntity[]) =>
                expect(response).toEqual(mockConstraintEntityList));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockConstraintListResource);
    }));

    it('should call update and return a updated constraint entity', waitForAsync(() => {
        constraintService.update(projectId, MOCK_SAVE_CONSTRAINT_RESOURCE)
            .subscribe((response: ConstraintEntity) =>
                expect(response).toEqual(MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION);
    }));
});
