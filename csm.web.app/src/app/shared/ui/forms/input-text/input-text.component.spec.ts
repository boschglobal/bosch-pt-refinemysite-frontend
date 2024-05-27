/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    fakeAsync,
    resetFakeAsyncZone,
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
import {GenericWarnings} from '../../../misc/validation/generic.warnings';
import {TranslationModule} from '../../../translation/translation.module';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID,
    CSS_CLASS_WARNING,
    DEFAULT_DEBOUNCE_TIME
} from '../input.base';
import {InputTextComponent} from './input-text.component';
import {
    INPUT_TEXT_DEFAULT_STATE,
    InputTextTestComponent
} from './input-text.test.component';

describe('Input Text Component', () => {
    let testHostComp: InputTextTestComponent;
    let comp: InputTextComponent;
    let fixture: ComponentFixture<InputTextTestComponent>;
    let de: DebugElement;

    const dataAutomation: string = INPUT_TEXT_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_TEXT_DEFAULT_STATE.controlName;
    const inputTextComponentSelector = 'ss-input-text';
    const dataAutomationInputTextSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputCharacterSelector = `[data-automation="${dataAutomation}-character-counter"]`;
    const dataAutomationInputInvalidLabelSelector = `[data-automation="${dataAutomation}-invalid"]`;
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');

    const testDataEmptyString = '';
    const testDataShortString = 'foo';
    const testDataUntrimmedString = ' a ';
    const testDataErrorMessageKey = 'Generic_Error';

    const getInputElement = () => {
        return de.query(By.css(dataAutomationInputTextSelector)).nativeElement;
    };

    const getInputValue = () => {
        return getInputElement().value;
    };

    const getInputWrapperElement = () => {
        return de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;
    };

    const getInputLabelElement = () => {
        return de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;
    };

    const getInputCharacterCounterDebugElement = () => {
        return de.query(By.css(dataAutomationInputCharacterSelector));
    };

    const getInputInvalidLabelElement = () => {
        return de.query(By.css(dataAutomationInputInvalidLabelSelector)).nativeElement;
    };

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.text[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            InputTextComponent,
            InputTextTestComponent,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub()
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputTextTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputTextComponentSelector));
        comp = de.componentInstance;

        testHostComp.defaultInputState.text = INPUT_TEXT_DEFAULT_STATE;
        testHostComp.setForm();
        resetFakeAsyncZone();
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should display default value on the input', () => {
        const expectedValue = testDataShortString;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display Angular Forms injected value on the input', () => {
        const expectedValue = testDataShortString;

        testHostComp.formGroup.get(controlName).setValue(expectedValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display user typed value on the input', () => {
        const expectedValue = testDataShortString;

        comp.onInputChange(expectedValue);
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataShortString);
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
        setDefaultInputStateProperty('value', testDataShortString);
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

    it('should render the right character counter', () => {
        const maxCharacter = 100;
        const expectedValue = `${testDataShortString.length}/${maxCharacter}`;

        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('maxCharacter', maxCharacter);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputCharacterCounterDebugElement().nativeElement.textContent).toContain(expectedValue);
    });

    it('should not render the right character counter', () => {
        const maxCharacter = 100;

        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('maxCharacter', maxCharacter);
        setDefaultInputStateProperty('showCounter', false);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputCharacterCounterDebugElement()).toBeNull();
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
        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
    }));

    it('should focus input when setFocus is called', fakeAsync(() => {
        comp.setFocus();
        tick(500);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(comp.input.nativeElement.focus).toBeTruthy();
        });
    }));

    it('should set fixed value on focus', () => {
        const expectedValue = '+';

        comp.value = '';
        comp.fixedValue = expectedValue;
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        expect(comp.value).toBe(expectedValue);
    });

    it('should clear fixed value on blur if value equals fixedValue', () => {
        const expectedValue = '';
        const fixedValue = '+';

        comp.value = '';
        comp.fixedValue = fixedValue;

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(comp.value).toBe(expectedValue);
        });
    });

    it('should propagate correct value when a prefix is defined and the input value changes', () => {
        spyOn(comp.onInput, 'emit').and.callThrough();

        const prefix = '+';
        const value = '1';
        const expectedValue = `${prefix}${value}`;

        comp.value = '';
        comp.fixedValue = prefix;
        comp.onInputChange(value);

        expect(comp.value).toBe(expectedValue);
        expect(comp.onInput.emit).toHaveBeenCalledWith(expectedValue);
    });

    it('should render warning CSS class when input is filled with max characters', () => {
        const maxCharacter = testDataShortString.length;
        comp.maxCharacter = maxCharacter;
        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('validators', [GenericWarnings.isCharLimitReached(maxCharacter)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_WARNING);
        });
    });

    it('should remove left and right white spaces from value', fakeAsync(() => {
        const expectedValue = testDataUntrimmedString.trim();

        spyOn(comp, 'onChangeCallback');
        spyOn(comp.onChange, 'emit');

        comp.onInputChange(testDataUntrimmedString);
        tick(DEFAULT_DEBOUNCE_TIME);

        expect(comp.onChangeCallback).toHaveBeenCalledWith(expectedValue);
        expect(comp.onChange.emit).toHaveBeenCalledWith(expectedValue);
    }));
});
