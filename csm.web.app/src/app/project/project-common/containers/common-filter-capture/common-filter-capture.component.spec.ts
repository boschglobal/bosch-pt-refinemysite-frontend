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
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {
    BrowserModule,
    By
} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Store} from '@ngrx/store';
import * as moment from 'moment/moment';
import {BehaviorSubject} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {MOCK_WORKAREA_A} from '../../../../../test/mocks/workareas';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {DateRange} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {InputMultipleSelectOption} from '../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {UIModule} from '../../../../shared/ui/ui.module';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MILESTONE_UUID_HEADER} from '../../constants/milestone.constant';
import {WORKAREA_UUID_EMPTY} from '../../constants/workarea.constant';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';
import {
    CommonFilterCaptureComponent,
    CommonFilterFormData,
    CommonFilterFormDataParsed,
} from './common-filter-capture.component';

describe('Common Filter Capture Component', () => {
    let fixture: ComponentFixture<CommonFilterCaptureComponent>;
    let comp: CommonFilterCaptureComponent;
    let store: jasmine.SpyObj<Store>;
    let de: DebugElement;

    const workareaQueriesMock: WorkareaQueries = mock(WorkareaQueries);

    const workAreasBehaviourSubject = new BehaviorSubject<WorkareaResource[]>([MOCK_WORKAREA_A]);

    const validDefaultValues: CommonFilterFormData = {
        range: {
            start: moment(),
            end: moment().add(1, 'd'),
        },
        workArea: {
            workAreaIds: ['123'],
            header: false,
        },
        wholeProjectDuration: false,
    };

    const parsedValidDefaultValues: CommonFilterFormDataParsed = {
        range: validDefaultValues.range,
        workAreaIds: validDefaultValues.workArea.workAreaIds,
        wholeProjectDuration: false,
    };

    const defaultWorkAreaOptionList: InputMultipleSelectOption[] = [
        {
            id: MOCK_WORKAREA_A.id,
            text: `${MOCK_WORKAREA_A.position}. ${MOCK_WORKAREA_A.name}`,
        },
        {
            id: WORKAREA_UUID_EMPTY,
            text: 'Generic_WithoutArea',
        },
    ];
    const topRowWorkAreaOption: InputMultipleSelectOption = {
        id: MILESTONE_UUID_HEADER,
        text: 'Generic_TopRow',
    };

    const wholeProjectDurationSelector = `[data-automation="common-filter-capture-whole-duration"]`;

    const getElement = (selector: string): DebugElement => de.query(By.css(selector));

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            BrowserAnimationsModule,
            BrowserModule,
            ReactiveFormsModule,
            TranslationModule.forRoot(),
            UIModule,
        ],
        declarations: [
            CommonFilterCaptureComponent,
        ],
        providers: [
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: WorkareaQueries,
                useFactory: () => instance(workareaQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(CommonFilterCaptureComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(workareaQueriesMock.observeWorkareas()).thenReturn(workAreasBehaviourSubject);

        comp.ngOnInit();

        store.dispatch.calls.reset();
    });

    it('should request working areas when the component inits', () => {
        const expectedAction = new WorkareaActions.Request.All();

        comp.ngOnInit();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set the form value based on the default value when they are provided', () => {
        comp.defaultValues = validDefaultValues;

        expect(comp.form.value).toEqual(parsedValidDefaultValues);
    });

    it('should set the form value based on the default value when they are provided with work area header set to true', () => {
        const newDefaultValues = {...validDefaultValues, workArea: {...validDefaultValues.workArea, header: true}};
        const expectedResult: CommonFilterFormDataParsed = {
            ...parsedValidDefaultValues,
            workAreaIds: [...parsedValidDefaultValues.workAreaIds, MILESTONE_UUID_HEADER],
        };

        comp.defaultValues = newDefaultValues;

        expect(comp.form.value).toEqual(expectedResult);
    });

    it('should set the form value based on the default value when they are provided with work area header set to false', () => {
        comp.defaultValues = {...validDefaultValues, workArea: {...validDefaultValues.workArea, header: false}};

        expect(comp.form.value).toEqual(parsedValidDefaultValues);
    });

    it('should set the form value based on the default value when they are provided with wholeProjectDuration set to false', () => {
        comp.defaultValues = {
            ...validDefaultValues,
            wholeProjectDuration: false,
        };
        const expectedResult: CommonFilterFormDataParsed = {
            ...parsedValidDefaultValues,
            wholeProjectDuration: false,
        };

        expect(comp.form.value).toEqual(expectedResult);
    });

    it('should set the form value based on the default value when they are provided with wholeProjectDuration set to true', () => {
        comp.defaultValues = {
            ...validDefaultValues,
            wholeProjectDuration: true,
        };
        const expectedResult: CommonFilterFormDataParsed = {
            ...parsedValidDefaultValues,
            wholeProjectDuration: true,
        };

        expect(comp.form.value).toEqual(expectedResult);
    });

    it('should emit formValidity with true when setting valid input default values', () => {
        spyOn(comp.formValidity, 'emit');

        comp.defaultValues = validDefaultValues;

        expect(comp.formValidity.emit).toHaveBeenCalledWith(true);
    });

    it('should emit formValidity with false when the form status changed to invalid', () => {
        const invalidDateRange = {
            start: moment('12/dd/yyyy', 'MM/DD/YYYY', true),
            end: null,
        };

        spyOn(comp.formValidity, 'emit');

        comp.form.controls.range.setValue(invalidDateRange);

        expect(comp.formValidity.emit).toHaveBeenCalledWith(false);
    });

    it('should emit formValidity with true when the form status changed to valid', () => {
        const invalidDateRange = {
            start: moment('12/dd/yyyy', 'MM/DD/YYYY', true),
            end: null,
        };
        const validDateRange = {
            start: moment('12/12/2012', 'MM/DD/YYYY', true),
            end: null,
        };

        comp.form.controls.range.setValue(invalidDateRange);

        spyOn(comp.formValidity, 'emit');

        comp.form.controls.range.setValue(validDateRange);

        expect(comp.formValidity.emit).toHaveBeenCalledWith(true);
    });

    it('should return the current form value when getFormValue is called and milestone top row option is not selected', () => {
        const range: DateRange = {
            start: moment('12/12/2012', 'MM/DD/YYYY', true),
            end: null,
        };
        const workAreaIds = ['123'];
        const expectedFormValue: CommonFilterFormData = {
            range,
            workArea: {
                workAreaIds,
                header: false,
            },
            wholeProjectDuration: false,
        };

        comp.form.controls.range.setValue(range);
        comp.form.controls.workAreaIds.setValue(workAreaIds);

        expect(comp.getFormValue()).toEqual(expectedFormValue);
    });

    it('should return the current form value when getFormValue is called and milestone top row option is selected', () => {
        const range: DateRange = {
            start: moment('12/12/2012', 'MM/DD/YYYY', true),
            end: null,
        };
        const workAreaIds = [MILESTONE_UUID_HEADER];
        const expectedFormValue: CommonFilterFormData = {
            range,
            workArea: {
                workAreaIds: [],
                header: true,
            },
            wholeProjectDuration: false,

        };

        comp.form.controls.range.setValue(range);
        comp.form.controls.workAreaIds.setValue(workAreaIds);

        expect(comp.getFormValue()).toEqual(expectedFormValue);
    });

    it('should return the current form value with default range when getFormValue is called and range input is disabled', () => {
        const range: DateRange = {
            start: moment('12/12/2012', 'MM/DD/YYYY', true),
            end: null,
        };
        const defaultRange: DateRange = {
            start: null,
            end: null,
        };
        const workAreaIds = [MILESTONE_UUID_HEADER];
        const expectedFormValue: CommonFilterFormData = {
            range: defaultRange,
            workArea: {
                workAreaIds: [],
                header: true,
            },
            wholeProjectDuration: false,
        };

        comp.form.controls.range.setValue(range);
        comp.form.controls.range.disable();
        comp.form.controls.workAreaIds.setValue(workAreaIds);

        expect(comp.getFormValue()).toEqual(expectedFormValue);
    });

    it('should set the InputMultipleSelectOption list for working areas', () => {
        expect(comp.workAreaList).toEqual(defaultWorkAreaOptionList);
    });

    it('should set the InputMultipleSelectOption list for working areas with the top row option when ' +
        'showTopRowWorkAreaOption is true', () => {
        const expectedResult: InputMultipleSelectOption[] = [
            topRowWorkAreaOption,
            ...defaultWorkAreaOptionList];

        comp.showTopRowWorkAreaOption = true;
        comp.ngOnInit();

        expect(comp.workAreaList).toEqual(expectedResult);
    });

    it('should not set the InputMultipleSelectOption list for working areas with the top row option when ' +
        'showTopRowWorkAreaOption is false', () => {
        comp.showTopRowWorkAreaOption = false;
        comp.ngOnInit();

        expect(comp.workAreaList).toEqual(defaultWorkAreaOptionList);
    });

    it('should emit rangeChange when setting input default values', () => {
        spyOn(comp.rangeChange, 'emit');

        comp.defaultValues = validDefaultValues;

        expect(comp.rangeChange.emit).toHaveBeenCalledWith(validDefaultValues.range);
    });

    it('should emit rangeChange when the date range values changes', () => {
        const currentDate = moment();
        const rangeWithStartAndEnd: DateRange = {
            start: currentDate,
            end: currentDate,
        };
        const rangeWithStart: DateRange = {
            start: currentDate,
            end: null,
        };
        const rangeWithEnd: DateRange = {
            start: null,
            end: currentDate,
        };
        const rangeWithoutValues: DateRange = {
            start: null,
            end: null,
        };

        spyOn(comp.rangeChange, 'emit');

        comp.form.controls.range.setValue(rangeWithStartAndEnd);
        comp.form.controls.range.setValue(rangeWithStart);
        comp.form.controls.range.setValue(rangeWithEnd);
        comp.form.controls.range.setValue(rangeWithoutValues);

        expect(comp.rangeChange.emit).toHaveBeenCalledTimes(4);
        expect(comp.rangeChange.emit).toHaveBeenCalledWith(rangeWithStartAndEnd);
        expect(comp.rangeChange.emit).toHaveBeenCalledWith(rangeWithStart);
        expect(comp.rangeChange.emit).toHaveBeenCalledWith(rangeWithEnd);
        expect(comp.rangeChange.emit).toHaveBeenCalledWith(rangeWithoutValues);
    });

    it('should disable the range input when wholeProjectDuration changes to true and showWholeProjectDurationOption is true', () => {
        comp.showWholeProjectDurationOption = true;
        comp.form.controls.range.enable();
        comp.form.controls.wholeProjectDuration.setValue(true);

        expect(comp.form.controls.range.disabled).toBeTruthy();
    });

    it('should enable the range input when wholeProjectDuration changes to false and showWholeProjectDurationOption is true', () => {
        comp.showWholeProjectDurationOption = true;
        comp.form.controls.range.disable();
        comp.form.controls.wholeProjectDuration.setValue(false);

        expect(comp.form.controls.range.disabled).toBeFalsy();
    });

    it('should not enable or disable the range input when wholeProjectDuration changes and showWholeProjectDurationOption is false', () => {
        comp.showWholeProjectDurationOption = false;

        comp.form.controls.range.disable();
        comp.form.controls.wholeProjectDuration.setValue(false);

        expect(comp.form.controls.range.disabled).toBeTruthy();

        comp.form.controls.range.enable();
        comp.form.controls.wholeProjectDuration.setValue(true);

        expect(comp.form.controls.range.enabled).toBeTruthy();
    });

    it('should show the whole project duration section when showWholeProjectDurationOption is true', () => {
        comp.showWholeProjectDurationOption = true;
        fixture.detectChanges();

        expect(getElement(wholeProjectDurationSelector)).toBeTruthy();
    });

    it('should not show the whole project duration section when showWholeProjectDurationOption is false', () => {
        comp.showWholeProjectDurationOption = false;
        fixture.detectChanges();

        expect(getElement(wholeProjectDurationSelector)).toBeFalsy();
    });

    it('should add position to each work area text', () => {
        const [workArea] = comp.workAreaList;

        expect(workArea.text).toBe(`${MOCK_WORKAREA_A.position}. ${MOCK_WORKAREA_A.name}`);
    });

    it('should emit a valueChanged event when emitValueChanged is true, the form is valid and its value has changed', () => {
        spyOn(comp.valueChanged, 'emit');

        comp.emitValueChanged = true;
        comp.form.controls.workAreaIds.setValue(['foo']);

        expect(comp.valueChanged.emit).toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is false, the form is valid and its value has changed', () => {
        spyOn(comp.valueChanged, 'emit');

        comp.emitValueChanged = false;
        comp.form.controls.workAreaIds.setValue(['foo']);

        expect(comp.valueChanged.emit).not.toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is true, the form is invalid and its value has changed', () => {
        const invalidRange: DateRange = {
            start: moment(),
            end: moment('12/mm/yyyy', 'DD/MM/YYYY', true),
        };

        spyOn(comp.valueChanged, 'emit');

        comp.emitValueChanged = true;
        comp.form.controls.range.setValue(invalidRange);
        comp.form.controls.workAreaIds.setValue(['foo']);

        expect(comp.valueChanged.emit).not.toHaveBeenCalled();
    });

    it('should not emit a valueChanged event when emitValueChanged is true, the form is valid ' +
        'but the value changed to an equivalent value', () => {
        comp.emitValueChanged = true;
        comp.form.controls.workAreaIds.setValue(['foo']);

        spyOn(comp.valueChanged, 'emit');
        comp.form.controls.workAreaIds.setValue(['foo']);

        expect(comp.valueChanged.emit).not.toHaveBeenCalled();
    });
});
