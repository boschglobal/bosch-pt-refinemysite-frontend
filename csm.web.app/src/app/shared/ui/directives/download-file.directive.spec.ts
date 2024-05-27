/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    Renderer2,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    By,
    DomSanitizer
} from '@angular/platform-browser';
import {Subject} from 'rxjs';

import {BlobExport} from '../../misc/api/datatypes/blob-export.datatype';
import {DownloadFileHelper} from '../../misc/helpers/download-file.helper';
import {DownloadFileDirective} from './download-file.directive';
import {DownloadFileTestComponent} from './download-file.test.component';

describe('Download File Directive', () => {
    let component: DownloadFileTestComponent;
    let de: DebugElement;
    let downloadFileHelper: DownloadFileHelper;
    let fixture: ComponentFixture<DownloadFileTestComponent>;
    let mockDownloadObservable: any;

    const clickEvent: Event = new Event('click');
    const mockBlobExport = {name: 'foo', blob: new Blob()};
    const mockSanitizedUrl = 'foo';

    const getElement = () => de.query(By.css('[data-automation="download-file-test"]')).nativeElement;

    const moduleDef: TestModuleMetadata = {
        declarations: [
            DownloadFileDirective,
            DownloadFileTestComponent,
        ],
        providers: [
            {
                provide: DownloadFileHelper,
                useValue: jasmine.createSpyObj('DownloadFileHelper', ['downloadBlob']),
            },
            {
                provide: DomSanitizer,
                useValue: {
                    sanitize: () => mockSanitizedUrl,
                    bypassSecurityTrustUrl: () => mockSanitizedUrl,
                },
            },
            {
                provide: Renderer2,
                useValue: jasmine.createSpyObj('Renderer2', ['createElement', 'setAttribute']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DownloadFileTestComponent);
        downloadFileHelper = TestBed.inject(DownloadFileHelper);
        fixture.detectChanges();
        component = fixture.componentInstance;
        de = fixture.debugElement;

        mockDownloadObservable = new Subject<BlobExport>();
        component.downloadSubscription = () => mockDownloadObservable;
        fixture.detectChanges();
    });

    it('should create the test component', () => {
        expect(component).toBeDefined();
    });

    it('should call downloadBlob when the element is clicked', () => {
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);

        expect(downloadFileHelper.downloadBlob).toHaveBeenCalledWith(mockBlobExport.name, mockBlobExport.blob);
    });

    it('should call downloadFinish when the download is finished', () => {
        spyOn(component, 'downloadFinish');
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);

        expect(component.downloadFinish).toHaveBeenCalled();
    });

    it('should call downloadStart when download starts', () => {
        spyOn(component, 'downloadStart');
        getElement().dispatchEvent(clickEvent);

        expect(component.downloadStart).toHaveBeenCalled();
    });

    it('should not call downloadStart if the download is disabled', () => {
        spyOn(component, 'downloadStart');
        component.downloadDisabled = true;
        fixture.detectChanges();
        getElement().dispatchEvent(clickEvent);

        expect(component.downloadStart).not.toHaveBeenCalled();
    });

    it('should call downloadError when an error occurs', () => {
        spyOn(component, 'downloadError');
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.error(false);

        expect(component.downloadError).toHaveBeenCalled();
    });

    it('should not allow multiple downloads at a time', () => {
        spyOn(component, 'downloadFinish');

        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);
        expect(component.downloadFinish).toHaveBeenCalledTimes(1);

        getElement().dispatchEvent(clickEvent);
        expect(component.downloadFinish).toHaveBeenCalledTimes(1);

        mockDownloadObservable.next(mockBlobExport);
        expect(component.downloadFinish).toHaveBeenCalledTimes(2);
    });

    it('should disable the element when download starts', () => {
        getElement().dispatchEvent(clickEvent);

        expect(getElement().attributes['disabled']).toBeTruthy();
    });

    it('should enable the element when download is finished', () => {
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);

        expect(getElement().attributes['disabled']).toBeFalsy();
    });

    it('should handle an Observable as input for downloadSubscriptionFn', () => {
        spyOn(component, 'downloadFinish');
        component.downloadSubscription = mockDownloadObservable;
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);

        expect(component.downloadFinish).toHaveBeenCalled();
    });

    it('should handle an factory function as input for downloadSubscriptionFn', () => {
        spyOn(component, 'downloadFinish');
        component.downloadSubscription = () => mockDownloadObservable;
        getElement().dispatchEvent(clickEvent);
        mockDownloadObservable.next(mockBlobExport);

        expect(component.downloadFinish).toHaveBeenCalled();
    });
});
