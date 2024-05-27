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
import {cloneDeep} from 'lodash';

import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../translation/translation.module';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {CheckboxButtonComponent} from './checkbox-button.component';
import {
    CHECKBOX_BUTTON_DEFAULT_STATE,
    CheckboxButtonTestComponent
} from './checkbox-button.test.component';

describe('Checkbox Button Component', () => {
    let testHostComp: CheckboxButtonTestComponent;
    let comp: CheckboxButtonComponent;
    let fixture: ComponentFixture<CheckboxButtonTestComponent>;
    let de: DebugElement;

    const dataAutomation: string = CHECKBOX_BUTTON_DEFAULT_STATE.automationAttr;
    const controlName: string = CHECKBOX_BUTTON_DEFAULT_STATE.controlName;
    const checkboxButtonComponentSelector = 'ss-checkbox-button';
    const dataAutomationCheckboxButtonWrapper = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationCheckboxButtonSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationCheckboxSquare = `[data-automation="${dataAutomation}-checkbox"]`;

    const CSS_CLASS_DIMENSION_NORMAL = 'ss-checkbox-button--normal';
    const CSS_CLASS_DIMENSION_SMALL = 'ss-checkbox-button--small';
    const CSS_CLASS_DIMENSION_TINY = 'ss-checkbox-button--tiny';
    const CSS_CLASS_CHECKED = 'ss-checkbox-button--checked';

    const clickEvent: Event = new Event('click');

    const testDataDefaultValue = true;

    const getInputElement = () => de.query(By.css(dataAutomationCheckboxButtonSelector)).nativeElement;

    const getWrapper = () => document.querySelector(dataAutomationCheckboxButtonWrapper);

    const getInputValue = () => getInputElement().checked;

    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;

    const getCheckboxSquareElement = (): HTMLElement => de.query(By.css(dataAutomationCheckboxSquare)).nativeElement;

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.checkbox[property] = value;
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
            CheckboxButtonComponent,
            CheckboxButtonTestComponent,
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
        fixture = TestBed.createComponent(CheckboxButtonTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(checkboxButtonComponentSelector));
        comp = de.componentInstance;
        testHostComp.defaultInputState.checkbox = cloneDeep(CHECKBOX_BUTTON_DEFAULT_STATE);
        testHostComp.setForm();
        fixture.detectChanges();
    });

    afterEach(() => testHostComp.formGroup.reset());

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
        testHostComp.setForm();
        testHostComp.formGroup.get(controlName).setValue(false);
        expect(getInputValue()).toBeFalsy();
        getInputLabelElement().click();
        expect(getInputValue()).toBeTruthy();
    });

    it('should trigger onInputChange() when input is clicked', () => {
        spyOn(comp, 'onInputChange').and.callThrough();
        getInputElement().dispatchEvent(clickEvent);
        fixture.detectChanges();
        expect(comp.onInputChange).toHaveBeenCalled();
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        testHostComp.setForm();
        fixture.detectChanges();
        getInputElement().dispatchEvent(clickEvent);
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        expect(getInputValue()).toBeFalsy();
    });

    it('should update isDisabled when input changes', () => {
        setDefaultInputStateProperty('value', testDataDefaultValue);
        testHostComp.setForm();
        testHostComp.defaultInputState.checkbox.isDisabled = true;
        fixture.detectChanges();

        expect(comp.isDisabled).toBeTruthy();
    });

    it('should update isIndeterminate when input changes', () => {
        setDefaultInputStateProperty('value', testDataDefaultValue);
        testHostComp.setForm();
        testHostComp.defaultInputState.checkbox.isIndeterminate = true;
        fixture.detectChanges();

        expect(comp.isIndeterminate).toBeTruthy();
    });

    it('should update isChecked and control value when value input changes', () => {
        setDefaultInputStateProperty('value', true);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(comp.isChecked).toBeTruthy();
        expect(comp.control.value).toBeTruthy();

        setDefaultInputStateProperty('value', false);
        fixture.detectChanges();

        expect(comp.isChecked).toBeFalsy();
        expect(comp.control.value).toBeFalsy();
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

    it('should set property ID from name input if ID input is not provided', () => {
        setDefaultInputStateProperty('id', null);
        testHostComp.setForm();

        comp.ngOnInit();

        fixture.detectChanges();

        expect(getInputElement().getAttribute('id')).toBe(CHECKBOX_BUTTON_DEFAULT_STATE.name);
    });

    it('should update checkbox icon and update base element CSS classes when form control value changes', () => {
        testHostComp.formGroup.get(controlName).setValue(true);
        expect(getCheckboxSquareElement().children.length).toBe(1);
        expect(getWrapper().classList.contains(CSS_CLASS_CHECKED)).toBeTruthy();

        testHostComp.formGroup.get(controlName).setValue(false);
        expect(getCheckboxSquareElement().children.length).toBe(0);
        expect(getWrapper().classList.contains(CSS_CLASS_CHECKED)).toBeFalsy();
    });
});
