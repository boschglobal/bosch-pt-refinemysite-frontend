/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
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
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {TranslateServiceStub} from '../../../../../../../test/stubs/translate-service.stub';
import {WeekDaysEnum} from '../../../../../../shared/misc/enums/weekDays.enum';
import {TranslationModule} from '../../../../../../shared/translation/translation.module';
import {DateHelper} from '../../../../../../shared/ui/dates/date.helper.service';
import {UIModule} from '../../../../../../shared/ui/ui.module';
import {ProjectDateLocaleHelper} from '../../../../../project-common/helpers/project-date-locale.helper.service';
import {
    WORKING_DAYS_FORM_DEFAULT_VALUE,
    WorkingDaysCaptureComponent,
    WorkingDaysFormData
} from './working-days-capture.component';

describe('Working Days Capture Component', () => {
    let component: WorkingDaysCaptureComponent;
    let fixture: ComponentFixture<WorkingDaysCaptureComponent>;
    let de: DebugElement;
    let el: HTMLElement;

    const projectDateLocaleHelperMock = mock(ProjectDateLocaleHelper);

    const referenceDate = moment();

    const clickEvent: Event = new Event('click');

    const dataAutomationSelectorSaveChange = '[data-automation="saveChange"]';

    const moduleDef: TestModuleMetadata = {
        imports: [
            FormsModule,
            ReactiveFormsModule,
            UIModule,
            BrowserModule,
            BrowserAnimationsModule,
            TranslationModule,
        ],
        declarations: [WorkingDaysCaptureComponent],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
            {
                provide: ProjectDateLocaleHelper,
                useValue: instance(projectDateLocaleHelperMock),
            },
        ],
    };

    when(projectDateLocaleHelperMock.getMomentByLang()).thenReturn(referenceDate);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(async () => {
        fixture = TestBed.createComponent(WorkingDaysCaptureComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        fixture.detectChanges();
    });

    it('it should set working days form with the correct default values', () => {
        expect(component.form.value).toEqual(WORKING_DAYS_FORM_DEFAULT_VALUE);
    });

    it('should set a new form value when defaultValues input is provided', () => {
        const defaultValues: WorkingDaysFormData = {
            startOfWeek: WeekDaysEnum.MONDAY,
            workingDays: {
                [WeekDaysEnum.SUNDAY]: false,
                [WeekDaysEnum.MONDAY]: true,
                [WeekDaysEnum.TUESDAY]: true,
                [WeekDaysEnum.WEDNESDAY]: true,
                [WeekDaysEnum.THURSDAY]: true,
                [WeekDaysEnum.FRIDAY]: true,
                [WeekDaysEnum.SATURDAY]: false,
            },
        };

        component.defaultValue = defaultValues;

        expect(component.form.value).toEqual(defaultValues);
    });

    it('should set with default form value when defaultValues input is not provided', () => {
        component.defaultValue = null;

        expect(component.form.value).toEqual(WORKING_DAYS_FORM_DEFAULT_VALUE);
    });

    it('should call handleSaveChange when click save', () => {
        spyOn(component, 'handleSaveChange').and.callThrough();

        el.querySelector(dataAutomationSelectorSaveChange).dispatchEvent(clickEvent);

        expect(component.handleSaveChange).toHaveBeenCalled();
    });

    it('should emit value change when handleSaveChange is called', () => {
        spyOn(component.submitForm, 'emit').and.callThrough();

        component.handleSaveChange();

        expect(component.submitForm.emit).toHaveBeenCalledWith(WORKING_DAYS_FORM_DEFAULT_VALUE);
    });

    it('should generate startOfWeekOptions and workingDaysOptions with the correct value, order and label '
        + 'for each week day', () => {
        const weekDaysSorted: WeekDaysEnum[] = [
            WeekDaysEnum.SUNDAY,
            WeekDaysEnum.MONDAY,
            WeekDaysEnum.TUESDAY,
            WeekDaysEnum.WEDNESDAY,
            WeekDaysEnum.THURSDAY,
            WeekDaysEnum.FRIDAY,
            WeekDaysEnum.SATURDAY,
        ];

        const options = weekDaysSorted.map(value => ({
            value,
            label: referenceDate.clone().day(DateHelper.getWeekDayMomentNumber(value)).format('dddd'),
        }));

        const startOfWeekOptionsExpectedResult = [...options];
        const workingDaysOptionsExpectedResult = [...options];

        component.ngOnInit();

        expect(component.startOfWeekOptions).toEqual(startOfWeekOptionsExpectedResult);
        expect(component.workingDaysOptions).toEqual(workingDaysOptionsExpectedResult);
    });
});
