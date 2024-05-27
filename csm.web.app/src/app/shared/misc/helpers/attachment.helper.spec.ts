/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';

import {AttachmentHelper} from './attachment.helper';

describe('Attachment Helper', () => {
    let attachmentHelper: AttachmentHelper;

    const fileSizeInBytes = 1544344;
    const fileSizeInMegaBytes = 1.4728012084960938;
    const humanFriendlyFileSize = '1.5 MB';
    const invalidFileName = new File([new ArrayBuffer(999)], 'fil$%#ename-test.jpg', {type: 'image/jpg'});
    const validFileName = new File([new ArrayBuffer(999)], 'filename-test.jpg', {type: 'image/jpg'});

    const moduleDef: TestModuleMetadata = {
        providers: [AttachmentHelper],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => attachmentHelper = TestBed.inject(AttachmentHelper));

    it('should transform size in byte to human readable string', () => {
        const result = attachmentHelper.getHumanFriendlyFileSize(fileSizeInBytes);

        expect(result).toBe(humanFriendlyFileSize);
    });

    it('should convert size in MegaBytes to Bytes', () => {
        const result = attachmentHelper.convertMbToBytes(fileSizeInMegaBytes);

        expect(result).toBe(fileSizeInBytes);
    });

    it('should convert size in Bytes to MegaBytes', () => {
        const result = attachmentHelper.convertBytesToMb(fileSizeInBytes);

        expect(result).toBe(fileSizeInMegaBytes);
    });

    it('should normalize a filename removing any unwanted special characters', () => {
        const result = attachmentHelper.normalizeFilename(invalidFileName);

        expect(result).toEqual(validFileName);
    });
});
