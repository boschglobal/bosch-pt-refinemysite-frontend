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

import {MOCK_COLORS} from '../../../../../test/mocks/colors';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {TranslationModule} from '../../../translation/translation.module';
import {ModalComponent} from '../../modal/containers/modal-component/modal.component';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID,
    DEFAULT_DEBOUNCE_TIME
} from '../input.base';
import {InputColorpickerComponent} from './input-colorpicker.component';
import {
    INPUT_COLORPICKER_DEFAULT_STATE,
    InputColorpickerTestComponent
} from './input-colorpicker.test.component';

describe('Input Colorpicker Component', () => {
    let testHostComp: InputColorpickerTestComponent;
    let comp: InputColorpickerComponent;
    let fixture: ComponentFixture<InputColorpickerTestComponent>;
    let de: DebugElement;

    const selectedColor: string = MOCK_COLORS[3];

    const dataAutomation: string = INPUT_COLORPICKER_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_COLORPICKER_DEFAULT_STATE.controlName;
    const inputColorpickerComponentSelector = 'ss-input-colorpicker';
    const dataAutomationInputColorpickerSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputColorSwatchSelector = `[data-automation="${dataAutomation}-color-swatch"]`;
    const dataAutomationInputModalSelector = `[data-automation="modal-wrapper"]`;
    const dataAutomationInputModalCancelSelector = `[data-automation="${dataAutomation}-modal-cancel"]`;
    const dataAutomationInputModalConfirmSelector = `[data-automation="${dataAutomation}-modal-confirm"]`;
    const dataAutomationInputColorSelector = `[data-automation="${dataAutomation}-color-${selectedColor}"]`;

    const inputEvent: Event = new Event('input');
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');
    const clickEvent: Event = new Event('click');

    const testDataDefaultColor = MOCK_COLORS[0];
    const testDataDefaultColorRGB = 'rgb(217, 194, 0)';
    const testDataErrorMessageKey = 'Generic_Error';
    const selectedColorCSSClass = 'ss-input-colorpicker__color--selected';

    const getInputElement = () => {
        return de.query(By.css(dataAutomationInputColorpickerSelector)).nativeElement;
    };

    const getInputValue = () => {
        return getInputElement().value;
    };

    const getInputWrapperElement = () => {
        return de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;
    };

    const getInputColorSwatchElement = () => {
        return de.query(By.css(dataAutomationInputColorSwatchSelector)).nativeElement;
    };

    const getInputModalDebugElement = () => {
        return de.query(By.css(dataAutomationInputModalSelector));
    };

    const getInputModalCancelElement = () => {
        return de.query(By.css(dataAutomationInputModalCancelSelector)).nativeElement;
    };

    const getInputModalConfirmElement = () => {
        return de.query(By.css(dataAutomationInputModalConfirmSelector)).nativeElement;
    };

    const getInputColorElement = () => {
        return de.query(By.css(dataAutomationInputColorSelector)).nativeElement;
    };

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.colorpicker[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
        ],
        declarations: [
            InputColorpickerComponent,
            InputColorpickerTestComponent,
            ModalComponent,
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
        fixture = TestBed.createComponent(InputColorpickerTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputColorpickerComponentSelector));
        comp = de.componentInstance;

        testHostComp.defaultInputState.colorpicker = INPUT_COLORPICKER_DEFAULT_STATE;
        testHostComp.setForm();
        fixture.detectChanges();
    });

    afterEach(() => {
        comp.isOpened = false;
    });

    it('should display default value on the input', () => {
        const expectedValue = testDataDefaultColor;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display Angular Forms injected value on the input', () => {
        const expectedValue = testDataDefaultColor;

        testHostComp.formGroup.get(controlName).setValue(expectedValue);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should display user typed value on the input', () => {
        const expectedValue = testDataDefaultColor;

        comp.value = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(inputEvent);
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(expectedValue);
        });
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        setDefaultInputStateProperty('value', selectedColor);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputValue()).toBe(testDataDefaultColor);
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
        setDefaultInputStateProperty('value', testDataDefaultColor);
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

    it('should render invalid CSS class when input is invalid', fakeAsync(() => {
        setDefaultInputStateProperty('value', selectedColor);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isPattern(new RegExp(/(#XXXXXX)/g))]);
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
        setDefaultInputStateProperty('value', testDataDefaultColor);
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

    it('should open color modal when handleOpen is called', () => {
        comp.handleOpen();
        fixture.detectChanges();
        expect(comp.isOpened).toBeTruthy();
        expect(getInputModalDebugElement()).toBeTruthy();
    });

    it('should open color modal when input is focused', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        expect(comp.isOpened).toBeTruthy();
        expect(getInputModalDebugElement()).toBeTruthy();
    });

    it('should close color modal when handleClose is called', () => {
        comp.isOpened = true;
        comp.handleClose();
        fixture.detectChanges();
        expect(comp.isOpened).toBeFalsy();
        expect(getInputModalDebugElement()).toBeFalsy();
    });

    it('should close color modal when cancel button is clicked', () => {
        comp.isOpened = true;
        fixture.detectChanges();
        getInputModalCancelElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.isOpened).toBeFalsy();
        expect(getInputModalDebugElement()).toBeFalsy();
    });

    it('should select a color when clicking on one', () => {
        comp.isOpened = true;
        fixture.detectChanges();
        getInputColorElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(getInputColorElement().classList).toContain(selectedColorCSSClass);
    });

    it('should confirm selection of a color when clicking on confirm button', () => {
        comp.isOpened = true;
        fixture.detectChanges();
        getInputColorElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        getInputModalConfirmElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.value).toBe(selectedColor);
    });

    it('should set style of color swatch to input color value', () => {
        const expectedValue = testDataDefaultColor;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputColorSwatchElement().style.background).toBe(testDataDefaultColorRGB);
        });
    });
});
