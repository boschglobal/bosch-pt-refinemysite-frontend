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
    discardPeriodicTasks,
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

import {setEventKey} from '../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {GenericWarnings} from '../../../misc/validation/generic.warnings';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutDirective} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MenuItem} from '../../menus/menu-list/menu-list.component';
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
    AUTOCOMPLETE_ACTION_KEYS,
    InputAutocompleteComponent,
    SearchTypeInputAutocompleteEnum
} from './input-autocomplete.component';
import {
    INPUT_AUTOCOMPLETE_DEFAULT_STATE,
    InputAutocompleteTestComponent
} from './input-autocomplete.test.component';

describe('Input Autocomplete Component', () => {
    let testHostComp: InputAutocompleteTestComponent;
    let comp: InputAutocompleteComponent;
    let fixture: ComponentFixture<InputAutocompleteTestComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;

    const dataAutomation: string = INPUT_AUTOCOMPLETE_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_AUTOCOMPLETE_DEFAULT_STATE.controlName;

    const inputAutocompleteComponentSelector = 'ss-input-autocomplete';
    const dataAutomationInputAutocompleteSelector = `[data-automation="${dataAutomation}"]`;
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}-wrapper"]`;
    const dataAutomationInputLabelSelector = `[data-automation="${dataAutomation}-label"]`;
    const dataAutomationInputCharacterSelector = `[data-automation="${dataAutomation}-character-counter"]`;
    const dataAutomationInputInvalidLabelSelector = `[data-automation="${dataAutomation}-invalid"]`;

    const keyUpEvent: KeyboardEvent = new KeyboardEvent('keyup');
    const keyDownEvent: KeyboardEvent = new KeyboardEvent('keydown');
    const focusEvent: Event = new Event('focus');
    const blurEvent: Event = new Event('blur');

    const testDataEmptyString = '';
    const testDataShortString = 'foo';
    const testDataUntrimmedString = ' a ';
    const testDataErrorMessageKey = 'Generic_Error';

    const getInputElement = () => de.query(By.css(dataAutomationInputAutocompleteSelector)).nativeElement;

    const getInputValue = () => getInputElement().value;

    const getInputWrapperElement = () => de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;

    const getInputLabelElement = () => de.query(By.css(dataAutomationInputLabelSelector)).nativeElement;

    const getInputCharacterCounterDebugElement = () => de.query(By.css(dataAutomationInputCharacterSelector));

    const getInputInvalidLabelElement = () => de.query(By.css(dataAutomationInputInvalidLabelSelector)).nativeElement;

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.autocomplete[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            FormsModule,
            ReactiveFormsModule.withConfig({callSetDisabledState: 'whenDisabledForLegacyCode'}),
            TranslationModule,
        ],
        declarations: [
            InputAutocompleteComponent,
            InputAutocompleteTestComponent,
            FlyoutDirective,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(InputAutocompleteTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputAutocompleteComponentSelector));
        comp = de.componentInstance;
        flyoutService = TestBed.inject(FlyoutService);

        testHostComp.defaultInputState.autocomplete = Object.assign({}, INPUT_AUTOCOMPLETE_DEFAULT_STATE);
        testHostComp.setForm();
        resetFakeAsyncZone();
        fixture.detectChanges();
    });

    afterEach(() => {
        testHostComp.formGroup.reset();
        fixture.destroy();
    });

    it('should display default value on the input', (done) => {
        const expectedValue = testDataShortString;

        setDefaultInputStateProperty('value', expectedValue);
        testHostComp.setForm();
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should display Angular Forms injected value on the input', (done) => {
        const expectedValue = testDataShortString;

        testHostComp.formGroup.get(controlName).setValue(expectedValue);
        fixture.detectChanges();

        setTimeout(() => {
            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should set empty autocomplete when value is null', () => {
        comp.value = null;
        fixture.detectChanges();
        getInputElement().dispatchEvent(keyUpEvent);

        expect(comp.autocomplete).toBeFalsy();
    });

    it('should display user typed value on the input', (done) => {
        const expectedValue = testDataShortString;

        comp.value = expectedValue;
        fixture.detectChanges();
        getInputElement().dispatchEvent(keyUpEvent);

        setTimeout(() => {
            expect(getInputValue()).toBe(expectedValue);
            done();
        }, 1);
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataShortString);
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
        getInputElement().dispatchEvent(blurEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should render filled CSS class when input has content', () => {
        setDefaultInputStateProperty('value', testDataShortString);
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
        setDefaultInputStateProperty('label', 'autocomplete');
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();
        fixture.detectChanges();
        expect(getInputLabelElement().textContent).toContain('*');
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

    it('should show error message when input is invalid after is touched', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataEmptyString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(getInputInvalidLabelElement().textContent).toContain(testDataErrorMessageKey);
        discardPeriodicTasks();
    }));

    it('should render invalid CSS class when input is invalid', fakeAsync(() => {
        setDefaultInputStateProperty('value', testDataEmptyString);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        testHostComp.formGroup.get(controlName).markAsTouched();
        tick(DEFAULT_DEBOUNCE_TIME);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
        discardPeriodicTasks();
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
        discardPeriodicTasks();
    }));

    it('should focus input when setFocus is called', fakeAsync(() => {
        comp.setFocus();
        tick(DEFAULT_DEBOUNCE_TIME);

        fixture.detectChanges();
        expect(comp.input.nativeElement.focus).toBeTruthy();
    }));

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
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_WARNING);
    });

    it('should ignore the keyup events for action keys', () => {
        spyOn(comp, 'onInternalChangeCallback').and.callThrough();

        AUTOCOMPLETE_ACTION_KEYS.forEach(key => {
            setEventKey(keyUpEvent, key);
            comp.onInputKeyUp(keyUpEvent);
        });

        expect(comp.onInternalChangeCallback).not.toHaveBeenCalled();
    });

    it('should stop the propagation of keydown event for the not action keys', () => {
        spyOn(keyDownEvent, 'stopPropagation').and.callThrough();

        setEventKey(keyDownEvent, 'a');
        comp.onInputKeyDown(keyDownEvent);

        expect(keyDownEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should not stop the propagation of keydown event for action keys', () => {
        spyOn(keyDownEvent, 'stopPropagation').and.callThrough();

        AUTOCOMPLETE_ACTION_KEYS.forEach(key => {
            setEventKey(keyDownEvent, key);
            comp.onInputKeyDown(keyUpEvent);
        });

        expect(keyDownEvent.stopPropagation).not.toHaveBeenCalled();
    });

    it('should close the options flyout when Tab key is pressed', () => {
        spyOn(flyoutService, 'close').and.callThrough();

        setEventKey(keyDownEvent, KeyEnum.Tab);
        comp.onInputKeyDown(keyDownEvent);

        expect(flyoutService.close).toHaveBeenCalled();
    });

    it('should close the options flyout when Escape key is pressed', () => {
        spyOn(flyoutService, 'close').and.callThrough();

        setEventKey(keyDownEvent, KeyEnum.Escape);
        comp.onInputKeyDown(keyDownEvent);

        expect(flyoutService.close).toHaveBeenCalled();
    });

    it('should close the options flyout when Enter key is pressed', () => {
        spyOn(flyoutService, 'close').and.callThrough();

        setEventKey(keyUpEvent, KeyEnum.Enter);
        comp.onInputKeyUp(keyUpEvent);

        expect(flyoutService.close).toHaveBeenCalled();
    });

    it('should parse the list of options and create the options for the menu list', () => {
        const list = INPUT_AUTOCOMPLETE_DEFAULT_STATE.list;
        const expectedOptions: MenuItem[] = list.map(option => ({
            id: option,
            label: option,
            value: option,
            type: 'select',
            selected: false,

        }));

        comp.alwaysShowOptions = true;
        comp.onInputFocus(focusEvent);

        expect(comp.options).toEqual(expectedOptions);
    });

    it('should mark the option as selected when the list is opened and one of the options was already selected', () => {
        const list = INPUT_AUTOCOMPLETE_DEFAULT_STATE.list;
        const selectedOption = list[0];
        const expectedOptions: MenuItem[] = [{
            id: selectedOption,
            label: selectedOption,
            value: selectedOption,
            type: 'select',
            selected: true,

        }];

        comp.value = selectedOption;
        comp.alwaysShowOptions = true;
        comp.onInputFocus(focusEvent);

        expect(comp.options).toEqual(expectedOptions);
    });

    it('should set the active option when handleItemHovered is called with an option', () => {
        comp.alwaysShowOptions = true;
        comp.onInputFocus(focusEvent);

        const option = comp.options[0];

        comp.handleItemHovered(option);

        expect(comp.activeOption).toBe(option.value);
    });

    it('should unset the active option when handleItemHovered is called without an option', () => {
        comp.onInputFocus(focusEvent);

        const option = comp.options[0];

        comp.handleItemHovered(option);
        comp.handleItemHovered(null);

        expect(comp.activeOption).toBeNull();
    });

    it('should set the selected option when handleItemClicked is called', () => {
        comp.value = 'a';
        comp.list = ['aa', 'aaa', 'aaa'];

        getInputElement().dispatchEvent(focusEvent);
        comp.handleItemClicked(comp.list[0]);

        expect(comp.value).toBe(comp.list[0]);
    });

    it('should remove left and right white spaces from value', () => {
        const expectedValue = testDataUntrimmedString.trim();

        spyOn(comp, 'onChangeCallback');
        spyOn(comp.onChange, 'emit');

        setEventKey(keyUpEvent, '');

        comp.value = testDataUntrimmedString;
        comp.onInputKeyUp(keyUpEvent);

        expect(comp.onChangeCallback).toHaveBeenCalledWith(expectedValue);
        expect(comp.onChange.emit).toHaveBeenCalledWith(expectedValue);
    });

    it('should not define options when input list is empty', (done) => {
        comp.value = 'a';
        comp.list = [];
        getInputElement().dispatchEvent(focusEvent);

        setTimeout(() => {
            expect(comp.options.length).toBe(0);
            done();
        });
    });

    it('should limit possible options based on maxOptions input', () => {
        comp.value = 'a';
        comp.list = ['aa', 'aaa', 'aaaa', 'aaaaa', 'aaaaaa', 'aaaaaaa', 'aaaaaaaa', 'aaaaaaaaa'];
        comp.maxOptions = 2;
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.length).toBe(comp.maxOptions);
    });

    it(`should filter options with ${SearchTypeInputAutocompleteEnum.Begin} search type`, () => {
        comp.value = 'a';
        comp.list = ['aa', 'aaa', 'ba', 'baa'];
        comp.searchType = SearchTypeInputAutocompleteEnum.Begin;
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.length).toEqual(2);
    });

    it(`should filter options with ${SearchTypeInputAutocompleteEnum.Any} search type`, () => {
        comp.value = 'a';
        comp.list = ['bb', 'bba', 'ba', 'baa'];
        comp.searchType = SearchTypeInputAutocompleteEnum.Any;
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.length).toEqual(3);
    });

    it('should sort options list', () => {
        const list = ['ac', 'ab', 'aa'];
        const expectedResult = list.sort();

        comp.value = 'a';
        comp.list = list;
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.map(option => option.value)).toEqual(expectedResult);
    });

    it('should not sort options list', () => {
        const expectedResult = ['ac', 'ab', 'aa'];

        comp.value = 'a';
        comp.list = ['ac', 'ab', 'aa'];
        comp.sortList = false;
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.map(option => option.value)).toEqual(expectedResult);
    });

    it('should keep list options after option selection and after second input focus event', () => {
        comp.list = ['aa', 'aaa', 'aaaa'];

        comp.handleItemClicked(comp.list[0]);
        fixture.detectChanges();

        comp.onInputFocus(focusEvent);
        const initOptionsList = comp.options;
        fixture.detectChanges();

        comp.onInputFocus(focusEvent);
        fixture.detectChanges();

        expect(comp.options).toEqual(initOptionsList);
    });

    it('should not show options when input has no value and alwaysShowOptions is false', () => {
        comp.value = '';
        comp.list = ['bb', 'bbb', 'ba', 'baa'];

        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.length).toEqual(0);
    });

    it('should show all options when input has no value and alwaysShowOptions is true', () => {
        const options = ['a', 'b', 'c', 'd'];

        comp.value = '';
        comp.list = options;
        comp.alwaysShowOptions = true;

        getInputElement().dispatchEvent(focusEvent);

        expect(comp.options.map(option => option.value)).toEqual(options);
    });

    it('should close the options flyout when input value is empty and alwaysShowOptions is false', () => {
        spyOn(flyoutService, 'close');

        comp.value = '';
        comp.onInputKeyUp(keyUpEvent);

        expect(flyoutService.close).toHaveBeenCalled();
    });

    it('should not close the options flyout when input value is empty and alwaysShowOptions is true', () => {
        spyOn(flyoutService, 'close');

        comp.value = '';
        comp.alwaysShowOptions = true;
        comp.onInputKeyUp(keyUpEvent);

        expect(flyoutService.close).not.toHaveBeenCalled();
    });
});
