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
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../test/mocks/store';
import {RouterStub} from '../../../../test/stubs/router.stub';
import {BlobService} from './blob.service';

describe('Blob Service', () => {
    let blobService: BlobService;
    let httpMock: HttpTestingController;
    let request: TestRequest;

    const testDataUrl = `https://whereismyblob`;
    const testDataBlobResponse = 'blob:http://localhost';
    const testDataBlob: File = new File([''], '');

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule],
        providers: [
            BlobService,
            {
                provide: Store,
                useValue: new MockStore({}),
            },
            {
                provide: Router,
                useClass: RouterStub,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        blobService = TestBed.inject(BlobService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should call getBlob and return a blob', waitForAsync(() => {
        blobService
            .getBlob(testDataUrl)
            .subscribe(response =>
                expect(response).toEqual(testDataBlob));

        request = httpMock.expectOne(testDataUrl);
        request.flush(testDataBlob);
    }));

    it('should call getBlobURL and return a blob url', waitForAsync(() => {
        blobService
            .getBlobURL(testDataUrl)
            .subscribe(response =>
                expect(response).toContain(testDataBlobResponse));

        request = httpMock.expectOne(testDataUrl);
        request.flush(testDataBlob);
    }));

    it('should call getBlob and handle the error', waitForAsync(() => {
        blobService
            .getBlob(null);

        httpMock.expectNone(testDataUrl);
    }));

    it('should call getBlobURL and handle the error', waitForAsync(() => {
        spyOn(blobService, 'deleteCachedBlob');

        blobService
            .getBlobURL(null);

        httpMock.expectNone(testDataUrl);
        expect(blobService.deleteCachedBlob).toHaveBeenCalled();
    }));

    it('should call deleteCachedBlob and delete selected url', waitForAsync(() => {
        blobService
            .deleteCachedBlob(testDataUrl);

        blobService
            .getBlob(testDataUrl)
            .subscribe(response =>
                expect(response).not.toContain(testDataBlobResponse));

        request = httpMock.expectOne(testDataUrl);
        request.flush(testDataBlob);
    }));
});
