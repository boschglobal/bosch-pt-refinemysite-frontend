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
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {AlertTypeEnum} from '../../enums/alert-type.enum';
import {CalloutComponent} from './callout.component';
import {CalloutTestComponent} from './callout.test.component';

describe('Callout Component', () => {

    let comp: CalloutComponent;
    let testHostComp: CalloutTestComponent;
    let fixture: ComponentFixture<CalloutTestComponent>;
    let de: DebugElement;

    const message = 'RefinemySite is the best!';
    const type = AlertTypeEnum.Success;

    const calloutSelector = '[data-automation="callout"]';
    const calloutMessageSelector = '[data-automation="callout-message"]';
    const clickEvent: Event = new Event('click');
    const dataAutomationCloseButtonSelector = `[data-automation="ss-callout__close"]`;
    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        declarations: [
            CalloutTestComponent,
            CalloutComponent,
        ],
    };

    const getMessage = () => de.query(By.css(calloutMessageSelector)).nativeElement.textContent.trim();
    const getNativeElement = (selector: string): HTMLElement => de.query(By.css(selector)).nativeElement;

    const getIcon = (name: string) => {
        const calloutIconSelector = `[data-automation="callout-icon-${name}"]`;
        return de.query(By.css(calloutIconSelector));
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef)
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalloutTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css('ss-callout'));
        comp = de.componentInstance;
        fixture.detectChanges();
    });

    it('should render correct message', () => {
        testHostComp.message = message;
        testHostComp.type = type;

        fixture.detectChanges();

        expect(getMessage()).toBe(message);
    });

    it('should render correct icon', () => {
        testHostComp.message = message;
        testHostComp.type = type;

        fixture.detectChanges();

        expect(getIcon(type)).not.toBeNull();
    });

    it('should set correct CSS classes', () => {
        const expectedResult = {
            ['ss-callout']: true,
            [`ss-callout--${type}`]: true,
        };
        testHostComp.message = message;
        testHostComp.type = type;

        fixture.detectChanges();

        expect(de.query(By.css(calloutSelector)).classes).toEqual(expectedResult);
    });

    it('should set the ss-callout__message--preformatted modifier when the preformatted input is set to true', () => {
        testHostComp.message = message;
        testHostComp.type = type;
        testHostComp.preformatted = true;

        fixture.detectChanges();

        const messageElement = de.query(By.css(calloutMessageSelector)).nativeElement;

        expect(messageElement.classList).toContain('ss-callout__message--preformatted');
    });

    it('should not set the ss-callout__message--preformatted modifier when the preformatted input is set to false', () => {
        testHostComp.message = message;
        testHostComp.type = type;
        testHostComp.preformatted = false;

        fixture.detectChanges();

        const messageElement = de.query(By.css(calloutMessageSelector)).nativeElement;

        expect(messageElement.classList).not.toContain('ss-callout__message--preformatted');
    });

    it('should not show close button when isCloseable is false', () => {
        testHostComp.isCloseable = false;

        fixture.detectChanges();

        expect(de.query(By.css(dataAutomationCloseButtonSelector))).toBeNull();
    });

    it('should show close button when isCloseable is true', () => {
        testHostComp.isCloseable = true;

        fixture.detectChanges();

        expect(getNativeElement(dataAutomationCloseButtonSelector)).toBeDefined();
    });

    it('should emit calloutClosed when user closes the callout', () => {
        testHostComp.isCloseable = true;
        spyOn(comp.calloutClosed, 'emit').and.callThrough();

        fixture.detectChanges();

        getNativeElement(dataAutomationCloseButtonSelector).dispatchEvent(clickEvent);

        expect(comp.calloutClosed.emit).toHaveBeenCalled();
    });

});
