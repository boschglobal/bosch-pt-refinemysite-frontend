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
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {TranslationModule} from '../../../translation/translation.module';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID,
    DEFAULT_DEBOUNCE_TIME
} from '../input.base';
import {
    CSS_CLASS_ARROW_DISABLED,
    InputNumberComponent
} from './input-number.component';
import {
    INPUT_NUMBER_DEFAULT_STATE,
    InputNumberTestComponent
} from './input-number.test.component';

describe('Input Number Component', () => {
    let testHostComp: InputNumberTestComponent;
    let comp: InputNumberComponent;
    let fixture: ComponentFixture<InputNumberTestComponent>;
    let de: DebugElement;

    const dataAutomation: string = INPUT_NUMBER_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_NUMBER_DEFAULT_STATE.controlName;
    const inputNumberComponentSelector = 'ss-input-number';
    const dataAutomationInputNumberSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputDecrementSelector = `[data-automation="${dataAutomation}-decrement"]`;
    const dataAutomationInputIncrementSelector = `[data-automation="${dataAutomation}-increment"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputInvalidLabelSelector = `[data-automation="${dataAutomation}-invalid"]`;
    const dataAutomationInputIconSelector = `[data-automation="${dataAutomation}-icon"]`;
    const inputEvent: Event = new Event('input');
    const inputEventInsertText: InputEvent = new InputEvent('input', {inputType: 'insertText'});
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');

    const testDataEmptyString = '';
    const testDataNumber = 5;
    const testDataErrorMessageKey = 'Generic_Error';

    const getInputElement = () => de.query(By.css(dataAutomationInputNumberSelector)).nativeElement;

    const getInputValue = () => getInputElement().value;

    const getInputWrapperElement = () => de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;

    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;

    const getInputInvalidLabelElement = () => de.query(By.css(dataAutomationInputInvalidLabelSelector)).nativeElement;

    const getInputIncrementElement = () => de.query(By.css(dataAutomationInputIncrementSelector)).nativeElement;

    const getInputDecrementElement = () => de.query(By.css(dataAutomationInputDecrementSelector)).nativeElement;

    const getInputIconElement = () => de.query(By.css(dataAutomationInputIconSelector)).nativeElement;

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.number[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            InputNumberComponent,
            InputNumberTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputNumberTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputNumberComponentSelector));
        comp = de.componentInstance;

        testHostComp.defaultInputState.number = INPUT_NUMBER_DEFAULT_STATE;
        testHostComp.setForm();
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should display default value on the input', () => {
        const expectedValue = testDataNumber;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display Angular Forms injected value on the input', () => {
        const expectedValue = testDataNumber;

        testHostComp.formGroup.get(controlName).setValue(expectedValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display user typed value on the input', () => {
        const expectedValue = testDataNumber;

        comp.value = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(inputEvent);
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataNumber);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should render focus CSS class when input is focused', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FOCUSED);
        });
    });

    it('should render blur CSS class when input is blurred', () => {
        comp.isFocused = true;
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
        });
    });

    it('should render filled CSS class when input has content', () => {
        setDefaultInputStateProperty('value', testDataNumber);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILLED);
        });
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        setDefaultInputStateProperty('isDisabled', true);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
        });
    });

    it('should render disabled CSS class when isDisabled property is injected by Angular Forms', () => {
        testHostComp.formGroup.get(controlName).disable();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
        });
    });

    it('should render required CSS class when isRequired property is passed in', () => {
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_REQUIRED);
        });
    });

    it('should render a wildcard (*) on the label when the input is required', () => {
        setDefaultInputStateProperty('label', 'text');
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputLabelElement().textContent).toContain('*');
        });
    });

    it('should show error message when input is invalid after is touched', () => {
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();
        fixture.detectChanges();

        testHostComp.formGroup.get(controlName).setValue('');
        testHostComp.formGroup.get(controlName).markAsTouched();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputInvalidLabelElement().textContent).toContain(testDataErrorMessageKey);
        });
    });

    it('should render invalid CSS class when input is invalid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataEmptyString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
    }));

    it('should render valid CSS class when input is valid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataNumber);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
    }));

    it('should increment value when handleIncrement is called', () => {
        setDefaultInputStateProperty('value', testDataNumber);
        testHostComp.setForm();

        comp.handleIncrement();
        expect(comp.value).toBe(testDataNumber + INPUT_NUMBER_DEFAULT_STATE.step);
    });

    it('should decrement value when handleDecrement is called', () => {
        setDefaultInputStateProperty('value', testDataNumber);
        testHostComp.setForm();

        comp.handleDecrement();
        expect(comp.value).toBe(testDataNumber - INPUT_NUMBER_DEFAULT_STATE.step);
    });

    it('should disable increment arrow when is not possible to increment', () => {
        setDefaultInputStateProperty('value', 10);
        setDefaultInputStateProperty('max', 10);
        testHostComp.setForm();

        fixture.detectChanges();
        expect(getInputIncrementElement().classList).toContain(CSS_CLASS_ARROW_DISABLED);
    });

    it('should disable decrement arrow when is not possible to decrement', () => {
        setDefaultInputStateProperty('value', 0);
        setDefaultInputStateProperty('min', 0);
        testHostComp.setForm();

        fixture.detectChanges();
        expect(getInputDecrementElement().classList).toContain(CSS_CLASS_ARROW_DISABLED);
    });

    it('should not pass maximum when incrementing', () => {
        const value = 9;
        const max = 11;
        const step = 5;
        setDefaultInputStateProperty('value', value);
        setDefaultInputStateProperty('max', max);
        setDefaultInputStateProperty('step', step);
        testHostComp.setForm();

        comp.handleIncrement();
        expect(comp.value).toBeLessThan(max);
    });

    it('should not pass minimum when decrementing', () => {
        const value = 8;
        const min = 3;
        const step = 5;
        setDefaultInputStateProperty('value', value);
        setDefaultInputStateProperty('min', min);
        setDefaultInputStateProperty('step', step);
        testHostComp.setForm();

        comp.handleDecrement();
        expect(comp.value).toBeGreaterThan(min);
    });

    it('should not have icon', () => {
        const icon = undefined;

        setDefaultInputStateProperty('icon', icon);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(comp.hasIcon()).toBeFalsy();
    });

    it('should have icon', () => {
        const icon = 'user';

        setDefaultInputStateProperty('icon', icon);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(comp.hasIcon()).toBeTruthy();
        expect(getInputIconElement()).toBeDefined();
    });

    it('should get correct value length when there is maxDigits', () => {
        comp.maxDigits = 4;
        fixture.detectChanges();
        const input: HTMLInputElement = getInputElement();
        input.value = '1012';
        input.dispatchEvent(inputEvent);
        input.value = '10125';
        input.dispatchEvent(inputEventInsertText);
        fixture.whenStable().then(() => {
            expect(comp.value).toEqual(1012);
        });
    });

    it('should let the user use the minus sign but only if its the first character', () => {
        const input: HTMLInputElement = getInputElement();
        input.value = '-';
        input.dispatchEvent(inputEventInsertText);
        input.value = '-1';
        input.dispatchEvent(inputEventInsertText);
        input.value = '-1-';
        input.dispatchEvent(inputEventInsertText);
        fixture.whenStable().then(() => {
            expect(comp.value).toEqual(-1);
        });
    });

    it('should not write non numeric chars', () => {
        const input: HTMLInputElement = getInputElement();
        input.value = '';
        input.dispatchEvent(inputEvent);
        input.value = 'e';
        input.dispatchEvent(inputEventInsertText);
        fixture.whenStable().then(() => {
            expect(comp.value).toEqual('');
        });
    });
});
