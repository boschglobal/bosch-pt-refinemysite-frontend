/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {CaptureModeEnum} from '../../../../../../shared/misc/enums/capture-mode.enum';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {WeekDaysEnum} from '../../../../../../shared/misc/enums/weekDays.enum';
import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../../../shared/rest/constants/date-format.constant';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../../../../project-common/api/work-days/resources/work-days.resource';
import {
    UpdateWorkDaysPayload,
    WorkDaysActions
} from '../../../../../project-common/store/work-days/work-days.actions';
import {WorkDaysQueries} from '../../../../../project-common/store/work-days/work-days.queries';
import {
    WorkingDaysFormData,
    WorkingDaysFormDataWeekDays
} from '../../presentationals/working-days-capture/working-days-capture.component';
import {WorkingDaysHolidayFormData} from '../../presentationals/working-days-holiday-capture/working-days-holiday-capture.component';
import {
    CREATE_HOLIDAY_ITEM_ID,
    DELETE_HOLIDAY_ITEM_ID,
    EDIT_HOLIDAY_ITEM_ID,
    WorkingDaysHolidayAction
} from '../../presentationals/working-days-holidays-list/working-days-holidays-list.component';
import {WorkOnNonWorkingDaysFormData} from '../../presentationals/working-days-toggle-capture/working-days-toggle-capture.component';

