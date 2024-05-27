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
    waitForAsync
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {RadioButtonComponent} from './radio-button.component';
import {
    RADIO_BUTTON_DEFAULT_STATE,
    RadioButtonTestComponent
} from './radio-button.test.component';

describe('Radio Button Component', () => {
    let testHostComp: RadioButtonTestComponent;
    let comp: RadioButtonComponent;
    let fixture: ComponentFixture<RadioButtonTestComponent>;
    let de: DebugElement;

    const dataAutomation: string = RADIO_BUTTON_DEFAULT_STATE.automationAttr;
    const controlName: string = RADIO_BUTTON_DEFAULT_STATE.controlName;
    const radioButtonComponentSelector = 'ss-radio-button';
    const dataAutomationRadioButtonSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationRadioButtonInputSelector = `[data-automation="${dataAutomation}-input"]`;
    const dataAutomationRadioButtonLabelSelector = `[data-automation="${dataAutomation}-label"]`;

    const CSS_CLASS_DIMENSION_NORMAL = 'ss-radio-button--normal';
    const CSS_CLASS_DIMENSION_SMALL = 'ss-radio-button--small';
    const CSS_CLASS_DIMENSION_TINY = 'ss-radio-button--tiny';

    const clickEvent: Event = new Event('click');

    const testDataDefaultValue = RADIO_BUTTON_DEFAULT_STATE.value;

    const getInputElement = () => de.query(By.css(dataAutomationRadioButtonInputSelector)).nativeElement;

    const getLabelElement = () => de.query(By.css(dataAutomationRadioButtonLabelSelector)).nativeElement;

    const getWrapper = () => document.querySelector(dataAutomationRadioButtonSelector);

    const getInputValue = () => getInputElement().checked;

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.radioButton[property] = value;
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
            RadioButtonComponent,
            RadioButtonTestComponent,
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
        fixture = TestBed.createComponent(RadioButtonTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(radioButtonComponentSelector));
        comp = de.componentInstance;
        testHostComp.defaultInputState.radio = RADIO_BUTTON_DEFAULT_STATE;
        testHostComp.setForm();
        fixture.detectChanges();
    });

    afterEach(() => testHostComp.formGroup.reset());

    it('should display Angular Forms injected value on the input', () => {
        testHostComp.formGroup.get(controlName).setValue(testDataDefaultValue);
        fixture.detectChanges();
        expect(comp.isChecked).toBeTruthy();
    });

    it('should change value when user clicks on input', () => {
        expect(getInputValue()).toBeFalsy();
        getInputElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(getInputValue()).toBeTruthy();
    });

    it('should trigger onInputSelect() when input is clicked and change the value', () => {
        spyOn(comp, 'onInputSelect').and.callThrough();
        getInputElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.onInputSelect).toHaveBeenCalled();
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        setDefaultInputStateProperty('value', testDataDefaultValue);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        expect(getInputValue()).toBeFalsy();
    });

    it('should have an height of 48px, 40px and 32 if the dimension is normal, small or tiny respectively', () => {
        const element: Element = getWrapper();

        setDefaultInputStateProperty('dimension', 'normal');
        fixture.detectChanges();
        expect(element.classList.contains(CSS_CLASS_DIMENSION_NORMAL));
        expect(element.clientHeight).toEqual(DIMENSIONS.base_dimension__x6);

        setDefaultInputStateProperty('dimension', 'small');
        fixture.detectChanges();
        expect(element.classList.contains(CSS_CLASS_DIMENSION_SMALL));
        expect(element.clientHeight).toEqual(DIMENSIONS.base_dimension__x5);

        setDefaultInputStateProperty('dimension', 'tiny');
        fixture.detectChanges();
        expect(element.classList.contains(CSS_CLASS_DIMENSION_TINY));
        expect(element.clientHeight).toEqual(DIMENSIONS.base_dimension__x4);
    });

    it('should change value when isChecked is sent from the outside', () => {
        testHostComp.defaultInputState.radioButton.isChecked = true;
        fixture.detectChanges();

        expect(getInputValue()).toBeTruthy();

        testHostComp.defaultInputState.radioButton.isChecked = false;
        fixture.detectChanges();

        expect(getInputValue()).toBeFalsy();
    });

    it('should bind input and it\'s label by id', () => {
        const {name, value} = RADIO_BUTTON_DEFAULT_STATE;
        const expectedValue = name + value;

        expect(getInputElement().id).toBe(getLabelElement().getAttribute('for'));
        expect(getInputElement().id).toBe(expectedValue);
    });
});
