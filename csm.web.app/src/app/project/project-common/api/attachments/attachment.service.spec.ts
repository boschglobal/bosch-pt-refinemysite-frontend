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

import {MOCK_TASK_FILE_1} from '../../../../../test/mocks/task-files';
import {AttachmentService} from './attachment.service';
import {AttachmentResource} from './resources/attachment.resource';

describe('Attachment Service', () => {
    let attachmentService: AttachmentService;
    let httpMock: HttpTestingController;
    let req: TestRequest;

    const getTimezoneOffsetFunction = Date.prototype.getTimezoneOffset;
    const testDataTaskFile: AttachmentResource = MOCK_TASK_FILE_1;
    const testDataFile: File = new File([''], 'filename');

    const uploadUrl = 'tasks/456/attachments';

    const setTimezoneOffset = (offset: number) => {
        Date.prototype.getTimezoneOffset = () => {
            return offset;
        };
    };

    const moduleDef: TestModuleMetadata = {
        imports: [HttpClientTestingModule]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        attachmentService = TestBed.inject(AttachmentService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        Date.prototype.getTimezoneOffset = getTimezoneOffsetFunction;
    });

    it('should call upload and return an attachment resource', waitForAsync(() => {
        attachmentService
            .upload(uploadUrl, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toEqual(testDataTaskFile));

        req = httpMock.expectOne(uploadUrl);
        req.flush(testDataTaskFile);

        expect(req.request.method).toBe('POST');
    }));

    it('should prefix zoneOffset with "+" for values equal to 0', waitForAsync(() => {
        const expectedResult = '+0';
        setTimezoneOffset(0);

        attachmentService
            .upload(uploadUrl, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toEqual(testDataTaskFile));

        Date.prototype.getTimezoneOffset = getTimezoneOffsetFunction;

        req = httpMock.expectOne(uploadUrl);
        req.flush(testDataTaskFile);

        expect(req.request.body.get('zoneOffset')).toBe(expectedResult);
    }));

    it('should prefix zoneOffset with "+" for values bigger than 0', waitForAsync(() => {
        const expectedResult = '+2';
        setTimezoneOffset(120);

        attachmentService
            .upload(uploadUrl, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toEqual(testDataTaskFile));

        Date.prototype.getTimezoneOffset = getTimezoneOffsetFunction;

        req = httpMock.expectOne(uploadUrl);
        req.flush(testDataTaskFile);

        expect(req.request.body.get('zoneOffset')).toBe(expectedResult);
    }));

    it('should keep zoneOffset "-" prefix for values less than 0', waitForAsync(() => {
        const expectedResult = '-2';
        setTimezoneOffset(-120);

        attachmentService
            .upload(uploadUrl, testDataFile)
            .subscribe((response: AttachmentResource) =>
                expect(response).toEqual(testDataTaskFile));

        req = httpMock.expectOne(uploadUrl);
        req.flush(testDataTaskFile);

        expect(req.request.body.get('zoneOffset')).toBe(expectedResult);
    }));
});