@Component({
    selector: 'ss-working-days',
    templateUrl: './working-days.component.html',
    styleUrls: ['./working-days.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkingDaysComponent implements OnInit, OnDestroy {

    public isLoading = false;

    public modalWorkingDaysHolidayId = ModalIdEnum.UpdateWorkingDaysHoliday;

    public modalWorkingDaysHolidayTitle: string;

    public modalWorkingDaysHolidayType: CaptureModeEnum;

    public workingDaysCaptureDefaultValues: WorkingDaysFormData;

    public workingDaysHolidayCaptureDefaultValues: WorkingDaysHolidayFormData;

    public workDaysHolidaysList: WorkDaysHoliday[];

    public workOnNonWorkingDaysCaptureDefaultValues: WorkOnNonWorkingDaysFormData;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _workDays: WorkDaysResource;

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _modalService: ModalService,
                private _store: Store<State>,
                private _workDaysQueries: WorkDaysQueries) {
    }

    ngOnInit(): void {
        this._requestWorkDay();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public closeModal(): void {
        this._modalService.close();
    }

    public handleSubmit(value: WorkingDaysFormData): void {
        const {startOfWeek, workingDays} = value;
        const {allowWorkOnNonWorkingDays, holidays} = this._workDays;
        const computedWorkingDays = Object.keys(workingDays).filter(workingDay => workingDays[workingDay]) as WeekDaysEnum[];
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            holidays,
            startOfWeek,
            workingDays: computedWorkingDays,
        };

        if (this._workDays.startOfWeek !== value.startOfWeek) {
            this._openStartOfWeekConfirmationModal(updateWorkDaysPayload);
        } else {
            this._store.dispatch(new WorkDaysActions.Update.One(updateWorkDaysPayload, this._workDays.version));
        }
    }

    public handleSubmitWorkingDaysHoliday({name, date}: WorkingDaysHolidayFormData): void {
        const originalHolidays = this._workDays.holidays;
        const initialValues = this.workingDaysHolidayCaptureDefaultValues;
        const newHoliday: WorkDaysHoliday = {name, date: date.format(API_DATE_YEAR_MONTH_DAY_FORMAT)};
        const holidays = this.modalWorkingDaysHolidayType === CaptureModeEnum.create
            ? [...originalHolidays, newHoliday]
            : originalHolidays
                .map(holiday => holiday.name === initialValues.name && moment(holiday.date).isSame(initialValues.date, 'd')
                    ? newHoliday
                    : holiday);

        const {allowWorkOnNonWorkingDays, startOfWeek, workingDays} = this._workDays;
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            holidays,
            startOfWeek,
            workingDays,
        };

        this._store.dispatch(new WorkDaysActions.Update.One(updateWorkDaysPayload, this._workDays.version));

        this.closeModal();
    }

    public handleWorkingDaysHolidayActions(action: WorkingDaysHolidayAction): void {
        switch (action.id) {
            case CREATE_HOLIDAY_ITEM_ID:
                this._openCreateWorkingDaysHolidayModal();
                break;
            case DELETE_HOLIDAY_ITEM_ID:
                this._openDeleteWorkingDaysHolidayModal(action.holiday);
                break;
            case EDIT_HOLIDAY_ITEM_ID:
                this._openEditWorkingDaysHolidayModal(action.holiday);
                break;
        }
    }

    public handleWorkOnNonWorkingDaysChange(allowWorkOnNonWorkingDays: boolean): void {
        const {holidays, startOfWeek, workingDays} = this._workDays;
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            holidays,
            startOfWeek,
            workingDays,
            allowWorkOnNonWorkingDays,
        };

        this._store.dispatch(new WorkDaysActions.Update.One(updateWorkDaysPayload, this._workDays.version));
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;

        this._changeDetectorRef.detectChanges();
    }

    private _openCreateWorkingDaysHolidayModal(): void {
        this.modalWorkingDaysHolidayTitle = 'WorkingDays_NewNonWorkingDay_Title';
        this.modalWorkingDaysHolidayType = CaptureModeEnum.create;
        this.workingDaysHolidayCaptureDefaultValues = null;

        this._modalService.open({
            id: ModalIdEnum.UpdateWorkingDaysHoliday,
            data: null,
        });
    }

    private _openDeleteWorkingDaysHolidayModal(holiday: WorkDaysHoliday): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'WorkingDays_DeleteNonWorkingDays_Title',
                description: 'WorkingDays_DeleteNonWorkingDays_Description',
                confirmCallback: () => this._deleteWorkingDayHoliday(holiday),
                requestStatusObservable: this._workDaysQueries.observeWorkDaysRequestStatus(),
            },
        });
    }

    private _openEditWorkingDaysHolidayModal(holiday: WorkDaysHoliday): void {
        this.modalWorkingDaysHolidayTitle = 'WorkingDays_UpdateNonWorkingDays_Title';
        this.modalWorkingDaysHolidayType = CaptureModeEnum.update;
        this.workingDaysHolidayCaptureDefaultValues = {
            name: holiday.name,
            date: moment(holiday.date),
        };

        this._modalService.open({
            id: ModalIdEnum.UpdateWorkingDaysHoliday,
            data: this.workingDaysHolidayCaptureDefaultValues,
        });
    }

    private _openStartOfWeekConfirmationModal(workDays: UpdateWorkDaysPayload): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'WorkingDays_Update_ConfirmationDialogTitle',
                description: 'WorkingDays_Update_ConfirmationDialogDescription',
                confirmCallback: () => this._store.dispatch(new WorkDaysActions.Update.One(workDays, this._workDays.version)),
                requestStatusObservable: this._workDaysQueries.observeWorkDaysRequestStatus(),
            },
        });
    }

    private _deleteWorkingDayHoliday(value: WorkDaysHoliday): void {
        const {allowWorkOnNonWorkingDays, startOfWeek, workingDays} = this._workDays;
        const holidays =
            this.workDaysHolidaysList.filter(({name, date}) => name !== value.name || !moment(value.date).isSame(moment(date), 'd'));
        const updateWorkDaysPayload: UpdateWorkDaysPayload = {
            allowWorkOnNonWorkingDays,
            holidays,
            startOfWeek,
            workingDays,
        };

        this._store.dispatch(new WorkDaysActions.Update.One(updateWorkDaysPayload, this._workDays.version));

        this.closeModal();
    }

    private _requestWorkDay(): void {
        this._store.dispatch(new WorkDaysActions.Request.One());
    }

    private _setWorkDays(workDays: WorkDaysResource): void {
        const {allowWorkOnNonWorkingDays, holidays, startOfWeek, workingDays} = workDays;
        const computedWorkingDays = Object.keys(WeekDaysEnum).reduce((prev, curr) => ({
            ...prev,
            [curr]: workingDays.includes(curr as WeekDaysEnum),
        }), {} as WorkingDaysFormDataWeekDays);

        this.workingDaysCaptureDefaultValues = {startOfWeek, workingDays: computedWorkingDays};
        this.workOnNonWorkingDaysCaptureDefaultValues = {allowWorkOnNonWorkingDays};
        this.workDaysHolidaysList = holidays;
        this._workDays = workDays;

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._workDaysQueries
                .observeWorkDaysRequestStatus()
                .subscribe(status => this._handleRequestStatus(status)));

        this._disposableSubscriptions.add(
            this._workDaysQueries
                .observeWorkDays()
                .subscribe(workDays => this._setWorkDays(workDays)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
