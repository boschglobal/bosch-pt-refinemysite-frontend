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
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION,
    MOCK_RFV_WITH_UPDATE_PERMISSION,
    MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY,
    MOCK_SAVE_RFV_ACTIVE,
} from '../../../../../test/mocks/rfvs';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {RfvResource} from './resources/rfv.resource';
import {RfvService} from './rfv.service';

describe('Rfv Service', () => {
    let rfvService: RfvService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const projectId = 'project-id';
    const mockRfvList: RfvResource[] = [
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION,
        MOCK_RFV_WITH_UPDATE_PERMISSION,
    ];
    const mockRfvEntityList: RfvEntity[] = mockRfvList.map(rfv => RfvEntity.fromRfvResource(rfv));
    const mockRfvListResource = {
        items: mockRfvList,
    };

    const baseUrl = `${configuration.api}/${ApiVersionsEnum.Project}`;
    const updateUrl = `${baseUrl}/projects/${projectId}/rfvs`;
    const findAllUrl = `${baseUrl}/projects/${projectId}/rfvs`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        rfvService = TestBed.inject(RfvService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a rfv list', waitForAsync(() => {
        rfvService.findAll(projectId)
            .subscribe((response: RfvEntity[]) =>
                expect(response).toEqual(mockRfvEntityList));

        req = httpMock.expectOne(findAllUrl);
        expect(req.request.method).toBe('GET');
        req.flush(mockRfvListResource);
    }));

    it('should call update and return updated rfv', waitForAsync(() => {
        rfvService.update(projectId, MOCK_SAVE_RFV_ACTIVE)
            .subscribe((response: RfvEntity) =>
                expect(response).toEqual(MOCK_RFV_WITH_UPDATE_PERMISSION_ENTITY));

        req = httpMock.expectOne(updateUrl);
        expect(req.request.method).toBe('PUT');
        req.flush(MOCK_RFV_WITH_UPDATE_PERMISSION);
    }));
});
