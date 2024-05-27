/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {RouterTestingModule} from '@angular/router/testing';

import {TranslationModule} from '../../../translation/translation.module';
import {ButtonComponent} from '../../button/button.component';
import {
    ButtonLink,
    ButtonLinkComponent,
    DEFAULT_BUTTON_LINK_ICON,
} from './button-link.component';
import {ButtonLinkTestComponent} from './button-link.test.component';

describe('Button Link Component', () => {
    let testHostComp: ButtonLinkTestComponent;
    let fixture: ComponentFixture<ButtonLinkTestComponent>;
    let de: DebugElement;

    const componentSelector = 'ss-button-link';
    const dataAutomationButtonActionSelector = '[data-automation="button-action"]';
    const dataAutomationInternalButtonLinkSelector = '[data-automation="button-link-internal"]';
    const dataAutomationExternalButtonLinkSelector = '[data-automation="button-link-external"]';
    const dataAutomationButtonLabelSelector = '[data-automation="button-link-label"]';
    const iconSelector = '[data-automation="button-link-icon"]';

    const buttonAction: ButtonLink = {
        label: 'Touch me',
        action: () => {
        },
    };

    const internalButtonLink: ButtonLink = {
        label: 'Touch me',
        routerLink: '/foo',
    };

    const externalButtonLink: ButtonLink = {
        label: 'Touch me',
        href: 'https://google.com',
    };

    const getElement = (selector: string) => de.query(By.css(selector)).nativeElement;

    const getIcon = () => de.query(By.css(iconSelector));

    const clickEvent: Event = new Event('click');

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            RouterTestingModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            ButtonComponent,
            ButtonLinkComponent,
            ButtonLinkTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ButtonLinkTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(componentSelector));

        testHostComp.link = buttonAction;
        fixture.detectChanges();
    });

    it('should display the text is defined', () => {
        expect(getElement(dataAutomationButtonLabelSelector).innerText.trim()).toBe(buttonAction.label);
    });

    it('should call action when it\'s a button action', () => {
        spyOn(buttonAction, 'action');

        getElement(dataAutomationButtonActionSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(buttonAction.action).toHaveBeenCalled();
    });

    it('should render correct internal link when routerLink is provided', () => {
        const expectedResult = internalButtonLink.routerLink;

        testHostComp.link = internalButtonLink;
        fixture.detectChanges();

        expect(getElement(dataAutomationInternalButtonLinkSelector).getAttribute('href')).toEqual(expectedResult);
    });

    it('should render correct external link when href is provided', () => {
        const expectedResult = externalButtonLink.href;

        testHostComp.link = externalButtonLink;
        fixture.detectChanges();

        expect(getElement(dataAutomationExternalButtonLinkSelector).getAttribute('href')).toEqual(expectedResult);
    });

    it('should render correct external link to be opened in another tab when hrefNewTab is true', () => {
        const expectedTarget = '_blank';
        const expectedRel = 'noopener noreferrer nofollow';

        externalButtonLink.hrefNewTab = true;
        testHostComp.link = externalButtonLink;
        fixture.detectChanges();

        expect(getElement(dataAutomationExternalButtonLinkSelector).getAttribute('target')).toEqual(expectedTarget);
        expect(getElement(dataAutomationExternalButtonLinkSelector).getAttribute('rel')).toEqual(expectedRel);
    });

    it('should render correct external link not to be opened in another tab when hrefNewTab is false', () => {
        const expectedTarget = '_self';
        const expectedRel = '';

        externalButtonLink.hrefNewTab = false;
        testHostComp.link = externalButtonLink;
        fixture.detectChanges();

        expect(getElement(dataAutomationExternalButtonLinkSelector).getAttribute('target')).toEqual(expectedTarget);
        expect(getElement(dataAutomationExternalButtonLinkSelector).getAttribute('rel')).toEqual(expectedRel);
    });

    it('should show the link icon if the linkIcon is set otherwise it should not be visible', () => {
        testHostComp.linkIcon = null;
        fixture.detectChanges();

        expect(getIcon()).toBeNull();

        testHostComp.linkIcon = DEFAULT_BUTTON_LINK_ICON;
        fixture.detectChanges();

        expect(getIcon()).not.toBeNull();
    });
});
