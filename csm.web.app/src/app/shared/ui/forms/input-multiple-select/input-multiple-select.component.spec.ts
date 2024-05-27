/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    DebugElement,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import {flatMapDeep} from 'lodash';

import {setEventKey} from '../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {
    Chip,
    ChipComponent,
} from '../../chips/chip/chip.component';
import {FlyoutDirective} from '../../flyout/directive/flyout.directive';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {UIModule} from '../../ui.module';
import {CheckboxButtonComponent} from '../checkbox-button/checkbox-button.component';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FILLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_REQUIRED,
} from '../input.base';
import {
    InputCheckboxNestedComponent,
    InputCheckboxNestedOption,
} from '../input-checkbox-nested/input-checkbox-nested.component';
import {
    INPUT_MULTIPLE_SELECT_ALL_OPTION,
    InputMultipleSelectComponent,
    InputMultipleSelectOption,
} from './input-multiple-select.component';
import {
    INPUT_MULTIPLE_SELECT_DEFAULT_STATE,
    InputMultipleSelectTestComponent,
} from './input-multiple-select.test.component';

describe('Input Multiple Select Component', () => {
    let component: InputMultipleSelectComponent;
    let testHostComp: InputMultipleSelectTestComponent;
    let fixture: ComponentFixture<InputMultipleSelectTestComponent>;
    let de: DebugElement;
    let flyoutService: FlyoutService;
    let changeDetectorRef: ChangeDetectorRef;

    const inputMultipleSelectComponentSelector = 'ss-input-multiple-select';
    const dataAutomationInputCheckboxNestedOptionSelector = '[data-automation="input-checkbox-nested-option"]';
    const dataAutomationInputMultipleSelectInputContentSelector = '[data-automation="ss-input-multiple-select-input-content"]';
    const dataAutomationInputMultipleSelectInputSearchInputSelector = '[data-automation="ss-input-multiple-select-input-search-input"]';
    const dataAutomationInputMultipleSelectSelector = `[data-automation=${INPUT_MULTIPLE_SELECT_DEFAULT_STATE.automationAttr}]`;
    const dataAutomationInputMultipleSelectLabelSelector = `[data-automation=${INPUT_MULTIPLE_SELECT_DEFAULT_STATE.automationAttr}-label]`;
    const getDataAutomationInputNestedOptionsCheckbox = (id: string) => `[data-automation="input-checkbox-nested-option--${id}"]`;

    const getElement = (selector: string) => de.query(By.css(selector)).nativeElement;
    const getDocumentElement = (selector: string) => document.querySelector(selector);
    const getAllDocumentElements = (selector: string) => document.querySelectorAll(selector);
    const getInputContentElement = () => getElement(dataAutomationInputMultipleSelectInputContentSelector);
    const getInputMultipleSelectElement = () => getElement(dataAutomationInputMultipleSelectSelector);
    const openOptionsFlyout = () => getElement(dataAutomationInputMultipleSelectInputContentSelector).dispatchEvent(clickEvent);
    const setDefaultInputStateProperty = (property: string, value: any) => testHostComp.defaultInputState[property] = value;

    const clickEvent = new Event('click');
    const blurEvent: Event = new Event('blur');
    const keyDownEvent: KeyboardEvent = new KeyboardEvent('keydown');

    const controlName = INPUT_MULTIPLE_SELECT_DEFAULT_STATE.controlName;

    const defaultOptions: InputMultipleSelectOption[] = [{
        id: 'bosch-gmbh', text: 'Bosch gmbH', groupText: 'My company', children: [
            {
                id: 'ali-albatros', text: 'Ali Alabatros',
            },
            {
                id: 'benjamin-boston', text: 'Benjamin Boston',
            },
            {
                id: 'caroline-kripix', text: 'Caroline Kripix',
            },
        ],
    }];
    const baseOption = defaultOptions[0];
    const childOption = baseOption.children[0];

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            TranslationModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ChipComponent,
            CheckboxButtonComponent,
            FlyoutDirective,
            InputCheckboxNestedComponent,
            InputMultipleSelectComponent,
            InputMultipleSelectTestComponent,
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
        fixture = TestBed.createComponent(InputMultipleSelectTestComponent);
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputMultipleSelectComponentSelector));
        component = de.componentInstance;

        flyoutService = TestBed.inject(FlyoutService);

        testHostComp.defaultInputState = Object.assign({}, INPUT_MULTIPLE_SELECT_DEFAULT_STATE, {options: defaultOptions});
        testHostComp.setForm();

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should display default input empty state', () => {
        setDefaultInputStateProperty('value', []);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(component.isFilled).toBeFalsy();
    });

    it('should focus on search input when wrapper component is clicked', () => {
        getInputContentElement().dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(component.isFocused).toBeTruthy();
        expect(document.activeElement).toBe(getElement(dataAutomationInputMultipleSelectInputSearchInputSelector));
    });

    it('should render focus CSS class when input is focused', () => {
        getInputContentElement().dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(component.isFocused).toBeTruthy();
        expect(getInputMultipleSelectElement().classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should render blur CSS class when input is blurred', () => {
        component.isFocused = true;
        fixture.detectChanges();

        getElement(dataAutomationInputMultipleSelectInputSearchInputSelector).dispatchEvent(blurEvent);

        fixture.detectChanges();

        expect(getInputMultipleSelectElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should render filled CSS class when input has content', () => {
        const selectedOptions = [childOption.id];
        setDefaultInputStateProperty('value', selectedOptions);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(component.isFilled).toBeTruthy();
        expect(getInputMultipleSelectElement().classList).toContain(CSS_CLASS_FILLED);
    });

    it('should render filled CSS class when search input has value', () => {
        expect(component.isFilled).toBeFalsy();

        component.searchInputControl.setValue('a');

        fixture.detectChanges();

        expect(component.isFilled).toBeTruthy();
        expect(getInputMultipleSelectElement().classList).toContain(CSS_CLASS_FILLED);
    });

    it('should not render filled CSS class when search input has no value', () => {
        expect(component.isFilled).toBeFalsy();

        component.searchInputControl.setValue('');

        fixture.detectChanges();

        expect(component.isFilled).toBeFalsy();
        expect(getInputMultipleSelectElement().classList).not.toContain(CSS_CLASS_FILLED);
    });

    it('should render disabled CSS class when isDisabled property is passed in', () => {
        setDefaultInputStateProperty('isDisabled', true);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(getInputMultipleSelectElement().classList).toContain(CSS_CLASS_DISABLED);
    });

    it('should render required CSS class when isRequired property is passed in', () => {
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(getInputMultipleSelectElement().classList).toContain(CSS_CLASS_REQUIRED);
    });

    it('should render a wildcard (*) on the label when the input is required', () => {
        setDefaultInputStateProperty('label', 'text');
        setDefaultInputStateProperty('isRequired', true);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(getElement(dataAutomationInputMultipleSelectLabelSelector).textContent).toContain('*');
    });

    it('should set chip list with the current selected options', () => {
        const selectedOptions = baseOption.children.filter(option => option.id !== childOption.id).map(option => option.id);
        setDefaultInputStateProperty('value', selectedOptions);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(component.selectedChipList.length).toEqual(selectedOptions.length);
        selectedOptions.forEach(optionId => {
            expect(component.selectedChipList.some(chip => chip.id === optionId)).toBeTruthy();
        });
    });

    it('should set chip list with parent option when all child options are checked', () => {
        const selectedOptions = baseOption.children.map(option => option.id);
        setDefaultInputStateProperty('value', selectedOptions);
        testHostComp.setForm();

        fixture.detectChanges();

        expect(component.selectedChipList.length).toEqual(1);
        expect(component.selectedChipList.some(chip => chip.id === baseOption.id)).toBeTruthy();
    });

    it('should open options flyout and display correct option list', () => {
        const recursive = (option: any) => [option, flatMapDeep(option.children, recursive)];
        const flatOptions = flatMapDeep(defaultOptions, recursive);

        openOptionsFlyout();

        flatOptions.forEach(option => {
            const optionSelector = getDataAutomationInputNestedOptionsCheckbox(option.id);
            expect(getDocumentElement(optionSelector)).not.toBeNull();
        });
    });

    it('should update chip list and form values after selecting a option', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();
        const option: InputCheckboxNestedOption = {id: childOption.id, text: childOption.text, value: true};
        const expectedFormValue = [option.id];

        component.optionsFlyoutModel.properties['optionValueChanged'].emit(option);

        expect(component.isFilled).toBeTruthy();
        expect(component.selectedChipList.length).toEqual(1);
        expect(component.selectedChipList.some(chip => chip.id === option.id)).toBeTruthy();
        expect(testHostComp.formGroup.get(controlName).value).toEqual(expectedFormValue);
        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should update chip list and form values after removing a chip', () => {
        const selectedOptionsIds = baseOption.children.filter(option => option.id !== childOption.id).map(option => option.id);
        const chipToRemove: Chip = {id: selectedOptionsIds[0], text: 'foo'};
        const expectedFormValue = selectedOptionsIds.filter(optionId => optionId !== chipToRemove.id);

        setDefaultInputStateProperty('value', selectedOptionsIds);
        testHostComp.setForm();

        fixture.detectChanges();

        component.handleChipRemove(chipToRemove);

        expect(component.selectedChipList.length).toEqual(expectedFormValue.length);
        expect(testHostComp.formGroup.get(controlName).value).toEqual(expectedFormValue);
    });

    it('should handle options flyout state for search input events', () => {
        spyOn(flyoutService.openEvents, 'next').and.callThrough();
        spyOn(flyoutService.closeEvents, 'next').and.callThrough();

        component.searchInputControl.setValue('a');

        fixture.detectChanges();

        expect(flyoutService.openEvents.next).toHaveBeenCalledWith(component.optionsFlyoutModel.id);
        expect(flyoutService.closeEvents.next).not.toHaveBeenCalledWith(component.optionsFlyoutModel.id);

        component.searchInputControl.setValue('al');

        fixture.detectChanges();

        expect(flyoutService.closeEvents.next).not.toHaveBeenCalledWith(component.optionsFlyoutModel.id);

        component.searchInputControl.setValue('foooo');

        fixture.detectChanges();

        expect(flyoutService.closeEvents.next).toHaveBeenCalledWith(component.optionsFlyoutModel.id);
    });

    it('should add Select All option to options list if input hasSelectAllOption is set to true', () => {
        const optionSelector = getDataAutomationInputNestedOptionsCheckbox(INPUT_MULTIPLE_SELECT_ALL_OPTION.id);

        setDefaultInputStateProperty('hasSelectAllOption', true);

        fixture.detectChanges();

        setDefaultInputStateProperty('options', [...defaultOptions]);

        fixture.detectChanges();

        openOptionsFlyout();

        expect(getDocumentElement(optionSelector)).not.toBeNull();
    });

    it('should filter options displayed in flyout by search input field value and reset options after ' +
        'empty search input field value', () => {
        const recursive = (option: any) => [option, flatMapDeep(option.children, recursive)];
        const flatOptions = flatMapDeep(defaultOptions, recursive);
        const optionSelector = getDataAutomationInputNestedOptionsCheckbox(childOption.id);

        openOptionsFlyout();

        expect(getAllDocumentElements(dataAutomationInputCheckboxNestedOptionSelector).length).toEqual(flatOptions.length);

        component.searchInputControl.setValue('alaba');

        fixture.detectChanges();

        expect(getDocumentElement(optionSelector)).not.toBeNull();
        expect(getAllDocumentElements(dataAutomationInputCheckboxNestedOptionSelector).length).toEqual(1);

        component.searchInputControl.setValue('');

        fixture.detectChanges();
        expect(getAllDocumentElements(dataAutomationInputCheckboxNestedOptionSelector).length).toEqual(flatOptions.length);
    });

    it('should reset search input, close options flyout, add option to chip list and update form value after ' +
        'option filtering and selection', () => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();
        const expectedFormValue = [childOption.id];
        const option: InputCheckboxNestedOption = {id: childOption.id, text: childOption.text, value: true};

        openOptionsFlyout();

        fixture.detectChanges();

        component.searchInputControl.setValue('a');

        fixture.detectChanges();

        spyOn(flyoutService.closeEvents, 'next').and.callThrough();

        component.optionsFlyoutModel.properties['optionValueChanged'].emit(option);

        fixture.detectChanges();

        expect(flyoutService.closeEvents.next).toHaveBeenCalledWith(component.optionsFlyoutModel.id);
        expect(component.searchInputControl.value).toEqual('');
        expect(component.selectedChipList.length).toEqual(1);
        expect(component.selectedChipList.some(chip => chip.id === option.id)).toBeTruthy();
        expect(testHostComp.formGroup.get(controlName).value).toEqual(expectedFormValue);
        expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should clear the value for the form control when form is reset', () => {
        const selectedOptionsIds = [childOption.id];

        setDefaultInputStateProperty('value', selectedOptionsIds);

        testHostComp.setForm();

        fixture.detectChanges();

        expect(component.selectedChipList.length).toBe(selectedOptionsIds.length);

        testHostComp.formGroup.reset();

        fixture.detectChanges();

        expect(component.selectedChipList.length).toBe(0);
    });

    it('should update options flyout id if name input is defined', () => {
        const inputName = 'foo';
        const expectedResult = `ssInputMultipleSelect-${inputName}`;
        setDefaultInputStateProperty('name', inputName);

        testHostComp.setForm();

        fixture.detectChanges();

        component.ngOnInit();

        expect(component.optionsFlyoutModel.id).toEqual(expectedResult);
    });

    it('should not update options flyout id if name input is not defined', () => {
        expect(component.optionsFlyoutModel.id).toBe('ssInputMultipleSelect');
    });

    it('should preventDefault Event only on keyboard \'Enter\' key on the search input', () => {
        const spy = spyOn(keyDownEvent, 'preventDefault');
        const searchInputElement = getElement(dataAutomationInputMultipleSelectInputSearchInputSelector);

        setEventKey(keyDownEvent, KeyEnum.Enter);

        searchInputElement.dispatchEvent(keyDownEvent);

        expect(keyDownEvent.preventDefault).toHaveBeenCalled();

        spy.calls.reset();

        setEventKey(keyDownEvent, KeyEnum.Control);

        searchInputElement.dispatchEvent(keyDownEvent);

        expect(keyDownEvent.preventDefault).not.toHaveBeenCalled();
    });
});
