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
import {TEST_USER_RESOURCE_REGISTERED} from '../../../test/mocks/user';
import {USER_PICTURE_1} from '../../../test/mocks/user-picture';
import {UserPictureResource} from './resources/user-picture.resource';
import {UserPictureService} from './user-picture.service';

describe('User Picture Service', () => {
    let userPictureService: UserPictureService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const userId: string = TEST_USER_RESOURCE_REGISTERED.id;
    const picture: File = new File([''], '');
    const userPicture: UserPictureResource = USER_PICTURE_1;
    const baseUrl = `${configuration.api}/${ApiVersionsEnum.User}`;
    const userPictureUrl = `${baseUrl}/users/${userId}/picture`;

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        userPictureService = TestBed.inject(UserPictureService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call upload() and return a user picture', waitForAsync(() => {
        userPictureService
            .upload(userId, picture)
            .subscribe((response: UserPictureResource) => {
                expect(response).toEqual(userPicture);
            });

        request = httpMock.expectOne(userPictureUrl);
        request.flush(userPicture);
    }));

    it('should call remove and return a project picture', waitForAsync(() => {
        userPictureService
            .remove(userId)
            .subscribe((response: UserPictureResource) =>
                expect(response).toEqual(userPicture));

        request = httpMock.expectOne(userPictureUrl);
        request.flush(userPicture);
    }));
});
