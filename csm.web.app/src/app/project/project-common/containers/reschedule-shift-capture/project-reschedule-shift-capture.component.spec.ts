/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {TranslationModule} from '../../../../shared/translation/translation.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {
    PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE,
    ProjectRescheduleShiftCaptureComponent,
    ProjectRescheduleShiftFormData,
} from './project-reschedule-shift-capture.component';

describe('Project Reschedule Shift Capture Component', () => {
    let comp: ProjectRescheduleShiftCaptureComponent;
    let fixture: ComponentFixture<ProjectRescheduleShiftCaptureComponent>;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
        ],
        declarations: [
            ProjectRescheduleShiftCaptureComponent,
        ],
        providers: [],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectRescheduleShiftCaptureComponent);
        comp = fixture.componentInstance;

        comp.form.setValue(PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE);

        comp.ngOnInit();
    });

    it('should set the form value based on the default value when they are provided', () => {
        const newFormValue: ProjectRescheduleShiftFormData = {
            unit: 'weeks',
            amount: 10,
        };

        comp.defaultValues = newFormValue;

        expect(comp.form.value).toEqual(newFormValue);
    });

    it('should set the inputLabel to "Generic_Weeks" when unit is set to "weeks"', () => {
        comp.inputLabel = 'Generic_Days';

        comp.form.controls.unit.setValue('weeks');

        expect(comp.inputLabel).toBe('Generic_Weeks');
    });

    it('should set the inputLabel to "Generic_Days" when unit is set to "days"', () => {
        comp.form.controls.unit.setValue('weeks');
        comp.form.controls.unit.setValue('days');

        expect(comp.inputLabel).toBe('Generic_Days');
    });

    it('should consider the form as value when a positive shift amount is set', () => {
        comp.form.controls.amount.setValue(10);

        expect(comp.form.valid).toBeTruthy();
    });

    it('should consider the form as value when a negative shift amount is set', () => {
        comp.form.controls.amount.setValue(-10);

        expect(comp.form.valid).toBeTruthy();
    });

    it('should consider the form as invalid when a decimal shift amount is set', () => {
        comp.form.controls.amount.setValue(10.1);

        expect(comp.form.valid).toBeFalsy();
    });

    it('should consider the form as invalid when a zero shift amount is set', () => {
        comp.form.controls.amount.setValue(0);

        expect(comp.form.valid).toBeFalsy();
    });

    it('should consider the form as invalid when a empty shift amount is set', () => {
        comp.form.controls.amount.setValue(null);

        expect(comp.form.valid).toBeFalsy();
    });

    it('should emit formValidityChanged with true when the form value changed to valid', () => {
        comp.form.controls.amount.setValue(0);

        spyOn(comp.formValidityChanged, 'emit');

        comp.form.controls.amount.setValue(1);

        expect(comp.formValidityChanged.emit).toHaveBeenCalledWith(true);
    });

    it('should emit formValidityChanged with false when the form value changed to invalid', () => {
        comp.form.controls.amount.setValue(1);

        spyOn(comp.formValidityChanged, 'emit');

        comp.form.controls.amount.setValue(0);

        expect(comp.formValidityChanged.emit).toHaveBeenCalledWith(false);
    });

    it('should emit valueChanged when the form value changed', () => {
        const expectedValue: ProjectRescheduleShiftFormData = {
            unit: 'days',
            amount: 100,
        };

        spyOn(comp.valueChanged, 'emit');

        comp.form.controls.amount.setValue(expectedValue.amount);
        comp.form.controls.unit.setValue(expectedValue.unit);

        expect(comp.valueChanged.emit).toHaveBeenCalledWith(expectedValue);
    });
});
