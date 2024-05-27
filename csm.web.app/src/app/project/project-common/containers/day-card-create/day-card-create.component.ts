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
    Subscription
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
    selector: 'ss-day-card-create',
    templateUrl: './day-card-create.component.html',
    styleUrls: ['./day-card-create.component.scss'],
})
export class DayCardCreateComponent implements OnInit, OnDestroy {

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
     * @description Property with information about submitting status
     * @type {boolean}
     */
    public isSubmitting: boolean;

    /**
     * @description Property to define that the capture has the create mode
     * @type {CaptureModeEnum}
     */
    public captureMode: CaptureModeEnum = CaptureModeEnum.create;

    public dateConfig: DateRange;

    public defaultValues: SaveDayCardResource;

    private _disposableSubscriptions = new Subscription();

    private _taskId: string;

    private _date: moment.Moment;

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
        this._store.dispatch(new DayCardActions.Create.One({
            saveDayCard,
            taskId: this._taskId,
        }));
    }

    public handleCancel(): void {
        this.isSubmitting = false;
        this.dayCardCapture.resetForm();
        this._store.dispatch(new DayCardActions.Create.OneReset());
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
            ).subscribe(this._setDateConfig.bind(this))
        );

        this._disposableSubscriptions.add(
            this._dayCardQueries.observeCurrentDayCardRequestStatus()
                .subscribe(this._handleCaptureState.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setModalOptions(): void {
        const {taskId, date} = this._modalService.currentModalData;
        this._taskId = taskId;
        this._date = date;
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
        const {start, end} = task.schedule;
        const disabledDates = DayCard.getLockedSlotsDates(dayCards, task.schedule, workDays);
        const defaultValues = new SaveDayCardResource('', this._date, 1, '');

        this.dateConfig = {
            disabledDates,
            max: moment(end),
            min: moment(start),
        };
        this.defaultValues = defaultValues;
    }
}
