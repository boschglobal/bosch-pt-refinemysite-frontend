/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    OnDestroy,
    OnInit,
    Output,
    ViewChild
} from '@angular/core';
import {Store} from '@ngrx/store';
import * as moment from 'moment';
import {
    combineLatest,
    Subscription,
} from 'rxjs';
import {first} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {CaptureModeEnum} from '../../../../shared/misc/enums/capture-mode.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {SaveDayCardResource} from '../../api/day-cards/resources/save-day-card.resource';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {DayCard} from '../../models/day-cards/day-card';
import {Task} from '../../models/tasks/task';
import {
    DateRange,
    DayCardCaptureComponent
} from '../../presentationals/day-card-capture/day-card-capture.component';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkDaysQueries} from '../../store/work-days/work-days.queries';

@Component({
    selector: 'ss-day-card-edit',
    templateUrl: './day-card-edit.component.html',
    styleUrls: ['./day-card-edit.component.scss'],
})
export class DayCardEditComponent implements OnInit, OnDestroy {
    /**
     * @description Emits when the capture is to be closed
     * @type {EventEmitter<null>}
     */
    @Output()
    public onClose: EventEmitter<null> = new EventEmitter<null>();

    /**
     * @description Property with project capture component
     */
    @ViewChild('dayCardCapture', {static: true})
    public dayCardCapture: DayCardCaptureComponent;

    /**
     * @description Property with information about loading status
     * @type {boolean}
     */
    public isLoading = false;

    /**
     * @description Property to define that the capture has the update mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.update;

    public dateConfig: DateRange;

    public defaultValues: SaveDayCardResource;

    public isSubmitting: boolean;

    public focus: string;

    private _disposableSubscriptions = new Subscription();

    private _taskId: string;

    private _dayCardId: string;

    private _dayCardVersion: number;

    private _taskScheduleVersion: number;

    constructor(private _dayCardQueries: DayCardQueries,
                private _modalService: ModalService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>,
                private _workDaysQueries: WorkDaysQueries) {
    }

    ngOnInit() {
        this._setModalOptions();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(saveDayCard: SaveDayCardResource): void {
        this.isSubmitting = true;
        this._store.dispatch(new DayCardActions.Update.One({
            taskId: this._taskId,
            dayCardId: this._dayCardId,
            dayCardVersion: this._dayCardVersion,
            taskScheduleVersion: this._taskScheduleVersion,
            saveDayCard,
        }));
    }

    public handleCancel(): void {
        this.isSubmitting = false;
        this.dayCardCapture.resetForm();
        this._store.dispatch(new DayCardActions.Update.OneReset());
        this.onClose.emit();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._dayCardQueries.observeDayCardsByTask(this._taskId),
                this._projectTaskQueries.observeTaskById(this._taskId),
                this._workDaysQueries.observeWorkDays(),
            ]).pipe(
                first()
            ).subscribe(dateConfig => this._setDateConfig(dateConfig))
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries.observeDayCardById(this._dayCardId)
                .pipe(
                    first()
                )
                .subscribe(dayCard => this._setDefaultValues(dayCard))
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries.observeCurrentDayCardRequestStatus()
                .subscribe(requestStatus => this._handleCaptureState(requestStatus))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setModalOptions(): void {
        const {dayCard, focus} = this._modalService.currentModalData;

        this.focus = focus;
        this._taskId = dayCard.task.id;
        this._dayCardId = dayCard.id;
    }

    private _setDefaultValues(dayCard: DayCard): void {
        const {title, date, manpower, notes, version} = dayCard;

        this.defaultValues = new SaveDayCardResource(title, moment(date), manpower, notes);
        this._dayCardVersion = version;
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        if (this.isSubmitting) {
            this.isLoading = requestStatus === RequestStatusEnum.progress;

            if (requestStatus === RequestStatusEnum.success) {
                this.handleCancel();
            }
        }
    }

    private _setDateConfig([dayCards, task, workDays]: [DayCard[], Task, WorkDaysResource]): void {
        const {start, end, version} = task.schedule;
        const currentDayCardDate = dayCards.find(dayCard => dayCard.id === this._dayCardId).date;
        const disabledDates = DayCard.getLockedSlotsDates(dayCards, task.schedule, workDays, [moment(currentDayCardDate)]);

        this.dateConfig = {
            disabledDates,
            max: moment(end),
            min: moment(start),
        };
        this._taskScheduleVersion = version;
    }
}
