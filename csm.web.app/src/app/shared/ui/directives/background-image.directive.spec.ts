/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    NEVER,
    of
} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {BlobService} from '../../rest/services/blob.service';
import {BackgroundImageDirective} from './background-image.directive';
import {BackgroundImageTestComponent} from './background-image.test.component';

describe('Background Image Directive', () => {
    let fixture: ComponentFixture<BackgroundImageTestComponent>;
    let comp: BackgroundImageTestComponent;
    let de: DebugElement;

    const blobServiceMock: BlobService = mock(BlobService);

    const blobUrl = 'blob-url';
    const imageUrl = 'image-url';

    const getElement = () => {
        return de.query(By.css('[data-automation="background-image-test"]')).nativeElement;
    };

    const moduleDef: TestModuleMetadata = {
        declarations: [
            BackgroundImageDirective,
            BackgroundImageTestComponent,
        ],
        providers: [
            {
                provide: BlobService,
                useFactory: () => instance(blobServiceMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        when(blobServiceMock.getBlobURL('')).thenReturn(NEVER);

        fixture = TestBed.createComponent(BackgroundImageTestComponent);
        fixture.detectChanges();
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should set background image on host component', () => {
        const expectedBackgroundImage = `url("${blobUrl}")`;

        when(blobServiceMock.getBlobURL(imageUrl)).thenReturn(of(blobUrl));
        comp.link = imageUrl;
        fixture.detectChanges();

        expect(getElement().style.backgroundImage).toBe(expectedBackgroundImage);
    });

    it('should set default background color on host component', () => {
        const expectedBackgroundColor = 'rgb(223, 223, 224)';

        when(blobServiceMock.getBlobURL(imageUrl)).thenReturn(of(blobUrl));
        comp.link = imageUrl;
        fixture.detectChanges();

        expect(getElement().style.backgroundColor).toBe(expectedBackgroundColor);
    });

    it('should set loading animation class on host component when image is loading', () => {
        const expectedClass = 'ss-skeleton';

        when(blobServiceMock.getBlobURL(imageUrl)).thenReturn(NEVER);
        comp.link = imageUrl;
        fixture.detectChanges();

        expect(getElement().classList.contains(expectedClass)).toBeTruthy();
    });

    it('should remove loading animation class on host component when image is loaded', () => {
        const expectedClass = 'ss-skeleton';

        when(blobServiceMock.getBlobURL(imageUrl)).thenReturn(of(blobUrl));
        comp.link = imageUrl;
        fixture.detectChanges();

        expect(getElement().classList.contains(expectedClass)).toBeFalsy();
    });
});
