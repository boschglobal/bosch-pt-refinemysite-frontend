/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
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
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';

import {MOCK_WORK_DAYS} from '../../../../../../../test/mocks/workdays';
import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {
    WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE,
    WorkingDaysHolidayCaptureComponent,
    WorkingDaysHolidayFormData
} from './working-days-holiday-capture.component';

describe('Working Days Holiday Capture Component', () => {
    let component: WorkingDaysHolidayCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let fixture: ComponentFixture<WorkingDaysHolidayCaptureComponent>;

    const clickEvent: Event = new Event('click');
    const dataAutomationSaveButton = '[data-automation="save"]';
    const dataAutomationCancelButton = '[data-automation="cancel"]';

    const validDefaultValues: WorkingDaysHolidayFormData = {
        name: 'Test',
        date: moment('2023-04-19'),
    };

    const getElement = <T extends HTMLElement>(selector: string): T => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            FormsModule,
            ReactiveFormsModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule.forRoot(),
        ],
        declarations: [
            WorkingDaysHolidayCaptureComponent,
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

    beforeEach(async () => {
        fixture = TestBed.createComponent(WorkingDaysHolidayCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        component.holidays = MOCK_WORK_DAYS.holidays;

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('it should set working days holiday form with the correct default values', () => {
        component.defaultValue = null;

        expect(component.form.value).toEqual(WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE);
    });

    it('should set a new form value when defaultValues input is provided', () => {
        component.defaultValue = validDefaultValues;

        expect(component.form.value).toEqual(validDefaultValues);
    });

    it('should call the name input setFocus when set a form', () => {
        spyOn(component.nameInput, 'setFocus');

        component.defaultValue = validDefaultValues;

        expect(component.nameInput.setFocus).toHaveBeenCalled();
    });

    it('should call handleSubmit when submit button is clicked', () => {
        spyOn(component, 'handleSubmit').and.callThrough();

        el.querySelector(dataAutomationSaveButton).dispatchEvent(clickEvent);

        expect(component.handleSubmit).toHaveBeenCalled();
    });

    it('should call handleCancel when cancel button is clicked', () => {
        spyOn(component, 'handleCancel').and.callThrough();

        el.querySelector(dataAutomationCancelButton).dispatchEvent(clickEvent);

        expect(component.handleCancel).toHaveBeenCalled();
    });

    it('should emit value change when submitWorkingDaysHoliday is called', () => {
        spyOn(component.submitWorkingDaysHoliday, 'emit').and.callThrough();

        component.defaultValue = validDefaultValues;
        component.handleSubmit();

        expect(component.submitWorkingDaysHoliday.emit).toHaveBeenCalledWith(validDefaultValues);
    });

    it('should emit cancel model when cancelWorkingDaysHoliday is called', () => {
        spyOn(component.cancelWorkingDaysHoliday, 'emit').and.callThrough();

        component.handleCancel();

        expect(component.cancelWorkingDaysHoliday.emit).toHaveBeenCalled();
    });

    it('should return true when the form status changed to valid values', () => {
        component.defaultValue = validDefaultValues;

        expect(component.isFormValid()).toBeTruthy();
    });

    it('should return false when the form status changed to invalid values', () => {
        component.defaultValue = WORKING_DAYS_HOLIDAY_FORM_DEFAULT_VALUE;

        expect(component.isFormValid()).toBeFalsy();
    });

    it('should not disabled submit button when form is valid', () => {
        component.defaultValue = validDefaultValues;

        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(dataAutomationSaveButton).disabled).toBeFalsy();
    });

    it('should disabled submit button when form is not valid', () => {
        component.defaultValue = null;

        fixture.detectChanges();

        expect(getElement<HTMLButtonElement>(dataAutomationSaveButton).disabled).toBeTruthy();
    });

    it(`should set submit button label with 'Generic_Create' when mode input is provided with${CaptureModeEnum.create}`, () => {
        component.mode = CaptureModeEnum.create;
        expect(component.submitButtonLabel).toBe('Generic_Create');
    });

    it(`should set submit button label with 'Generic_Update' when mode input is provided with${CaptureModeEnum.update}`, () => {
        component.mode = CaptureModeEnum.update;
        expect(component.submitButtonLabel).toBe('Generic_Update');
    });

    it('should return valid false when form value is not equals to initial value and as the same values of one element of ' +
        'holiday list', () => {
        component.defaultValue = null;

        component.form.setValue({
            name: MOCK_WORK_DAYS.holidays[0].name,
            date: moment(MOCK_WORK_DAYS.holidays[0].date),
        });

        expect(component.form.valid).toBe(false);
    });

    it('should return valid true when form value is equals to initial value and as the same values of one element of holiday list', () => {
        const value = {
            name: MOCK_WORK_DAYS.holidays[0].name,
            date: moment(MOCK_WORK_DAYS.holidays[0].date),
        };

        component.defaultValue = value;
        component.form.setValue(value);

        expect(component.form.valid).toBe(true);
    });

    it('should return valid true when when form value is not equals to initial value and is different from the ' +
        'ones in holidays list', () => {
        component.defaultValue = null;

        component.form.setValue({
            name: 'Test',
            date: moment(),
        });

        expect(component.form.valid).toBe(true);
    });

    it('should call updateValueAndValidity of form control date when name value changes to verify if form values are ' +
        'still different from the ones in holidays list', () => {
        component.defaultValue = {
            name: 'Test',
            date: moment(MOCK_WORK_DAYS.holidays[0].date),
        };

        expect(component.form.valid).toBe(true);

        spyOn(component.form.controls.date, 'updateValueAndValidity').and.callThrough();

        component.form.controls.name.setValue(MOCK_WORK_DAYS.holidays[0].name);

        expect(component.form.controls.date.updateValueAndValidity).toHaveBeenCalled();
        expect(component.form.valid).toBe(false);
    });

    it('should not call updateValueAndValidity of form control name when date value does not change', () => {
        component.defaultValue = {
            name: 'Test',
            date: validDefaultValues.date,
        };

        spyOn(component.form.controls.name, 'updateValueAndValidity').and.callThrough();

        component.form.controls.date.setValue(validDefaultValues.date);

        expect(component.form.controls.name.updateValueAndValidity).not.toHaveBeenCalled();
    });

    it('should call updateValueAndValidity of form control name when date value changes to verify if form values are ' +
        'still different from the ones in holidays list', () => {
        component.defaultValue = {
            name: MOCK_WORK_DAYS.holidays[0].name,
            date: moment('2000-01-01'),
        };

        expect(component.form.valid).toBe(true);

        spyOn(component.form.controls.name, 'updateValueAndValidity').and.callThrough();

        component.form.controls.date.setValue(moment(MOCK_WORK_DAYS.holidays[0].date));

        expect(component.form.controls.name.updateValueAndValidity).toHaveBeenCalled();
        expect(component.form.valid).toBe(false);
    });
});
