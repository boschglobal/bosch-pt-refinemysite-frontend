/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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

import {TranslationModule} from '../../translation/translation.module';
import {
    ButtonLink,
    ButtonLinkComponent,
} from '../links/button-link/button-link.component';
import {ModalService} from '../modal/api/modal.service';
import {TextLinkComponent} from './text-link.component';
import {TextLinkTestComponent} from './text-link.test.component';

describe('Text Link Component', () => {
    let comp: TextLinkComponent;
    let testHostComp: TextLinkTestComponent;
    let fixture: ComponentFixture<TextLinkTestComponent>;
    let modalService: ModalService;
    let de: DebugElement;

    const textLinkComponentSelector = 'ss-text-link';
    const dataAutomationTextLinkSelector = '[data-automation="text-link"]';

    const getElements = (selector: string): DebugElement[] => fixture.debugElement.queryAll(By.css(selector));

    const getLink = (index: number): ButtonLink => getElements(dataAutomationTextLinkSelector)[index].componentInstance.link;

    const getLinkIcon = (index: number): string => getElements(dataAutomationTextLinkSelector)[index].componentInstance.linkIcon?.name;

    const getLinkTitle = (index: number): string => getElements(dataAutomationTextLinkSelector)[index].nativeElement.title;

    const getText = (index: number): string => getElements(dataAutomationTextLinkSelector)[index].nativeElement.textContent;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            ButtonLinkComponent,
            TextLinkComponent,
            TextLinkTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TextLinkTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(textLinkComponentSelector));
        comp = de.componentInstance;
        modalService = TestBed.inject(ModalService);
    });

    it('should default the maxLength to 3 when the provided one is smaller than 3', () => {
        const expectedText = '...';
        const text = '1234';

        testHostComp.textMaxSize = 2;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(comp.items[0].text).toBe(expectedText);
    });

    it('should keep the maxLength as 0 when the provided one is 0', () => {
        const text = '1234';

        testHostComp.textMaxSize = 0;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(comp.items[0].text).toBe(text);
    });

    it('should keep the maxLength when the provided one is bigger than 3', () => {
        const text = '1234';

        testHostComp.textMaxSize = 4;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(comp.items[0].text).toBe(text);
    });

    it('should render the text when no link is provided in the text', () => {
        const text = '1234 56789';

        testHostComp.textMaxSize = 0;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(getElements(dataAutomationTextLinkSelector).length).toBe(1);
        expect(getText(0)).toBe(text);
    });

    it('should truncate the text when the provided text is bigger than the maxLength', () => {
        const text = '1234 56789';
        const expectedText = '123...';

        testHostComp.textMaxSize = 6;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(getText(0)).toBe(expectedText);
    });

    it('should not truncate the text when the provided text has the same length as the maxLength', () => {
        const text = '1234 56789';

        testHostComp.textMaxSize = 10;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(getText(0)).toBe(text);
    });

    it('should render the text and the link when one link is provided in the text', () => {
        const providedText = '1234 https://google.pt 56789';
        const item1 = '1234 ';
        const item2 = 'https://google.pt';
        const item3 = ' 56789';

        testHostComp.textMaxSize = 0;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getText(0)).toBe(item1);
        expect(getLink(1).label).toBe(item2);
        expect(getText(2)).toBe(item3);
    });

    it('should truncate the text when the provided text is bigger than the maxLength and it ends with text', () => {
        const providedText = '1234 https://google.pt 56789';
        const item1 = '1234 ';
        const item2 = 'https://google.pt';
        const item3 = '...';

        testHostComp.textMaxSize = 25;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getText(0)).toBe(item1);
        expect(getLink(1).label).toBe(item2);
        expect(getText(2)).toBe(item3);
    });

    it('should truncate the link when the provided text is bigger than the maxLength and it ends with a link', () => {
        const providedText = '1234 https://google.pt';
        const item1 = '1234 ';
        const item2 = 'https...';

        testHostComp.textMaxSize = 13;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getText(0)).toBe(item1);
        expect(getLink(1).label).toBe(item2);
    });

    it('should truncate the link when the provided text has a link bigger than the supported link length', () => {
        const bigLink = `https://${new Array(40).fill('a').join('')}.com`;
        const providedText = `1234 ${bigLink}`;
        const item1 = '1234 ';
        const item2 = `https://${new Array(39).fill('a').join('')}...`;

        testHostComp.textMaxSize = 0;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getText(0)).toBe(item1);
        expect(getLink(1).label).toBe(item2);
    });

    it('should truncate the link when the provided text is bigger than the maxLength, it end with a link and the link is bigger ' +
        'than the supported link length', () => {
        const bigLink = `https://${new Array(40).fill('a').join('')}.com`;
        const providedText = `1234 ${bigLink}`;
        const item1 = '1234 ';
        const item2 = 'https:/...';

        testHostComp.textMaxSize = 15;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getText(0)).toBe(item1);
        expect(getLink(1).label).toBe(item2);
    });

    it('should show the external-link icon when the link in the text is an external link', () => {
        const expectedIcon = 'external-link-tiny';

        testHostComp.textMaxSize = 0;
        testHostComp.text = 'https://google.pt';
        fixture.detectChanges();

        expect(getLinkIcon(0)).toBe(expectedIcon);
    });

    it('should now show the external-link icon when the link in the text is an internal link', () => {
        testHostComp.textMaxSize = 0;
        testHostComp.text = 'https://dev.bosch-refinemysite.com/projects/bbf701dc-37e2-4d00-8103-5e6c8b348b30/tasks/';
        fixture.detectChanges();

        expect(getLinkIcon(0)).toBeUndefined();
    });

    it('should use a native href element when the link in the text is an internal link', () => {
        const text = 'https://dev.bosch-refinemysite.com/projects/bbf701dc-37e2-4d00-8103-5e6c8b348b30/tasks/';

        testHostComp.textMaxSize = 0;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(getLink(0).action).toBeUndefined();
        expect(getLink(0).href).toBe(text);
        expect(getLink(0).hrefNewTab).toBeFalsy();
    });

    it('should use a action button when the link in the text is an external link', () => {
        testHostComp.textMaxSize = 0;
        testHostComp.text = 'https://google.com';
        fixture.detectChanges();

        expect(getLink(0).href).toBeUndefined();
        expect(getLink(0).action).toBeDefined();
    });

    it('should open a confirmation dialog when the external link is clicked', () => {
        spyOn(modalService, 'open').and.callThrough();

        testHostComp.textMaxSize = 0;
        testHostComp.text = 'https://google.com';
        fixture.detectChanges();

        getLink(0).action();

        expect(modalService.open).toHaveBeenCalled();
    });

    it('should redirect to the external link and close the modal when the action is confirmed', () => {
        const text = 'https://google.com';

        spyOn(modalService, 'close').and.callThrough();
        spyOn(window, 'open').and.callThrough();

        testHostComp.textMaxSize = 0;
        testHostComp.text = text;
        fixture.detectChanges();

        getLink(0).action();
        modalService.currentModalData.confirmCallback();

        expect(window.open).toHaveBeenCalledWith(text, '_blank');
        expect(modalService.close).toHaveBeenCalled();
    });

    it('should add the // prefix to the links that doesn\'t start with http', () => {
        const providedText = 'dev.bosch-refinemysite.com/projects/bbf701dc-37e2-4d00-8103-5e6c8b348b30/tasks/';
        const expectedLink = '//dev.bosch-refinemysite.com/projects/bbf701dc-37e2-4d00-8103-5e6c8b348b30/tasks/';

        testHostComp.textMaxSize = 0;
        testHostComp.text = providedText;
        fixture.detectChanges();

        expect(getLink(0).href).toBe(expectedLink);
    });

    it('should show the native tooltip for the link elements', () => {
        const text = 'https://google.pt';

        testHostComp.textMaxSize = 0;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(getLinkTitle(0)).toBe(text);
    });

    it('should emit the truncatedTextLength with the length of the text when it doesn\'t contain links', () => {
        const length = 20;
        const text = new Array(length).fill('b').join('');

        spyOn(comp.truncatedTextLength, 'emit');

        testHostComp.textMaxSize = 10;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(comp.truncatedTextLength.emit).toHaveBeenCalledWith(length);
    });

    it('should emit the truncatedTextLength with the length of the text when it contains links', () => {
        const length = 50;
        const text = `https://${new Array(60).fill('a').join('')}.com`;

        spyOn(comp.truncatedTextLength, 'emit');

        testHostComp.textMaxSize = 10;
        testHostComp.text = text;
        fixture.detectChanges();

        expect(comp.truncatedTextLength.emit).toHaveBeenCalledWith(length);
    });
});
