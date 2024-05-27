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
    waitForAsync,
} from '@angular/core/testing';
import {DomSanitizer} from '@angular/platform-browser';

import {DownloadFileHelper} from './download-file.helper';
import {SystemHelper} from './system.helper';
import SpyObj = jasmine.SpyObj;

describe('Download File Helper', () => {
    let downloadFileHelper: DownloadFileHelper;
    let systemHelper: SpyObj<SystemHelper>;

    const mockSanitizedUrl = 'foo';
    const mockFileName = 'foo.pdf';
    const mockBlob = new Blob([], {type: 'image/jpeg'});

    const moduleDef: TestModuleMetadata = {
        providers: [
            DownloadFileHelper,
            {
                provide: DomSanitizer,
                useValue: {
                    sanitize: () => mockSanitizedUrl,
                    bypassSecurityTrustUrl: () => mockSanitizedUrl,
                },
            },
            {
                provide: SystemHelper,
                useValue: jasmine.createSpyObj('SystemHelper', ['isRecentFirefox']),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        downloadFileHelper = TestBed.inject(DownloadFileHelper);
        systemHelper = TestBed.inject(SystemHelper) as SpyObj<SystemHelper>;

    });

    it('should trigger a file download when downloadBlob is called', () => {
        const anchorSpy = jasmine.createSpyObj<HTMLAnchorElement>('a', ['click']);

        spyOn(document, 'createElement').and.returnValue(anchorSpy);

        downloadFileHelper.downloadBlob(mockFileName, mockBlob);

        expect(document.createElement).toHaveBeenCalledWith('a');
        expect(anchorSpy.href).toBe(mockSanitizedUrl);
        expect(anchorSpy.download).toBe(mockFileName);
        expect(anchorSpy.click).toHaveBeenCalled();
    });

    it('should keep the default blob mimetype when browser is not recent Firefox', () => {
        let usedBlob: Blob;

        spyOn(URL, 'createObjectURL').and.callFake(blob => usedBlob = blob);

        systemHelper.isRecentFirefox.and.returnValue(false);
        downloadFileHelper.downloadBlob(mockFileName, mockBlob);

        expect(usedBlob.type).toBe(mockBlob.type);
    });

    it('should change the blob mimetype to binary when browser is recent Firefox', () => {
        let usedBlob: Blob;

        spyOn(URL, 'createObjectURL').and.callFake(blob => usedBlob = blob);

        systemHelper.isRecentFirefox.and.returnValue(true);
        downloadFileHelper.downloadBlob(mockFileName, mockBlob);

        expect(usedBlob.type).toBe('application/octet-stream');
    });
});
