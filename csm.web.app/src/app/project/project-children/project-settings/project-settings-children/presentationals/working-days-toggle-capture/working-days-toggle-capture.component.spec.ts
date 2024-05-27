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
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MOCK_WORK_DAYS} from '../../../../../../../test/mocks/workdays';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {
    WORK_ON_NON_WORKING_DAYS_DEFAULT_VALUE,
    WorkingDaysToggleCaptureComponent
} from './working-days-toggle-capture.component';

describe('Working Days Toggle Capture Component', () => {
    let component: WorkingDaysToggleCaptureComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let fixture: ComponentFixture<WorkingDaysToggleCaptureComponent>;

    const switchEvent: Event = new Event('onSwitch');

    const dataAutomationSelectorToggle = '[data-automation="toggle"]';

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
            WorkingDaysToggleCaptureComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(WorkingDaysToggleCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        fixture.detectChanges();
    });

    it('it should set toggle form with the correct default values', () => {
        expect(component.form.value).toEqual(WORK_ON_NON_WORKING_DAYS_DEFAULT_VALUE);
    });

    it('should set a new form value when defaultValues input is provided', () => {
        const defaultValue = {allowWorkOnNonWorkingDays: true};

        component.defaultValue = defaultValue;

        expect(component.form.value).toEqual(defaultValue);
    });

    it('should call handleSwitch when toggle event is triggered', () => {
        spyOn(component, 'handleSwitch').and.callThrough();

        el.querySelector(dataAutomationSelectorToggle).dispatchEvent(switchEvent);

        expect(component.handleSwitch).toHaveBeenCalled();
    });

    it('should emit value change when handleWorkOnNonWorkingDaysChange is called', () => {
        spyOn(component.handleWorkOnNonWorkingDaysChange, 'emit').and.callThrough();

        const allowWorkOnNonWorkingDays = MOCK_WORK_DAYS.allowWorkOnNonWorkingDays;

        component.defaultValue = {allowWorkOnNonWorkingDays};
        component.handleSwitch(allowWorkOnNonWorkingDays);

        expect(component.handleWorkOnNonWorkingDaysChange.emit).toHaveBeenCalledWith(allowWorkOnNonWorkingDays);
    });
});
