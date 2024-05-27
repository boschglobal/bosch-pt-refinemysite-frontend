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

import {ApiVersionsEnum} from '../../../configurations/api/api-versions.enum';
import {configuration} from '../../../configurations/configuration.local-with-dev-backend';
import {CRAFT_LIST_RESOURCE_MOCK} from '../../../test/mocks/crafts';
import {CraftService} from './craft.service';
import {CraftListResource} from './resources/craft-list.resource';

describe('Craft Service', () => {
    let craftService: CraftService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const findAllUrl = `${configuration.api}/${ApiVersionsEnum.Craft}/crafts?size=100`;
    const craftList: CraftListResource = CRAFT_LIST_RESOURCE_MOCK;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        craftService = TestBed.inject(CraftService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call findAll and return a craft list', () => {
        craftService
            .findAll()
            .subscribe((response: CraftListResource) =>
                expect(response).toBe(craftList));

        request = httpMock.expectOne(findAllUrl);
        request.flush(craftList);
    });
});
