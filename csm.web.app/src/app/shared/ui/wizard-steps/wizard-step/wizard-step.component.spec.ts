/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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

import {TranslationModule} from '../../../translation/translation.module';
import {
    WizardStepComponent,
    WizardStepSize,
} from './wizard-step.component';
import {WizardStepTestComponent} from './wizard-step.test.component';

describe('Wizard Step Component', () => {
    let component: WizardStepTestComponent;
    let fixture: ComponentFixture<WizardStepTestComponent>;
    let de: DebugElement;

    const wizardStepLabelSelector = '[data-automation="ss-wizard-step-label"]';
    const wizardStepDotSelector = '[data-automation="ss-wizard-step-dot"]';
    const wizardStepSelector = '[data-automation="ss-wizard-step"]';
    const wizardStepButtonSelector = '[data-automation="ss-wizard-step-button"]';
    const getElement = (selector): HTMLElement => de.query((By.css(selector)))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [
            WizardStepComponent,
            WizardStepTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(WizardStepTestComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;

        fixture.detectChanges();
    });

    it('should render step label', () => {
        const expectedLabel = 'testLabel';
        component.label = expectedLabel;
        fixture.detectChanges();

        const actualContent = getElement(wizardStepLabelSelector).textContent;

        expect(actualContent).toBe(expectedLabel);
    });

    it('should use __dot class div if SMALL WizardStepSize', () => {
        component.size = WizardStepSize.Small;
        fixture.detectChanges();

        const dotElement = getElement(wizardStepDotSelector);
        const buttonElement = getElement(wizardStepButtonSelector);

        expect(dotElement).toBeTruthy();
        expect(buttonElement).toBeFalsy();
    });

    it('should use button if LARGE WizardStepSize', () => {
        component.size = WizardStepSize.Large;
        fixture.detectChanges();

        const dotElement = getElement(wizardStepDotSelector);
        const buttonElement = getElement(wizardStepButtonSelector);

        expect(dotElement).toBeFalsy();
        expect(buttonElement).toBeTruthy();
    });

    it('should have ss-wizard-step--active class if active', () => {
        const expectedClass = 'ss-wizard-step--active';
        component.active = true;
        fixture.detectChanges();

        const stepElement = getElement(wizardStepSelector);

        expect(stepElement.classList).toContain(expectedClass);
    });

    it('should receive active status and set active class', () => {
        const expectedClass = 'ss-wizard-step--active';
        component.active = true;
        fixture.detectChanges();
        const componentClass = getElement(wizardStepSelector).classList;
        expect(componentClass).toContain(expectedClass);
    });

    it('should not set active class if not active status', () => {
        const expectedClass = 'ss-wizard-step--active';
        component.active = false;
        fixture.detectChanges();
        const componentClass = getElement(wizardStepSelector).classList;
        expect(componentClass).not.toContain(expectedClass);
    });

    it('should receive disabled status and set disabled class', () => {
        const expectedClass = 'ss-wizard-step--disabled';
        component.disabled = true;
        fixture.detectChanges();
        const componentClass = getElement(wizardStepSelector).classList;
        expect(componentClass).toContain(expectedClass);
    });

    it('should not set disabled class if not disabled status', () => {
        const expectedClass = 'ss-wizard-step--disabled';
        component.disabled = false;
        fixture.detectChanges();
        const componentClass = getElement(wizardStepSelector).classList;
        expect(componentClass).not.toContain(expectedClass);
    });
});
