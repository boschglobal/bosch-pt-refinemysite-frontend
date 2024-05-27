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
    Output
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {RfvKey} from '../../api/rfvs/resources/rfv.resource';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';
import {RfvActions} from '../../store/rfvs/rfv.actions';
import {RfvQueries} from '../../store/rfvs/rfv.queries';

@Component({
    selector: 'ss-daycard-reason',
    templateUrl: './day-card-reason.component.html',
})
export class DayCardReasonComponent implements OnInit, OnDestroy {

    @Output()
    public onClose: EventEmitter<null> = new EventEmitter<null>();

    public requestStatus: RequestStatusEnum = RequestStatusEnum.empty;

    public rfvList: RfvEntity[];

    public rfvListRequestStatus: RequestStatusEnum = RequestStatusEnum.empty;

    private _disposableSubscriptions = new Subscription();

    constructor(private _dayCardQueries: DayCardQueries,
                private _modalService: ModalService,
                private _rfvQueries: RfvQueries,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._requestRfvList();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleSubmit(reason: RfvKey) {
        const dayCardId = this._modalService.currentModalData.dayCardId;

        this._store.dispatch(new DayCardActions.Cancel.One({
            reason,
            dayCardId,
        }));
    }

    public handleCancel(): void {
        this._store.dispatch(new DayCardActions.Cancel.OneReset());
        this.onClose.emit();
    }

    private _requestRfvList(): void {
        this._store.dispatch(new RfvActions.Request.All());
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._dayCardQueries.observeCurrentDayCardRequestStatus()
                .subscribe(this._handleCaptureState.bind(this))
        );

        this._disposableSubscriptions.add(
            this._rfvQueries.observeActiveRfvList()
                .subscribe(rfvList => this._handleRfvList(rfvList))
        );

        this._disposableSubscriptions.add(
            this._rfvQueries.observeRfvListRequestStatus()
                .subscribe(requestStatus => this._handleRfvListRequestStatus(requestStatus))
        );
    }

    private _handleCaptureState(requestStatus: RequestStatusEnum): void {
        this.requestStatus = requestStatus;
    }

    private _handleRfvList(rfvList: RfvEntity[]): void {
        this.rfvList = rfvList;
    }

    private _handleRfvListRequestStatus(requestStatus: RequestStatusEnum): void {
        this.rfvListRequestStatus = requestStatus;
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
