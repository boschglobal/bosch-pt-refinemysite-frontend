/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {setEventKey} from '../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {
    DatepickerDateFormatEnum,
    DatepickerMaskEnum,
    DatepickerPlaceholderEnum,
} from '../../../misc/enums/datepicker-date-format.enum';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {GenericValidators} from '../../../misc/validation/generic.validators';
import {TranslationModule} from '../../../translation/translation.module';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {UIModule} from '../../ui.module';
import {
    DatepickerCalendarSelectionTypeEnum,
    DateRange,
} from '../datepicker-calendar/datepicker-calendar.component';
import {
    CSS_CLASS_DISABLED,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_INVALID,
    CSS_CLASS_REQUIRED,
    CSS_CLASS_VALID,
} from '../input.base';
import {InputDatepickerComponent} from './input-datepicker.component';
import {
    INPUT_DATEPICKER_DEFAULT_STATE,
    InputDatepickerTestComponent
} from './input-datepicker.test.component';

describe('Input Datepicker Component', () => {
    let testHostComp: InputDatepickerTestComponent;
    let comp: InputDatepickerComponent;
    let fixture: ComponentFixture<InputDatepickerTestComponent>;
    let de: DebugElement;
    let translateService: TranslateServiceStub;
    let flyoutService: any;

    const defaultLanguage = 'en';
    const defaultDateFormat = DatepickerDateFormatEnum[defaultLanguage];
    const defaultInputPlaceholder = DatepickerPlaceholderEnum[defaultLanguage];
    const dataAutomation: string = INPUT_DATEPICKER_DEFAULT_STATE.automationAttr;
    const controlName: string = INPUT_DATEPICKER_DEFAULT_STATE.controlName;
    const inputDatepickerComponentSelector = 'ss-input-datepicker';
    const dataAutomationInputWrapperSelector = `[data-automation="${dataAutomation}"]`;

    const dataAutomationInputInvalidLabelSelector = `${dataAutomationInputWrapperSelector} [data-automation="invalid"]`;
    const dataAutomationInputCalendarToggleSelector = `${dataAutomationInputWrapperSelector} [data-automation="calendar-toggle"]`;
    const startDateRangeInputWrapperSelector = `[data-automation="range-input-wrapper-${DatepickerCalendarSelectionTypeEnum.StartDate}"]`;
    const endDateRangeInputWrapperSelector = `[data-automation="range-input-wrapper-${DatepickerCalendarSelectionTypeEnum.EndDate}"]`;
    const mouseDownEvent: Event = new Event('mousedown');
    const focusEvent: Event = new Event('focus');
    const keyDownEvent: KeyboardEvent = new KeyboardEvent('keydown');

    const testDataEmptyString = '';
    const testDataReferenceDate: moment.Moment = INPUT_DATEPICKER_DEFAULT_STATE.referenceDate;
    const testDataReferenceDateString: string = testDataReferenceDate.format(defaultDateFormat);
    const testDataErrorMessageKey = 'Generic_Error';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const getInputElement = (selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate): HTMLInputElement => {
        const selector = `${dataAutomationInputWrapperSelector} [data-automation="date-input-field-${selectionType}"]`;

        return de.query(By.css(selector))?.nativeElement;
    };

    const getSingleDateInputValue = () => getInputElement(DatepickerCalendarSelectionTypeEnum.SingleDate).value;

    const getStartDateInputValue = () => getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).value;

    const getEndDateInputValue = () => getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).value;

    const getInputWrapperElement = () => de.query(By.css(dataAutomationInputWrapperSelector)).nativeElement;

    const getInputLabelElement = (selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate): HTMLInputElement => {
        const selector = `${dataAutomationInputWrapperSelector} [data-automation="label-${selectionType}"]`;

        return de.query(By.css(selector))?.nativeElement;
    };

    const getInputInvalidLabelElement = () => de.query(By.css(dataAutomationInputInvalidLabelSelector)).nativeElement;

    const setDefaultInputStateProperty = (property: string, value: any) => {
        testHostComp.defaultInputState.datepicker[property] = value;
    };

    const moduleDef: TestModuleMetadata = {
        imports: [
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            FormsModule,
            ReactiveFormsModule.withConfig({callSetDisabledState: 'whenDisabledForLegacyCode'}),
            TranslationModule.forRoot(),
        ],
        declarations: [
            InputDatepickerTestComponent,
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
        fixture = TestBed.createComponent(InputDatepickerTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(inputDatepickerComponentSelector));
        comp = de.componentInstance;
        translateService = TestBed.inject<TranslateServiceStub>(TranslateService as any);
        flyoutService = TestBed.inject(FlyoutService);

        translateService.setDefaultLang(defaultLanguage);

        testHostComp.defaultInputState.datepicker = INPUT_DATEPICKER_DEFAULT_STATE;
        testHostComp.setForm();

        setDefaultInputStateProperty('value', null);
        setDefaultInputStateProperty('selectRange', false);
        fixture.detectChanges();
    });

    afterEach(() => {
        testHostComp.formGroup.reset();
        flyoutService.close(comp.flyoutId);
        fixture.destroy();
    });

    it('should display default value on the input', () => {
        const expectedValue: string = testDataReferenceDateString;

        setDefaultInputStateProperty('value', testDataReferenceDate);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(expectedValue);
        expect(comp.value).toBe(testDataReferenceDate);
    });

    it('should display Angular Forms injected value on the input', () => {
        const expectedValue: string = testDataReferenceDateString;

        testHostComp.formGroup.get(controlName).setValue(testDataReferenceDate);
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(expectedValue);
        expect(comp.value).toBe(testDataReferenceDate);
    });

    it('should clear the value for the control on the input when form is cleared', () => {
        const expectedValue: string = testDataEmptyString;

        setDefaultInputStateProperty('value', testDataReferenceDate);
        testHostComp.setForm();
        fixture.detectChanges();
        testHostComp.formGroup.reset();
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(expectedValue);
        expect(comp.value).toBeNull();
    });

    it('should render focus CSS class when input is focused', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should not render focus CSS class when clicking outside the datepicker', () => {
        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();

        document.dispatchEvent(mouseDownEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
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

    it('should render a wildcard (*) on the start date label when the start date is required', () => {
        setDefaultInputStateProperty('isRequiredStart', true);
        setDefaultInputStateProperty('isRequiredEnd', false);
        setDefaultInputStateProperty('selectRange', true);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.StartDate).textContent).toContain('*');
        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.EndDate).textContent).not.toContain('*');
    });

    it('should render a wildcard (*) on the end date label when the end date is required', () => {
        setDefaultInputStateProperty('isRequiredStart', false);
        setDefaultInputStateProperty('isRequiredEnd', true);
        setDefaultInputStateProperty('selectRange', true);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.StartDate).textContent).not.toContain('*');
        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.EndDate).textContent).toContain('*');
    });

    it('should render a wildcard (*) on the start and end date labels when both are required', () => {
        setDefaultInputStateProperty('isRequiredStart', true);
        setDefaultInputStateProperty('isRequiredEnd', true);
        setDefaultInputStateProperty('selectRange', true);
        testHostComp.setForm();
        fixture.detectChanges();

        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.StartDate).textContent).toContain('*');
        expect(getInputLabelElement(DatepickerCalendarSelectionTypeEnum.EndDate).textContent).toContain('*');
    });

    it('should show error message when input is invalid after is touched', () => {
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        document.dispatchEvent(mouseDownEvent);

        expect(getInputInvalidLabelElement().textContent).toContain(testDataErrorMessageKey);
    });

    it('should render invalid CSS class state when input is invalid', () => {
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        document.dispatchEvent(mouseDownEvent);

        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_INVALID);
    });

    it('should render valid CSS class when input is valid', () => {
        setDefaultInputStateProperty('value', testDataReferenceDate);
        setDefaultInputStateProperty('isRequired', true);
        setDefaultInputStateProperty('validators', [GenericValidators.isRequired(testDataErrorMessageKey)]);
        testHostComp.setForm();

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        document.dispatchEvent(mouseDownEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).toContain(CSS_CLASS_VALID);
    });

    it('should open calendar datepicker when the input is focused', () => {
        spyOn(comp, 'handleOpen');

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(comp.handleOpen).toHaveBeenCalled();
    });

    it('should close datepicker when clicking TAB key', () => {
        setEventKey(keyDownEvent, KeyEnum.Tab);

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        document.dispatchEvent(keyDownEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should close datepicker when clicking ESC key', () => {
        setEventKey(keyDownEvent, KeyEnum.Escape);

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        document.dispatchEvent(keyDownEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should close datepicker when pressing ENTER key', () => {
        setEventKey(keyDownEvent, KeyEnum.Enter);

        getInputElement().dispatchEvent(focusEvent);
        fixture.detectChanges();
        document.dispatchEvent(keyDownEvent);
        fixture.detectChanges();
        expect(getInputWrapperElement().classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should toggle open state of datepicker calendar', () => {
        spyOn(comp, 'handleOpen');
        spyOn(comp, 'handleClose');

        comp.handleToggleOpen();
        fixture.detectChanges();

        expect(comp.handleOpen).toHaveBeenCalled();

        comp.handleToggleOpen();
        fixture.detectChanges();

        expect(comp.handleClose).toHaveBeenCalled();
    });

    it('should stop propagation of the mousedown event when the toggle is clicked to close the datepicker calendar', () => {
        spyOn(mouseDownEvent, 'stopPropagation').and.callThrough();

        comp.handleToggleOpen();
        comp.handleMouseDown(mouseDownEvent);
        fixture.detectChanges();

        comp.handleToggleOpen();
        comp.handleMouseDown(mouseDownEvent);
        fixture.detectChanges();

        expect(mouseDownEvent.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('should set the mask and the date format on component ngOnInit', () => {
        const german = 'de';
        const english = 'en';
        const englishInputMark = DatepickerMaskEnum[english];
        const englishInputPlaceholder = DatepickerPlaceholderEnum[english];
        const germanInputMark = DatepickerMaskEnum[german];
        const germanInputPlaceholder = DatepickerPlaceholderEnum[german];

        expect(comp.inputMask).toBe(englishInputMark);
        expect(comp.inputPlaceholder).toBe(englishInputPlaceholder);

        translateService.defaultLang = german;
        comp.ngOnInit();

        expect(comp.inputMask).toBe(germanInputMark);
        expect(comp.inputPlaceholder).toBe(germanInputPlaceholder);
    });

    it('should display user selected value on the input', () => {
        const expectedValue: string = testDataReferenceDateString;

        comp.handleSelectDate(testDataReferenceDate);
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(expectedValue);
        expect(comp.value).toBe(testDataReferenceDate);
    });

    it('should change the input date when a valid date is present in the input', () => {
        const validDate = testDataReferenceDateString;
        const expectedDate = testDataReferenceDate;

        comp.handleFocus(DatepickerCalendarSelectionTypeEnum.SingleDate);
        comp.handleInputValueChange(validDate);

        expect(expectedDate.isSame(comp.value, 'd')).toBeTruthy();
    });

    it('should set the input date and the selected date to null when a empty placeholder is present in the input', () => {
        const emptyPlaceholder = defaultInputPlaceholder;

        comp.handleFocus(DatepickerCalendarSelectionTypeEnum.SingleDate);
        comp.handleInputValueChange(emptyPlaceholder);

        expect(comp.value).toBeNull();
        expect(comp.selection).toBeNull();
    });

    it('should set the selected date to null when a invalid date is present in the input', () => {
        const invalidDateString = '01/01/200y';

        comp.handleInputValueChange(invalidDateString);

        expect(comp.selection).toBeNull();
    });

    it('should call onInternalChangeCallback when selecting a day', (done) => {
        spyOn(comp, 'onInternalChangeCallback').and.callThrough();

        comp.handleSelectDate(testDataReferenceDate);
        fixture.detectChanges();

        setTimeout(() => {
            expect(comp.onInternalChangeCallback).toHaveBeenCalled();
            done();
        }, 1);
    });

    it('should call handleOpen when date picker is opened via Flyout service', () => {
        const expectedArgs = new MouseEvent('click');
        spyOn(comp, 'handleOpen');

        flyoutService.open(comp.flyoutId);

        expect(comp.handleOpen).toHaveBeenCalledWith(expectedArgs);
    });

    it('should focus on the SingleDate input when setFocus is called without params', fakeAsync(() => {
        spyOn(getInputElement(), 'focus').and.callThrough();

        comp.setFocus();
        tick(1);

        fixture.detectChanges();
        expect(getInputElement().focus).toHaveBeenCalled();
    }));

    it('should focus on the SingleDate input when setFocus is called with SingleDate as param', fakeAsync(() => {
        const selectionType = DatepickerCalendarSelectionTypeEnum.SingleDate;

        spyOn(getInputElement(selectionType), 'focus').and.callThrough();

        comp.setFocus(selectionType);
        tick(1);

        fixture.detectChanges();
        expect(getInputElement(selectionType).focus).toHaveBeenCalled();
    }));

    it('should focus on the StartDate input when setFocus is called with StartDate as param', fakeAsync(() => {
        const selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(getInputElement(selectionType), 'focus').and.callThrough();

        comp.setFocus(selectionType);
        tick(1);

        fixture.detectChanges();
        expect(getInputElement(selectionType).focus).toHaveBeenCalled();
    }));

    it('should focus on the EndDate input when setFocus is called with EndDate as param', fakeAsync(() => {
        const selectionType = DatepickerCalendarSelectionTypeEnum.EndDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(getInputElement(selectionType), 'focus').and.callThrough();

        comp.setFocus(selectionType);
        tick(1);

        fixture.detectChanges();
        expect(getInputElement(selectionType).focus).toHaveBeenCalled();
    }));

    it('should set focus on input when the calendar datepicker opens', fakeAsync(() => {
        spyOn(getInputElement(), 'focus').and.callThrough();

        comp.handleToggleOpen();
        tick(1);

        expect(getInputElement().focus).toHaveBeenCalled();
    }));

    it('should unset focus on input when the calendar datepicker closes', fakeAsync(() => {
        spyOn(getInputElement(), 'blur').and.callThrough();

        comp.handleToggleOpen();

        comp.handleToggleOpen();
        tick(1);

        expect(getInputElement().blur).toHaveBeenCalled();
    }));

    it('should show the calendar toggle when selecting single date', () => {
        setDefaultInputStateProperty('selectRange', false);
        fixture.detectChanges();

        expect(getElement(dataAutomationInputCalendarToggleSelector)).toBeTruthy();
    });

    it('should not show the calendar toggle when selecting a date range', () => {
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        expect(getElement(dataAutomationInputCalendarToggleSelector)).toBeFalsy();
    });

    it('should display the 2 range inputs when selectRange is true', () => {
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.SingleDate)).toBeFalsy();
        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate)).toBeTruthy();
        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate)).toBeTruthy();
    });

    it('should display the single input when selectRange is false', () => {
        setDefaultInputStateProperty('selectRange', false);
        fixture.detectChanges();

        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.SingleDate)).toBeTruthy();
        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate)).toBeFalsy();
        expect(getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate)).toBeFalsy();
    });

    it('should prevent the default behaviour of the Tab key when pressing it and the focus is on the start date input', () => {
        const selectionType = DatepickerCalendarSelectionTypeEnum.StartDate;

        spyOn(keyDownEvent, 'preventDefault').and.callThrough();
        setEventKey(keyDownEvent, KeyEnum.Tab);
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(selectionType).dispatchEvent(focusEvent);
        getInputElement(selectionType).dispatchEvent(keyDownEvent);

        expect(keyDownEvent.preventDefault).toHaveBeenCalled();
    });

    it('should set focus on end date input when pressing the Tab key and the focus is on the start date input', fakeAsync(() => {
        const startDateSelectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        const endDateSelectionType = DatepickerCalendarSelectionTypeEnum.EndDate;

        setEventKey(keyDownEvent, KeyEnum.Tab);
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(getInputElement(endDateSelectionType), 'focus').and.callThrough();

        getInputElement(startDateSelectionType).dispatchEvent(focusEvent);
        getInputElement(startDateSelectionType).dispatchEvent(keyDownEvent);
        tick(1);

        expect(getInputElement(endDateSelectionType).focus).toHaveBeenCalled();
    }));

    it('should set focus on end date input when pressing the Enter key and the focus is on the start date input', fakeAsync(() => {
        const startDateSelectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        const endDateSelectionType = DatepickerCalendarSelectionTypeEnum.EndDate;

        setEventKey(keyDownEvent, KeyEnum.Enter);
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(getInputElement(endDateSelectionType), 'focus').and.callThrough();

        getInputElement(startDateSelectionType).dispatchEvent(focusEvent);
        getInputElement(startDateSelectionType).dispatchEvent(keyDownEvent);
        tick(1);

        expect(getInputElement(endDateSelectionType).focus).toHaveBeenCalled();
    }));

    it('should set focus on end date input after selecting the start date', fakeAsync(() => {
        const startDateSelectionType = DatepickerCalendarSelectionTypeEnum.StartDate;
        const endDateSelectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        const selection: DateRange = {
            start: testDataReferenceDate.clone(),
            end: null,
        };

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(getInputElement(endDateSelectionType), 'focus').and.callThrough();

        getInputElement(startDateSelectionType).dispatchEvent(focusEvent);
        comp.handleSelectDate(selection);
        tick(1);

        expect(getInputElement(endDateSelectionType).focus).toHaveBeenCalled();
    }));

    it('should close the datepicker calendar after selecting the end date', () => {
        const endDateSelectionType = DatepickerCalendarSelectionTypeEnum.EndDate;
        const selection: DateRange = {
            start: testDataReferenceDate.clone(),
            end: testDataReferenceDate.clone().add(1, 'd'),
        };

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        spyOn(flyoutService, 'close').and.callThrough();

        getInputElement(endDateSelectionType).dispatchEvent(focusEvent);
        comp.handleSelectDate(selection);

        expect(flyoutService.close).toHaveBeenCalled();
    });

    it('should add ss-input--focused class to the start date input when that input is focused', () => {
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getElement(startDateRangeInputWrapperSelector).classList).toContain(CSS_CLASS_FOCUSED);
        expect(getElement(endDateRangeInputWrapperSelector).classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should add ss-input--focused class to the end date input when that input is focused', () => {
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        fixture.detectChanges();

        expect(getElement(startDateRangeInputWrapperSelector).classList).not.toContain(CSS_CLASS_FOCUSED);
        expect(getElement(endDateRangeInputWrapperSelector).classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should set isFocused to true when the input is focused and is selecting a single date', () => {
        getInputElement().dispatchEvent(focusEvent);

        expect(comp.isFocused).toBeTruthy();
    });

    it('should set isFocused to false when the input loses focus and is selecting a single date', () => {
        getInputElement().dispatchEvent(focusEvent);

        comp.handleToggleOpen();

        expect(comp.isFocused).toBeFalsy();
    });

    it('should set isFocused to false when the input is focused and is selecting a date range', () => {
        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);

        expect(comp.isFocused).toBeFalsy();
    });

    it('should set the current selection to the selected date when it is a valid date and is selecting a single date', () => {
        const selection = testDataReferenceDate;

        comp.handleSelectDate(selection);

        expect(comp.selection).toBe(selection);
    });

    it('should set the current selection to null when the provided date is invalid and is selecting a single date', () => {
        const selection = moment('01/01/200y', defaultDateFormat, true);

        comp.handleSelectDate(selection);

        expect(comp.selection).toBeNull();
    });

    it('should set the current selection to the selected range when both the start and the end date are valid', () => {
        const selection: DateRange = {
            start: testDataReferenceDate.clone(),
            end: testDataReferenceDate.clone().add(1, 'd'),
        };

        comp.handleSelectDate(selection);

        expect(comp.selection).toEqual(selection);
    });

    it('should set the current selection to only the start date when the end date is invalid', () => {
        const selection: DateRange = {
            start: testDataReferenceDate.clone(),
            end: moment('01/01/200y', defaultDateFormat, true),
        };
        const expectedSelection: DateRange = {
            start: testDataReferenceDate.clone(),
            end: null,
        };

        comp.handleSelectDate(selection);

        expect(comp.selection).toEqual(expectedSelection);
    });

    it('should set the current selection to only the end date when the start date is invalid', () => {
        const selection: DateRange = {
            start: moment('01/01/200y', defaultDateFormat, true),
            end: testDataReferenceDate.clone(),
        };
        const expectedSelection: DateRange = {
            start: null,
            end: testDataReferenceDate.clone(),
        };

        comp.handleSelectDate(selection);

        expect(comp.selection).toEqual(expectedSelection);
    });

    it('should set the current selection to null when both the start and the end date are invalid', () => {
        const selection: DateRange = {
            start: moment('01/01/200y', defaultDateFormat, true),
            end: moment('01/01/200y', defaultDateFormat, true),
        };
        const expectedSelection: DateRange = {
            start: null,
            end: null,
        };

        comp.handleSelectDate(selection);

        expect(comp.selection).toEqual(expectedSelection);
    });

    it('should display the formatted date on the input when selecting a single date from the calendar', () => {
        const selection = testDataReferenceDate;
        const formattedSelection = testDataReferenceDateString;

        comp.handleSelectDate(selection);
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(formattedSelection);
    });

    it('should display the formatted start date on the input when selecting a date range from the calendar ' +
        'and not having a end date', () => {
        const selection: DateRange = {
            start: testDataReferenceDate,
            end: null,
        };
        setDefaultInputStateProperty('selectRange', true);
        comp.handleSelectDate(selection);
        fixture.detectChanges();

        expect(getStartDateInputValue()).toBe(testDataReferenceDateString);
        expect(getEndDateInputValue()).toBeFalsy();
    });

    it('should display the formatted end date on the input when selecting a date range from the calendar ' +
        'and not having a start date', () => {
        const selection: DateRange = {
            start: null,
            end: testDataReferenceDate,
        };

        setDefaultInputStateProperty('selectRange', true);
        comp.handleSelectDate(selection);
        fixture.detectChanges();

        expect(getStartDateInputValue()).toBeFalsy();
        expect(getEndDateInputValue()).toBe(testDataReferenceDateString);
    });

    it('should display the typed date on the input when typing a single date', () => {
        const typedValue = testDataReferenceDateString;

        getInputElement().dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(getSingleDateInputValue()).toBe(typedValue);
    });

    it('should display the date range on the inputs when typing an start date on the input and not having an end date yet', () => {
        const typedValue = testDataReferenceDateString;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(getStartDateInputValue()).toBe(testDataReferenceDateString);
        expect(getEndDateInputValue()).toBeFalsy();
    });

    it('should display the date range on the inputs when typing an end date on the input and not having an start date yet', () => {
        const typedValue = testDataReferenceDateString;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(getStartDateInputValue()).toBeFalsy();
        expect(getEndDateInputValue()).toBe(testDataReferenceDateString);
    });

    it('should display the date range on the inputs when typing an start date on the input and having an end date already', () => {
        const typedValue = testDataReferenceDateString;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(getStartDateInputValue()).toBe(testDataReferenceDateString);
        expect(getEndDateInputValue()).toBe(testDataReferenceDateString);
    });

    it('should display the date range on the inputs when typing an end date on the input and having an start date already', () => {
        const typedValue = testDataReferenceDateString;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);

        fixture.detectChanges();

        expect(getStartDateInputValue()).toBe(testDataReferenceDateString);
        expect(getEndDateInputValue()).toBe(testDataReferenceDateString);
    });

    it('should set the input value as a single date when typing a single date', () => {
        const typedValue = testDataReferenceDateString;

        getInputElement().dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(testDataReferenceDate.isSame(comp.value, 'd')).toBeTruthy();
    });

    it('should set the input value as a date range with only start date when typing the start date and the end date is empty', () => {
        const typedValue = testDataReferenceDateString;
        const expectedStartDate = testDataReferenceDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(expectedStartDate.isSame(comp.value.start, 'd')).toBeTruthy();
        expect(comp.value.end).toBeNull();
    });

    it('should set the input value as a date range with only end date when typing the end date and the start date is empty', () => {
        const typedValue = testDataReferenceDateString;
        const expectedEndDate = testDataReferenceDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(comp.value.start).toBeNull();
        expect(expectedEndDate.isSame(comp.value.end, 'd')).toBeTruthy();
    });

    it('should set the input value as a date range with both the start and the end date when typing ' +
        'the end date and the start date already exists', () => {
        const typedValue = testDataReferenceDateString;
        const expectedDate = testDataReferenceDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(expectedDate.isSame(comp.value.start, 'd')).toBeTruthy();
        expect(expectedDate.isSame(comp.value.end, 'd')).toBeTruthy();

    });

    it('should set the input value as a date range with both the start and the end date when typing ' +
        'the start date and the end date already exists', () => {
        const typedValue = testDataReferenceDateString;
        const expectedDate = testDataReferenceDate;

        setDefaultInputStateProperty('selectRange', true);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.EndDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        getInputElement(DatepickerCalendarSelectionTypeEnum.StartDate).dispatchEvent(focusEvent);
        comp.handleInputValueChange(typedValue);
        fixture.detectChanges();

        expect(expectedDate.isSame(comp.value.start, 'd')).toBeTruthy();
        expect(expectedDate.isSame(comp.value.end, 'd')).toBeTruthy();
    });
});
