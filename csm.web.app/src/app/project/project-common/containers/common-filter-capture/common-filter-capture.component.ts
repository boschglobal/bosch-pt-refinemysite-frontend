/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    startWith,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {DateRange} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {InputMultipleSelectOption} from '../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MILESTONE_UUID_HEADER} from '../../constants/milestone.constant';
import {WORKAREA_UUID_EMPTY} from '../../constants/workarea.constant';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export interface CommonFilterFormData {
    range: DateRange;
    workArea: {
        header: boolean;
        workAreaIds: string[];
    };
    wholeProjectDuration?: boolean;
}

export interface CommonFilterFormDataParsed {
    range: DateRange;
    workAreaIds: string[];
    wholeProjectDuration: boolean;
}

const COMMON_FILTER_FORM_DEFAULT_VALUE: CommonFilterFormDataParsed = {
    range: {start: null, end: null},
    workAreaIds: [],
    wholeProjectDuration: false,
};

@Component({
    selector: 'ss-common-filter-capture',
    templateUrl: './common-filter-capture.component.html',
    styleUrls: ['./common-filter-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommonFilterCaptureComponent implements OnInit, OnDestroy {

    @Input()
    public set defaultValues(defaultValues: CommonFilterFormData) {
        const {range, wholeProjectDuration, workArea: {workAreaIds, header}} = defaultValues;
        const parsedWorkAreaIds = header ? [...workAreaIds, MILESTONE_UUID_HEADER] : workAreaIds;
        const parsedDefaultValues: CommonFilterFormDataParsed = {
            range,
            wholeProjectDuration,
            workAreaIds: parsedWorkAreaIds,
        };

        this._setFormValue(parsedDefaultValues);
        this._handleFormStatusChange();
        this._handleRangeChange();
    }

    @Input()
    public emitValueChanged: boolean;

    @Input()
    public showTopRowWorkAreaOption: boolean;

    @Input()
    public showWholeProjectDurationOption: boolean;

    @Output()
    public formValidity = new EventEmitter<boolean>();

    @Output()
    public rangeChange = new EventEmitter<DateRange>();

    @Output()
    public valueChanged = new EventEmitter<void>();

    public form = this._formBuilder.group({
        range: new FormControl(COMMON_FILTER_FORM_DEFAULT_VALUE.range, [
            GenericValidators.isValidDate(),
            GenericValidators.isValidRange(),
        ]),
        workAreaIds: new FormControl(COMMON_FILTER_FORM_DEFAULT_VALUE.workAreaIds),
        wholeProjectDuration: new FormControl(COMMON_FILTER_FORM_DEFAULT_VALUE.wholeProjectDuration),
    });

    public workAreaList: InputMultipleSelectOption[] = [];

    private _disposableSubscriptions = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _store: Store<State>,
                private _translateService: TranslateService,
                private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestWorkAreas();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public getFormValue(): CommonFilterFormData {
        return this._getParsedCommonFilterFormData();
    }

    private _getParsedCommonFilterFormData(): CommonFilterFormData {
        const {range, workAreaIds, wholeProjectDuration} = this.form.value as CommonFilterFormDataParsed;
        const filteredWorkAreaIds = workAreaIds.filter(id => id !== MILESTONE_UUID_HEADER);
        const header = workAreaIds.includes(MILESTONE_UUID_HEADER);

        return {
            range: range || COMMON_FILTER_FORM_DEFAULT_VALUE.range,
            wholeProjectDuration,
            workArea: {
                header,
                workAreaIds: filteredWorkAreaIds,
            },
        };
    }

    private _handleFormStatusChange(): void {
        this.formValidity.emit(this.form.valid);
    }

    private _handleRangeChange(): void {
        this.rangeChange.emit(this.form.controls.range.value);
    }

    private _handleWholeProjectDurationChange(): void {
        if (this.form.controls.wholeProjectDuration.value) {
            this.form.controls.range.disable();
        } else {
            this.form.controls.range.enable();
        }
        this._changeDetectorRef.detectChanges();
    }

    private _handleWorkAreas(workAreas: WorkareaResource[]): void {
        const workAreaList = workAreas.map(({id, name, position}: WorkareaResource) => ({id, text: `${position}. ${name}`}));
        const withoutWorkingAreaOption = {text: this._translateService.instant('Generic_WithoutArea'), id: WORKAREA_UUID_EMPTY};
        const topRowWorkAreaOption = this.showTopRowWorkAreaOption
            ? [{text: this._translateService.instant('Generic_TopRow'), id: MILESTONE_UUID_HEADER}]
            : [];

        this.workAreaList = [...topRowWorkAreaOption, ...workAreaList, withoutWorkingAreaOption];
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _setFormValue(value: CommonFilterFormDataParsed): void {
        this.form.setValue(value);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workAreaQueries
                .observeWorkareas()
                .subscribe(workAreas => this._handleWorkAreas(workAreas)));

        this._disposableSubscriptions.add(
            this.form.statusChanges
                .pipe(distinctUntilChanged())
                .subscribe(() => this._handleFormStatusChange()));

        this._disposableSubscriptions.add(
            this.form.controls.range.valueChanges.subscribe(() => this._handleRangeChange()));

        this._disposableSubscriptions.add(
            this.form.controls.wholeProjectDuration.valueChanges.pipe(
                startWith(this.form.value.wholeProjectDuration),
                filter(() => this.showWholeProjectDurationOption))
                .subscribe(() => this._handleWholeProjectDurationChange()));

        this._disposableSubscriptions.add(
            this.form.valueChanges.pipe(
                filter(() => this.emitValueChanged && this.form.valid),
                map(() => this.getFormValue()),
                distinctUntilChanged(isEqual),
            ).subscribe(() => this.valueChanged.emit())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
