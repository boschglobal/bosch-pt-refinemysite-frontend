/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    UntypedFormBuilder,
    UntypedFormGroup,
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {Moment} from 'moment';
import {
    combineLatest,
    Subscription,
} from 'rxjs';
import {
    filter,
    first,
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertTypeEnum} from '../../../../shared/alert/enums/alert-type.enum';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {GenericValidators} from '../../../../shared/misc/validation/generic.validators';
import {SelectOption} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {CalendarExportFilters} from '../../api/calendar/resources/calendar-export-filters';
import {
    CalendarExportFormatEnum,
    CalendarExportFormatEnumHelper
} from '../../enums/calendar-export-format.enum';
import {CalendarActions} from '../../store/calendar/calendar/calendar.actions';
import {CalendarQueries} from '../../store/calendar/calendar/calendar.queries';
import {CalendarScopeQueries} from '../../store/calendar/calendar-scope/calendar-scope.queries';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';

export const MAXIMUM_EXPORTABLE_WEEKS_LIMIT = 18;
export const MAXIMUM_EXPORTABLE_YEARS_LIMIT = 3;

@Component({
    selector: 'ss-calendar-export',
    templateUrl: './calendar-export.component.html',
    styleUrls: ['./calendar-export.component.scss'],
})
export class CalendarExportComponent implements OnInit, OnDestroy {

    @Output()
    public cancel: EventEmitter<null> = new EventEmitter<null>();

    @Output()
    public closed: EventEmitter<null> = new EventEmitter<null>();

    public form: UntypedFormGroup;

    public isLoading = false;

    public translationParameters: CalendarExportTranslationParams;

    public invalidDateInterval = false;

    public includeDayCardsSelected = false;

    public betaFormatSelected = false;

    public selectedFormatLabel: string;

    public formats: SelectOption[] = CalendarExportFormatEnumHelper.getSelectOptions();

    public betaFormatWarningType: AlertTypeEnum = AlertTypeEnum.Neutral;

    private _disposableSubscription: Subscription = new Subscription();

    private _isSubmitting: boolean;

    private _filters: CalendarExportFilters;

    private _projectId: string;

