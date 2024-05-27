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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import {
    flatten,
    isEqual,
} from 'lodash';

import {setEventKey} from '../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MenuItem} from '../../menus/menu-list/menu-list.component';
import {UIModule} from '../../ui.module';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID
} from '../input.base';
import {
    INPUT_SELECT_DROPDOWN_CHECK_ALL_ID,
    INPUT_SELECT_DROPDOWN_CLEAR_ID,
    InputSelectDropdownComponent,
    SelectOption,
    SelectOptionGroup,
} from './input-select-dropdown.component';
import {
    INPUT_SELECT_DEFAULT_OPTION_GROUPS,
    INPUT_SELECT_DEFAULT_OPTIONS,
    INPUT_SELECT_DEFAULT_STATE,
    InputSelectDropdownTestComponent
} from './input-select-dropdown.test.component';

describe('Input Select Dropdown Component', () => {
    let testHostComp: InputSelectDropdownTestComponent;
    let comp: InputSelectDropdownComponent;
    let fixture: ComponentFixture<InputSelectDropdownTestComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;

    const dataAutomation: string = INPUT_SELECT_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_SELECT_DEFAULT_STATE.controlName;
    const inputSelectDropdownComponentSelector = 'ss-input-select-dropdown';
    const dataAutomationInputSelectDropdownSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputToggleSelector = `[data-automation="${dataAutomation}-toggle"]`;
    const dataAutomationInputInvalidLabelSelector = `[data-automation="${dataAutomation}-invalid"]`;
    const dataAutomationInputCustomOptionSelector = `[data-automation="custom-option"]`;
    const dataAutomationInputDisplayOptionSelector = `[data-automation="${dataAutomation}-display-option"]`;
    const dataAutomationInputDisplayOptionLabelSelector = `[data-automation="${dataAutomation}-display-option-label"]`;
    const clickEvent: Event = new Event('click');
    const mouseDownEvent: Event = new Event('mousedown');
    const mouseupEvent: Event = new Event('mouseup');
    const focusEvent: Event = new Event('focus');
    const keydownEvent: KeyboardEvent = new KeyboardEvent('keydown', {bubbles: true});

    const testDataFirstOption: SelectOption = INPUT_SELECT_DEFAULT_OPTIONS[0];
    const testDataSecondOption: SelectOption = INPUT_SELECT_DEFAULT_OPTIONS[1];
    const testDataEmptyString = '';
    const testDataErrorMessageKey = 'Generic_Error';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const getInputElement = () => de.query(By.css(dataAutomationInputSelectDropdownSelector)).nativeElement;

    const getInputValue = () => getInputElement().value;

    const getInputWrapperElement = () => de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;

    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;

    const getInputInvalidLabelElement = () => de.query(By.css(dataAutomationInputInvalidLabelSelector)).nativeElement;

    const getInputDisplayOptionsElements = () => de.queryAll(By.css(dataAutomationInputDisplayOptionSelector));

    const getInputDisplayOptionLabelsElements = () => de.queryAll(By.css(dataAutomationInputDisplayOptionLabelSelector));

    const getInputCustomDisplayOptionsElements = () => de.queryAll(By.css(dataAutomationInputCustomOptionSelector));

    const getFlattenItems = (): MenuItem[] => flatten(comp.itemsList.map(({items}) => items));

    const getItemById = (id: string): MenuItem => getFlattenItems().find(item => item.id === id);

    const getItemByValue = (value: any): MenuItem => getFlattenItems().find(item => isEqual(item.value, value));

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.selectDropdown[property] = value;
    };

    const openDropdown = () => getInputElement().dispatchEvent(clickEvent);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            FormsModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            InputSelectDropdownTestComponent,
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
        fixture = TestBed.createComponent(InputSelectDropdownTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputSelectDropdownComponentSelector));
        comp = de.componentInstance;
        flyoutService = TestBed.inject(FlyoutService);

        testHostComp.useOptionTemplate = false;
        testHostComp.defaultInputState.selectDropdown = Object.assign({}, INPUT_SELECT_DEFAULT_STATE);
        testHostComp.setForm();

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should display default value on the input', () => {
        const expectedValue = testDataFirstOption.label;

        setDefaultInputStateProperty('value', testDataFirstOption.value);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should display Angular Forms injected value on the input', () => {
        const expectedValue = testDataFirstOption.label;

        testHostComp.formGroup.get(controlName).setValue(testDataFirstOption.value);
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should display Angular Forms injected value on the input (multiple enabled)', () => {
        const expectedValue = testDataFirstOption.label;

        setDefaultInputStateProperty('value', [2]);
        setDefaultInputStateProperty('multiple', true);
        fixture.detectChanges();
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.get(controlName).setValue([testDataFirstOption.value]);
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should display user selected value for the control on the input', () => {
        const expectedValue = testDataFirstOption.label;

        comp.handleItemClicked(getItemByValue(testDataFirstOption.value));
        fixture.detectChanges();

        expect(getInputValue()).toBe(expectedValue);
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataFirstOption.value);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();
        expect(getInputValue()).toBe(expectedValue);
    });

    it('should render focus CSS class when input is focused', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should render blur CSS class when input is blurred', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        document.dispatchEvent(mouseupEvent);
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
        });
    });

    it('should render filled CSS class when input has content', () => {
        setDefaultInputStateProperty('value', testDataFirstOption.value);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FILLED);
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        setDefaultInputStateProperty('isDisabled', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render disabled CSS class when isDisabled property is injected by Angular Forms', () => {
        testHostComp.formGroup.get(controlName).disable();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render required CSS class when isRequired property is passed in', () => {
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_REQUIRED);
    });

    it('should render a wildcard (*) on the label when the input is required', () => {
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputLabelElement().textContent).toContain('*');
    });

    it('should show error message when input is invalid after is touched', () => {
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();
        fixture.detectChanges();

        testHostComp.formGroup.get(controlName).setValue('');
        testHostComp.formGroup.get(controlName).markAsTouched();
        fixture.detectChanges();
        expect(getInputInvalidLabelElement().textContent).toContain(testDataErrorMessageKey);
    });

    it('should render invalid CSS class when input is invalid', (done) => {
        setEventKey(keydownEvent, KeyEnum.Escape);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();
        fixture.detectChanges();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(keydownEvent);
        fixture.detectChanges();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
        done();
    });

    it('should render valid CSS class when input is valid', (done) => {
        setEventKey(keydownEvent, KeyEnum.Escape);
        setDefaultInputStateProperty('value', testDataFirstOption.value);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();
        fixture.detectChanges();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        getInputElement().dispatchEvent(keydownEvent);
        fixture.detectChanges();
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
        done();
    });

    it('should render custom display option when optionTemplate is provided', () => {
        testHostComp.useOptionTemplate = true;
        setDefaultInputStateProperty('value', testDataFirstOption.value);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputDisplayOptionsElements().length).toBe(1);
        expect(getInputCustomDisplayOptionsElements().length).toBe(1);
    });

    it('should render option label when optionTemplate is provided and options have labels', () => {
        testHostComp.useOptionTemplate = true;
        setDefaultInputStateProperty('value', testDataFirstOption.value);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputDisplayOptionLabelsElements().length).toBe(1);
    });

    it('should not render option label when optionTemplate is provided and options doesn\'t have labels', () => {
        const optionsWithoutLabels = INPUT_SELECT_DEFAULT_OPTIONS.map(option => ({...option, label: undefined}));

        testHostComp.useOptionTemplate = true;
        setDefaultInputStateProperty('value', testDataFirstOption.value);
        setDefaultInputStateProperty('options', optionsWithoutLabels);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputDisplayOptionLabelsElements().length).toBe(0);
    });

    it('should render custom display option per each selected option when optionTemplate is provided', () => {
        const value = [testDataFirstOption.value, testDataSecondOption.value];

        testHostComp.useOptionTemplate = true;
        fixture.detectChanges();

        setDefaultInputStateProperty('multiple', true);
        setDefaultInputStateProperty('value', value);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputDisplayOptionsElements().length).toBe(value.length);
        expect(getInputCustomDisplayOptionsElements().length).toBe(value.length);
    });

    it('should not render custom display options for null values', () => {
        testHostComp.useOptionTemplate = true;
        setDefaultInputStateProperty('value', null);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputDisplayOptionsElements().length).toBe(0);
        expect(getInputCustomDisplayOptionsElements().length).toBe(0);
    });

    it('should clear selected option when clicking in clear option', (done) => {
        const expectedValue = testDataEmptyString;

        comp.handleItemClicked(getItemByValue(testDataFirstOption.value));
        fixture.detectChanges();

        expect(getInputValue()).toBe(testDataFirstOption.label);

        openDropdown();

        setTimeout(() => {
            comp.handleItemClicked(getItemById(INPUT_SELECT_DROPDOWN_CLEAR_ID));
            fixture.detectChanges();

            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should select all options when clicking in select all option', (done) => {
        const expectedValue = INPUT_SELECT_DEFAULT_OPTIONS.map((option: SelectOption) => option.label).join(', ');

        setDefaultInputStateProperty('multiple', true);
        comp.value = [];
        fixture.detectChanges();

        openDropdown();

        const checkAllItem = getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID);

        expect(checkAllItem.selected).toBeFalsy();

        setTimeout(() => {
            checkAllItem.selected = true;
            comp.handleItemClicked(checkAllItem);
            fixture.detectChanges();

            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should unselect all options when clicking in select all option and all the options are selected', (done) => {
        setDefaultInputStateProperty('multiple', true);
        comp.value = INPUT_SELECT_DEFAULT_OPTIONS.map(option => option.value);
        fixture.detectChanges();

        openDropdown();

        const checkAllItem = getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID);

        expect(checkAllItem.selected).toBeTruthy();

        setTimeout(() => {
            checkAllItem.selected = false;
            comp.handleItemClicked(checkAllItem);
            fixture.detectChanges();

            expect(getInputValue()).toBe('');
            done();
        }, 1);
    });

    it('should unselect an option that was previously selected when clicking in that option', (done) => {
        const unselectOption = INPUT_SELECT_DEFAULT_OPTIONS[0];
        const expectedAllValue = INPUT_SELECT_DEFAULT_OPTIONS.map((option: SelectOption) => option.label).join(', ');
        const expectedValue = INPUT_SELECT_DEFAULT_OPTIONS.slice(1).map((option: SelectOption) => option.label).join(', ');

        setDefaultInputStateProperty('multiple', true);
        comp.value = INPUT_SELECT_DEFAULT_OPTIONS.map(option => option.value);
        fixture.detectChanges();

        openDropdown();

        setTimeout(() => {
            expect(getInputValue()).toBe(expectedAllValue);

            comp.handleItemClicked(getItemByValue(unselectOption.value));
            fixture.detectChanges();

            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should select the check all option when the only unselected option is clicked', (done) => {
        const unselectOption = INPUT_SELECT_DEFAULT_OPTIONS[0];
        const selectedOptions = INPUT_SELECT_DEFAULT_OPTIONS.slice(1);

        setDefaultInputStateProperty('multiple', true);
        comp.value = selectedOptions.map(option => option.value);
        fixture.detectChanges();

        openDropdown();

        setTimeout(() => {
            expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID).selected).toBeFalsy();

            comp.handleItemClicked(getItemByValue(unselectOption.value));
            fixture.detectChanges();

            expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID).selected).toBeTruthy();
            done();
        }, 1);
    });

    it('should unselect the check all option when all options are selected and one is clicked', (done) => {
        const unselectOption = INPUT_SELECT_DEFAULT_OPTIONS[0];

        setDefaultInputStateProperty('multiple', true);
        comp.value = INPUT_SELECT_DEFAULT_OPTIONS.map(option => option.value);
        fixture.detectChanges();

        openDropdown();

        setTimeout(() => {
            expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID).selected).toBeTruthy();

            comp.handleItemClicked(getItemByValue(unselectOption.value));
            fixture.detectChanges();

            expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID).selected).toBeFalsy();
            done();
        }, 1);
    });

    it('should be able to select more that one option when multiple is enabled', () => {
        const expectedValue = [INPUT_SELECT_DEFAULT_OPTIONS[0].value, INPUT_SELECT_DEFAULT_OPTIONS[1].value];

        setDefaultInputStateProperty('multiple', true);
        fixture.detectChanges();
        comp.value = [];
        comp.isOpened = true;
        fixture.detectChanges();

        comp.handleItemClicked(getItemByValue(INPUT_SELECT_DEFAULT_OPTIONS[0].value));
        comp.handleItemClicked(getItemByValue(INPUT_SELECT_DEFAULT_OPTIONS[1].value));
        fixture.detectChanges();

        expect(comp.value).toEqual(expectedValue);
    });

    it('should close dropdown when TAB key is pressed', (done) => {
        spyOn(flyoutService, 'close');
        setEventKey(keydownEvent, KeyEnum.Tab);

        openDropdown();

        setTimeout(() => {
            getInputElement().dispatchEvent(keydownEvent);
            fixture.detectChanges();
            expect(flyoutService.close).toHaveBeenCalledWith(comp.flyoutId);
            done();
        }, 1);
    });

    it('should close dropdown when ESC key is pressed', (done) => {
        spyOn(flyoutService, 'close');
        setEventKey(keydownEvent, KeyEnum.Escape);

        openDropdown();

        setTimeout(() => {
            getInputElement().dispatchEvent(keydownEvent);
            fixture.detectChanges();
            expect(flyoutService.close).toHaveBeenCalledWith(comp.flyoutId);
            done();
        }, 1);
    });

    it('should toggle open state of the dropdown', () => {
        getElement(dataAutomationInputToggleSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.isOpened).toBe(true);

        getElement(dataAutomationInputToggleSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.isOpened).toBe(false);
    });

    it('should stop propagation of the mousedown event when the toggle is clicked to close the dropdown', () => {
        spyOn(mouseDownEvent, 'stopPropagation').and.callThrough();

        getElement(dataAutomationInputToggleSelector).dispatchEvent(mouseDownEvent);
        getElement(dataAutomationInputToggleSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(comp.isOpened).toBe(true);

        getElement(dataAutomationInputToggleSelector).dispatchEvent(mouseDownEvent);
        getElement(dataAutomationInputToggleSelector).dispatchEvent(clickEvent);
        fixture.detectChanges();

        expect(mouseDownEvent.stopPropagation).toHaveBeenCalledTimes(1);
        expect(comp.isOpened).toBe(false);
    });

    it('should focus input when setFocus is called', fakeAsync(() => {
        comp.setFocus();
        tick(1);

        fixture.detectChanges();
        expect(comp.input.nativeElement.focus).toBeTruthy();
    }));

    it('should set itemsList with multiple lists when options with multiple lists are provided', () => {
        setDefaultInputStateProperty('options', INPUT_SELECT_DEFAULT_OPTION_GROUPS);
        setDefaultInputStateProperty('multiple', false);
        setDefaultInputStateProperty('emptyOptionMessageKey', undefined);
        fixture.detectChanges();

        expect(comp.itemsList.length).toBe(INPUT_SELECT_DEFAULT_OPTION_GROUPS.length);
    });

    it('should set itemsList with separator when the an option group is provided with a separator', () => {
        const optionGroups: SelectOptionGroup[] = [
            {
                separator: true,
                options: [{value: 1, label: 'a'}],
            },
            {
                options: [{value: 1, label: 'a'}],
            },
        ];

        setDefaultInputStateProperty('options', optionGroups);
        setDefaultInputStateProperty('multiple', false);
        setDefaultInputStateProperty('emptyOptionMessageKey', undefined);
        fixture.detectChanges();

        expect(comp.itemsList.length).toBe(optionGroups.length);
        expect(comp.itemsList[0].separator).toBeTruthy();
        expect(comp.itemsList[1].separator).toBeFalsy();
    });

    it('should add check all option when multiple is enable', () => {
        setDefaultInputStateProperty('multiple', true);
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID)).toBeTruthy();
    });

    it('should not add check all option when multiple is disable', () => {
        setDefaultInputStateProperty('multiple', false);
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID)).toBeFalsy();
    });

    it('should not add check all option when multiple is enable but an empty list of options is provided', () => {
        setDefaultInputStateProperty('multiple', true);
        setDefaultInputStateProperty('options', []);
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CHECK_ALL_ID)).toBeFalsy();
    });

    it('should add clear option when translation key is set and multiple is disable', () => {
        setDefaultInputStateProperty('multiple', false);
        setDefaultInputStateProperty('emptyOptionMessageKey', 'Key');
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CLEAR_ID)).toBeTruthy();
    });

    it('should not add clear option when translation key is set and multiple is enable', () => {
        setDefaultInputStateProperty('multiple', true);
        setDefaultInputStateProperty('emptyOptionMessageKey', 'Key');
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CLEAR_ID)).toBeFalsy();
    });

    it('should not add clear option when translation key is not set and multiple is disable', () => {
        setDefaultInputStateProperty('multiple', false);
        setDefaultInputStateProperty('emptyOptionMessageKey', undefined);
        fixture.detectChanges();

        expect(getItemById(INPUT_SELECT_DROPDOWN_CLEAR_ID)).toBeFalsy();
    });
});
