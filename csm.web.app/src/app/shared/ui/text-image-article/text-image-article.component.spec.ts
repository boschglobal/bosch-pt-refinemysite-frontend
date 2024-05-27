/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {TextImageArticleComponent} from './text-image-article.component';

describe('Text Image Article Component', () => {
    let component: TextImageArticleComponent;
    let fixture: ComponentFixture<TextImageArticleComponent>;
    let de: DebugElement;

    const dataAutomationText = '[data-automation="ss-text-image-article-text"]';
    const dataAutomationShowMore = '[data-automation="ss-text-image-article-show-more"]';
    const dataAutomationImages = '[data-automation="ss-text-image-article-images"]';

    const pictureLinks = [
        'construction-site-01.jpg',
        'construction-site-02.jpg',
        'construction-site-03.jpg',
        'construction-site-04.jpg',
        'construction-site-05.jpg',
    ];
    const textMaxSize = 180;

    const getElement = (selector: string) => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            TextImageArticleComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextImageArticleComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
    });

    it('should show the text-link element when the textContent is provided', () => {
        component.textContent = '123';
        fixture.detectChanges();

        expect(getElement(dataAutomationText)).toBeTruthy();
    });

    it('should not show the text-link element when the textContent is not provided', () => {
        component.textContent = '';
        fixture.detectChanges();

        expect(getElement(dataAutomationText)).toBeFalsy();
    });

    it('should show the show more element when the text length is bigger than the textMaxSize', () => {
        component.textMaxSize = textMaxSize;
        component.handleTextLengthChanged(textMaxSize + 1);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMore)).toBeTruthy();
    });

    it('should not show the show more element when the text length is smaller than the textMaxSize', () => {
        component.textMaxSize = textMaxSize;
        component.handleTextLengthChanged(textMaxSize - 1);
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMore)).toBeFalsy();
    });

    it('should not show the show more element when the textMaxSize is null', () => {
        component.textMaxSize = null;
        fixture.detectChanges();

        expect(getElement(dataAutomationShowMore)).toBeFalsy();
    });

    it('should show the picture thumbnails when there are pictures', () => {
        component.pictureLinks = pictureLinks;
        fixture.detectChanges();

        expect(getElement(dataAutomationImages)).toBeTruthy();
    });

    it('should not show the picture thumbnails when there are no pictures', () => {
        component.pictureLinks = [];
        fixture.detectChanges();

        expect(getElement(dataAutomationImages)).toBeFalsy();
    });

    it('should set the maxLength to the provided textMaxSize when canShowMore is true and the text is collapsed', () => {
        spyOnProperty(component, 'canShowMore', 'get').and.returnValue(true);

        component.textMaxSize = textMaxSize;
        component.handleTextLengthChanged(0);

        expect(component.maxLength).toBe(textMaxSize);
    });

    it('should set the maxLength to 0 when canShowMore is true and the text is not collapsed', () => {
        spyOnProperty(component, 'canShowMore', 'get').and.returnValue(true);

        component.textMaxSize = textMaxSize;
        component.onShowMoreChange();

        expect(component.maxLength).toBe(0);
    });

    it('should set the maxLength to 0 when canShowMore is false', () => {
        spyOnProperty(component, 'canShowMore', 'get').and.returnValue(false);

        component.textMaxSize = textMaxSize;
        component.onShowMoreChange();

        expect(component.maxLength).toBe(0);
    });
});
