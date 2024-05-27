/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {
    TranslatePipe,
    TranslateService
} from '@ngx-translate/core';

import {BlobServiceMock} from '../../../../test/mocks/blob.service.mock';
import {TranslateServiceStub} from '../../../../test/stubs/translate-service.stub';
import {MiscModule} from '../../misc/misc.module';
import {BlobService} from '../../rest/services/blob.service';
import {ThumbnailGalleryComponent} from './thumbnail-gallery.component';

describe('Thumbnail Gallery Component', () => {
    let fixture: ComponentFixture<ThumbnailGalleryComponent>;
    let comp: ThumbnailGalleryComponent;
    let de: DebugElement;
    let cdr: ChangeDetectorRef;

    const mockEmptyLinks: string[] = [];
    const mockFullLinks: string[] = ['a', 'b', 'c', 'd', 'e'];
    const mockItemsPerRow = 4;
    const mockItemLimit = 4;
    const listSelector = 'li';
    const dataAutomationOverlay = '[data-automation="thumbnail-gallery-plus-n-overlay"]';
    const dataAutomationButton = (index: number) => `[data-automation="thumbnail-gallery-button-${index}"]`;
    const eventClick = new Event('click');
    const getElement = (selector: string) => de.query(By.css(selector));
    const getElements = (selector: string) => de.queryAll(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        imports: [
            MiscModule,
        ],
        declarations: [
            ThumbnailGalleryComponent,
            TranslatePipe,
        ],
        providers: [
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: BlobService,
                useClass: BlobServiceMock,
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ThumbnailGalleryComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        cdr = de.injector.get<ChangeDetectorRef>(ChangeDetectorRef as any);

        comp.links = mockFullLinks;
        comp.itemsPerRow = mockItemsPerRow;
    });

    it('should not render list items when there is no preview', () => {
        comp.links = mockEmptyLinks;
        cdr.detectChanges();

        const listItemsRendered: number = getElements(listSelector).length;
        const expectedLists: number = mockEmptyLinks.length;

        expect(listItemsRendered).toEqual(expectedLists);
    });

    it('should render a list of images and an overlay when a limit is specified', () => {
        comp.limit = mockItemLimit;
        cdr.detectChanges();

        const numLinks = comp.getLinksCollection().length;
        const listItemsRendered = getElements(listSelector).length;
        const overlay = getElement(dataAutomationOverlay);

        expect(comp.collapsed).toBe(true);
        expect(numLinks).toBe(listItemsRendered);
        expect(overlay).toBeDefined();
    });

    it('should render the full list without overlay when no limit is specified', () => {
        cdr.detectChanges();

        const numLinks = comp.getLinksCollection().length;
        const listItemsRendered = getElements(listSelector).length;
        const overlay = getElement(dataAutomationOverlay);

        expect(comp.collapsed).toEqual(false);
        expect(numLinks).toEqual(mockFullLinks.length);
        expect(numLinks).toEqual(listItemsRendered);
        expect(comp.numberOfFurtherPics).toBeNaN();
        expect(overlay).toBeNull();
    });

    it('should not render an overlay when the number of images equals the limit', () => {
        comp.limit = mockItemLimit;
        comp.links = mockFullLinks.slice(0, mockItemLimit);
        cdr.detectChanges();

        const numLinks = comp.getLinksCollection().length;
        const listItemsRendered = getElements(listSelector).length;
        const overlay = getElement(dataAutomationOverlay);

        expect(comp.collapsed).toEqual(false);
        expect(numLinks).toEqual(listItemsRendered);
        expect(overlay).toBeNull();
    });

    it('should emit a clickThumbnail Event', () => {
        const clickedIndex = 1;

        spyOn(comp.clickThumbnail, 'emit');
        cdr.detectChanges();

        const button = getElement(dataAutomationButton(clickedIndex)).nativeElement as HTMLButtonElement;
        button.dispatchEvent(eventClick);
        cdr.detectChanges();

        expect(comp.clickThumbnail.emit).toHaveBeenCalledWith(clickedIndex.toString());
    });

    it('should uncollapse when clicking the plus n overlay and not emit the clickThumbnail event', () => {
        const clickedIndex = mockItemLimit - 1;
        const expectedOverlayText = `+${mockFullLinks.length - mockItemLimit}`;

        spyOn(comp.clickThumbnail, 'emit');
        comp.limit = mockItemLimit;
        cdr.detectChanges();

        const button = getElement(dataAutomationButton(clickedIndex)).nativeElement as HTMLButtonElement;
        const overlayText = getElement(dataAutomationOverlay)?.nativeElement?.textContent?.trim();

        expect(comp.collapsed).toBe(true);
        expect(comp.isOverlayIndex(clickedIndex)).toBe(true);
        expect(overlayText).toEqual(expectedOverlayText);

        button.dispatchEvent(eventClick);
        cdr.detectChanges();

        expect(comp.collapsed).toEqual(false);
        expect(comp.clickThumbnail.emit).not.toHaveBeenCalled();
    });

    it('should emit a clickThumbnail event after a second click after uncollapsing', () => {
        const clickedIndex = mockItemLimit - 1;
        comp.limit = mockItemLimit;
        spyOn(comp.clickThumbnail, 'emit');
        cdr.detectChanges();

        const button = getElement(dataAutomationButton(clickedIndex)).nativeElement as HTMLButtonElement;
        button.dispatchEvent(eventClick);
        cdr.detectChanges();

        expect(comp.collapsed).toEqual(false);
        expect(comp.isOverlayIndex(clickedIndex)).toBe(false);
        expect(comp.clickThumbnail.emit).not.toHaveBeenCalled();

        button.dispatchEvent(eventClick);
        cdr.detectChanges();

        expect(comp.clickThumbnail.emit).toHaveBeenCalledWith(clickedIndex.toString());
    });

});
