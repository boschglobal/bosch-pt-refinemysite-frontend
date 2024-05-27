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
import {
    CSS_CLASS_TEXTAREA_SCROLLABLE,
    InputTextareaComponent,
    TEXTAREA_DEFAULT_MAX_HEIGHT
} from './input-textarea.component';
import {
    INPUT_TEXTAREA_DEFAULT_STATE,
    InputTextareaTestComponent
} from './input-textarea.test.component';

describe('Input Textarea Component', () => {
    let testHostComp: InputTextareaTestComponent;
    let comp: InputTextareaComponent;
    let fixture: ComponentFixture<InputTextareaTestComponent>;
    let de: DebugElement;

    const defaultState: any = Object.assign({}, INPUT_TEXTAREA_DEFAULT_STATE);
    const dataAutomation: string = INPUT_TEXTAREA_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_TEXTAREA_DEFAULT_STATE.automationAttr;
    const inputTextareaComponentSelector = 'ss-input-textarea';
    const dataAutomationInputTextareaSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputMirrorSelector = `[data-automation="${dataAutomation}-mirror"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputCharacterSelector = `[data-automation="${dataAutomation}-character-counter"]`;
    const dataAutomationInputInvalidLabelSelector = `[data-automation="${dataAutomation}-invalid"]`;
    const inputEvent: Event = new Event('input');
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');
    const keyupEvent: Event = new Event('keyup');
    const resizeEvent: Event = new Event('resize');

    const testDataEmptyString = '';
    const testDataShortString = 'foo';
    const testDataUntrimmedString = ' a ';
    const testDataErrorMessageKey = 'Generic_Error';

    const getInputElement = () => {
        return de.query(By.css(dataAutomationInputTextareaSelector)).nativeElement;
    };

    const getInputValue = () => {
        return getInputElement().value;
    };

    const getInputMirrorElement = () => {
        return de.query(By.css(dataAutomationInputMirrorSelector)).nativeElement;
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

    const setInputMirrorScrollHeight = (height: number) => {
        Object.defineProperty(getInputMirrorElement(), 'scrollHeight', {
            get: () => height,
            configurable: true,
        });
    };

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.textarea[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            InputTextareaComponent,
            InputTextareaTestComponent,
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
        fixture = TestBed.createComponent(InputTextareaTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputTextareaComponentSelector));
        comp = de.componentInstance;
        testHostComp.defaultInputState.textarea = defaultState;
        testHostComp.setForm();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
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

        comp.value = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(inputEvent);
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
        getInputElement().dispatchEvent(focusEvent);
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

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
        });
    }));

    it('should render valid CSS class when input is valid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataShortString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
        });
    }));

    it('should have vertical scroll when it has large value and autosize is disabled', () => {
        setDefaultInputStateProperty('isAutosize', false);
        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT + 20);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputElement().classList).toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
        });
    });

    it('should not have scroll when the value does not surpass the max height of the textarea and autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT - 20);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
        });
    });

    it('should recalculate the height after keyup on the input when autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT + 20);
        testHostComp.setForm();
        fixture.detectChanges();

        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT - 20);
        getInputElement().dispatchEvent(keyupEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
        });
    });

    it('should recalculate the height after window resize when autosize is enable', () => {
        setDefaultInputStateProperty('isAutosize', true);
        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT + 20);
        testHostComp.setForm();
        fixture.detectChanges();

        setInputMirrorScrollHeight(TEXTAREA_DEFAULT_MAX_HEIGHT - 20);
        window.dispatchEvent(resizeEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputElement().classList).not.toContain(CSS_CLASS_TEXTAREA_SCROLLABLE);
        });
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

        comp.value = testDataUntrimmedString;
        comp.onInputChange();
        tick(DEFAULT_DEBOUNCE_TIME);

        expect(comp.onChangeCallback).toHaveBeenCalledWith(expectedValue);
        expect(comp.onChange.emit).toHaveBeenCalledWith(expectedValue);
    }));

    it('should focus input when setFocus is called', fakeAsync(() => {
        comp.setFocus();
        tick(500);

        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(comp.textarea.nativeElement.focus).toBeTruthy();
        });
    }));
});
