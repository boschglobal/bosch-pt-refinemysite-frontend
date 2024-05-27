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
import {TEST_COMPANY_REFERENCE_LIST} from '../../../../../test/company/api/testdata/company.testdata';
import {ProjectCompanyService} from './project-company.service';
import {CompanyReferenceListResource} from './resources/company-reference-list.resource';

describe('Project Company Service', () => {
    let projectCompanyService: ProjectCompanyService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const projectId = '123';
    const pageNumber = 0;
    const pageSize = 500;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const findAllByProjectUrl = `${baseUrl}/projects/${projectId}/companies?page=${pageNumber}&size=${pageSize}&includeInactive=false`;
    const findAllByProjectUrlNoParam =
        `${baseUrl}/projects/${projectId}/companies?page=${pageNumber}&size=${pageSize}&includeInactive=false`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCompanyService = TestBed.inject(ProjectCompanyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAllByProject and return a companies list', waitForAsync(() => {
        projectCompanyService
            .findAll(projectId, false, pageNumber, pageSize)
            .subscribe((response: CompanyReferenceListResource) =>
                expect(response).toEqual(TEST_COMPANY_REFERENCE_LIST));

        request = httpMock.expectOne(findAllByProjectUrl);
        request.flush(TEST_COMPANY_REFERENCE_LIST);
    }));

    it('should call findAllByProject without parameters and return a companies list', waitForAsync(() => {
        projectCompanyService
            .findAll(projectId)
            .subscribe((response: CompanyReferenceListResource) =>
                expect(response).toEqual(TEST_COMPANY_REFERENCE_LIST));

        request = httpMock.expectOne(findAllByProjectUrlNoParam);
        request.flush(TEST_COMPANY_REFERENCE_LIST);
    }));
});
