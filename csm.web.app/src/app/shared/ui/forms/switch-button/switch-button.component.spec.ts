/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
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
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {
    CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED,
    CSS_CLASS_SWITCH_BUTTON_CRITICAL,
    CSS_CLASS_SWITCH_BUTTON_NORMAL,
    SwitchButtonComponent
} from './switch-button.component';
import {
    SWITCH_BUTTON_DEFAULT_STATE,
    SwitchButtonTestComponent
} from './switch-button.test.component';

describe('Switch Button Component', () => {
    let testHostComp: SwitchButtonTestComponent;
    let comp: SwitchButtonComponent;
    let fixture: ComponentFixture<SwitchButtonTestComponent>;
    let de: DebugElement;

    const dataAutomation: string = SWITCH_BUTTON_DEFAULT_STATE.automationAttr;
    const controlName: string = SWITCH_BUTTON_DEFAULT_STATE.controlName;
    const switchButtonComponentSelector = 'ss-switch-button';
    const dataAutomationSwitchButtonSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationSwitchIconSelector = (name: string) => `[data-automation="${dataAutomation}-icon-${name}"]`;

    const clickEvent: Event = new Event('click');

    const testDataDefaultValue = true;

    const getInputElement = () => de.query(By.css(dataAutomationSwitchButtonSelector)).nativeElement;
    const getInputValue = () => getInputElement().checked;
    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;
    const getInputIconElement = (name: string) => de.query(By.css(dataAutomationSwitchIconSelector(name)));
    const getInputWrapperElement = () => de.query(By.css(dataAutomationWrapperSelector)).nativeElement;

    const setDefaultInputStateProperty = (property: string, value: any) => testHostComp.defaultInputState.switch[property] = value;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            SwitchButtonComponent,
            SwitchButtonTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SwitchButtonTestComponent);
        testHostComp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css(switchButtonComponentSelector));
        comp = de.componentInstance;

        testHostComp.defaultInputState.switch = SWITCH_BUTTON_DEFAULT_STATE;
        testHostComp.setForm();

        fixture.detectChanges();
        comp.ngOnInit();
    });

    it('should display default value on the input', () => {
        setDefaultInputStateProperty('value', testDataDefaultValue);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputValue()).toBeTruthy();
    });

    it('should display Angular Forms injected value on the input', () => {
        testHostComp.formGroup.get(controlName).setValue(testDataDefaultValue);
        fixture.detectChanges();
        expect(getInputValue()).toBeTruthy();
    });

    it('should change value when user clicks on label', () => {
        const expectedValue = testDataDefaultValue;
        getInputLabelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should trigger onInputChange() when input is clicked', () => {
        spyOn(comp, 'onInputChange').and.callThrough();
        getInputElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.onInputChange).toHaveBeenCalled();
    });

    it('should emit onSwitch when input is clicked', () => {
        spyOn(comp.onSwitch, 'emit').and.callThrough();
        getInputElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.onSwitch.emit).toHaveBeenCalled();
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        setDefaultInputStateProperty('value', testDataDefaultValue);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        expect(getInputValue()).toBeFalsy();
    });

    it('should not render icon when is not provided', () => {
        comp.icon = undefined;

        fixture.detectChanges();

        expect(getInputIconElement(comp.icon)).toBeNull();
    });

    it('should render icon when provided', () => {
        const icon: string = SWITCH_BUTTON_DEFAULT_STATE.icon;
        comp.icon = icon;

        fixture.detectChanges();

        expect(getInputIconElement(icon)).toBeDefined();
    });

    it(`should not add class ${CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED} when contentInverted is false`, () => {
        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED)).toBeFalsy();
    });

    it(`should add class ${CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED} when contentInverted is true`, () => {
        comp.contentInverted = true;

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_CONTENT_DIRECTION_INVERTED)).toBeTruthy();
    });

    it(`should not add class ${CSS_CLASS_SWITCH_BUTTON_NORMAL} and add ${CSS_CLASS_SWITCH_BUTTON_CRITICAL} when type is critical`, () => {
        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_CRITICAL)).toBeTruthy();
        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_NORMAL)).toBeFalsy();
    });

    it(`should add class ${CSS_CLASS_SWITCH_BUTTON_NORMAL} and not add ${CSS_CLASS_SWITCH_BUTTON_CRITICAL} when type is normal`, () => {
        comp.type = 'normal';

        comp.ngOnInit();
        fixture.detectChanges();

        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_CRITICAL)).toBeFalsy();
        expect(getInputWrapperElement().classList.contains(CSS_CLASS_SWITCH_BUTTON_NORMAL)).toBeTruthy();
    });

    it('should stop propagation of click event when clicking on the input element', () => {
        const event = new Event('click');

        spyOn(event, 'stopPropagation');

        getInputElement().dispatchEvent(event);

        expect(event.stopPropagation).toHaveBeenCalled();
    });
});