    constructor(private _calendarQueries: CalendarQueries,
                private _calendarScopeQueries: CalendarScopeQueries,
                private _formBuilder: UntypedFormBuilder,
                private _projectSliceService: ProjectSliceService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._initFilters();
        this._setSubscriptions();
        this._setupForm();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCancel(): void {
        this._resetForm();
        this._isSubmitting = false;
        this._store.dispatch(new CalendarActions.Export.OneReset());
        this.closed.emit();
    }

    public handleDownload(): void {
        if (this.invalidDateInterval) {
            this._showWarning();
        } else {
            const filters: CalendarExportFilters = this._getSubmitValue();
            const format = this.form.getRawValue().format;

            this._isSubmitting = true;
            this._store.dispatch(new CalendarActions.Export.One(this._projectId, filters, format));
        }
    }

    public isFormValid(): boolean {
        return this.form.valid;
    }

    public getFormatLabel(format: SelectOption, formatLabel: string, beta: string): string {
        const betaLabel = this._isBetaFormat(format.value) ? ` (${beta})` : '';
        return `${formatLabel}${betaLabel}`;
    }

    private _getSubmitValue(): CalendarExportFilters {
        const {range: {start, end}, includeDayCards, includeMilestones} = this.form.getRawValue();
        this._filters.from = start;
        this._filters.to = end;
        this._filters.includeDayCards = includeDayCards;
        this._filters.includeMilestones = includeMilestones;
        return this._filters;
    }

    private _resetForm(): void {
        this.form.reset();
        this.form.updateValueAndValidity();
        this._setupForm();
    }

    private _setFilters(filters: ProjectTaskFilters, scope: TimeScope): void {
        const {
            assignees,
            hasTopics,
            projectCraftIds,
            status,
            topicCriticality,
            from,
            to,
            workAreaIds,
            allDaysInDateRange,
        } = filters.criteria;
        this._filters.assignees = assignees;
        this._filters.hasTopics = hasTopics;
        this._filters.projectCraftIds = projectCraftIds;
        this._filters.status = status;
        this._filters.topicCriticality = topicCriticality;
        this._filters.from = from ? from : scope.start;
        this._filters.to = to ? to : scope.end;
        this._filters.workAreaIds = workAreaIds;
        this._filters.allDaysInDateRange = allDaysInDateRange;
    }

    private _showWarning(): void {
        this._store.dispatch(
            new AlertActions.Add.WarningAlert(
                {
                    message: new AlertMessageResource(
                        this._shouldApplyLowerMaximumOfExportableWeeks()
                            ? 'Calendar_Export_IncludeDayCardsInvalidDatesWarning'
                            : 'Calendar_Export_InvalidDatesWarning'
                    ),
                }
            )
        );
    }

    private _setSubscriptions(): void {
        this._disposableSubscription.add(
            this._projectSliceService.observeCurrentProjectId()
                .subscribe(id => this._projectId = id)
        );

        this._disposableSubscription.add(
            combineLatest([
                this._projectTaskQueries.observeCalendarFilters(),
                this._calendarScopeQueries.observeCalendarScope(),
            ])
                .pipe(first())
                .subscribe(([filters, scope]) => this._setFilters(filters, scope))
        );

        this._disposableSubscription.add(
            this._calendarQueries.observeExportRequestStatus()
                .subscribe(status => this._handleExportRequestStatus(status)));
    }

    private _handleExportRequestStatus(status: RequestStatusEnum): void {
        if (this._isSubmitting) {
            this.isLoading = status === RequestStatusEnum.progress;

            if (status === RequestStatusEnum.success) {
                this.handleCancel();
            }
        }
    }

    private _setupForm(): void {
        this.form = this._formBuilder.group({
            range: [{
                start: this._filters?.from,
                end: this._filters?.to,
            }, [
                GenericValidators.isValidDate(),
                GenericValidators.isRequiredRange(),
                GenericValidators.isValidRange(),
            ]],
            format: [CalendarExportFormatEnum.Pdf, [GenericValidators.isRequired()]],
            includeDayCards: [this._filters.includeDayCards],
            includeMilestones: [this._filters.includeMilestones],
        });

        this._disposableSubscription.add(
            this.form.get('format').valueChanges.subscribe(
                format => {
                    if (format) {
                        this.betaFormatSelected = this._isBetaFormat(format);
                        this.selectedFormatLabel = CalendarExportFormatEnumHelper.getLabelByValue(format);
                    }
                }
            )
        );

        this._disposableSubscription.add(
            this.form.valueChanges.pipe(
                filter(value => !!value?.range?.start && !!value?.range?.end)
            ).subscribe(({range: {start, end}, includeDayCards}) => {
                this.includeDayCardsSelected = includeDayCards;
                this._updateWeekInterval(start, end);
                this._updateInvalidDateInterval(start, end);
            })
        );
    }

    private _isBetaFormat(format: CalendarExportFormatEnum): boolean {
        return format === CalendarExportFormatEnum.Csv || format === CalendarExportFormatEnum.Json;
    }

    private _updateWeekInterval(start: Moment, end: Moment): void {
        this.translationParameters = {selectedWeeks: this._getExportDuration(start, end, 'weeks')};
    }

    private _updateInvalidDateInterval(start: Moment, end: Moment): void {
        this.invalidDateInterval = this._shouldApplyLowerMaximumOfExportableWeeks()
            ? this._getExportDuration(start, end, 'weeks') > MAXIMUM_EXPORTABLE_WEEKS_LIMIT
            : this._getExportDuration(start, end, 'years') > MAXIMUM_EXPORTABLE_YEARS_LIMIT;
    }

    private _shouldApplyLowerMaximumOfExportableWeeks(): boolean {
        return this.includeDayCardsSelected && !this.betaFormatSelected;
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _initFilters() {
        this._filters = new CalendarExportFilters();
    }

    private _getExportDuration(start: Moment, end: Moment, granularity: 'weeks' | 'years'): number {
        return Math.max(end.diff(start, granularity) + 1, 0);
    }
}

export class CalendarExportTranslationParams {
    selectedWeeks: number;
}
