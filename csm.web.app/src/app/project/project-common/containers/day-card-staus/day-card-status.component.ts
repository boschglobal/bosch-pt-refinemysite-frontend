/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';
import {Store} from '@ngrx/store';
import * as moment from 'moment';

import {State} from '../../../../app.reducers';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {DAY_CARD_STATUS_ICON} from '../../constants/day-card-status-icon.constant';
import {
    DayCardStatusEnum,
    DayCardStatusEnumHelper
} from '../../enums/day-card-status.enum';
import {DayCard} from '../../models/day-cards/day-card';
import {DayCardActions} from '../../store/day-cards/day-card.actions';
import {DayCardQueries} from '../../store/day-cards/day-card.queries';

@Component({
    selector: 'ss-day-card-status',
    templateUrl: './day-card-status.component.html',
    styleUrls: ['./day-card-status.component.scss']
})
export class DayCardStatusComponent {
    @Input()
    public set dayCard(dayCard: DayCard) {
        this._dayCard = dayCard;
    }

    private _dayCard: DayCard;

    constructor(private _dayCardQueries: DayCardQueries,
                private _modalService: ModalService,
                private _store: Store<State>) {
    }

    public get canShowDayCard(): boolean {
        return !!this._dayCard;
    }

    public get dayCardStatusIcon(): IconModel {
        return this.getStatusIcon(this._dayCard.status);
    }

    public get dayCardStatusLabel(): string {
        return this.getStatusLabel(this._dayCard.status);
    }

    public get dayCardStatusReason(): string {
        return this._dayCard.reason?.name;
    }

    public get dayCardStatusDate(): string {
        return moment(this._dayCard.lastModifiedDate).format('L');
    }

    public get dayCardStatusActor(): string {
        return this._dayCard.lastModifiedBy.displayName;
    }

    public get canCancel(): boolean {
        return this._dayCard.permissions.canCancel;
    }

    public get canComplete(): boolean {
        return this._dayCard.permissions.canComplete && !this.canApprove;
    }

    public get canApprove(): boolean {
        return this._dayCard.permissions.canApprove;
    }

    public get canReset(): boolean {
        return this._dayCard.permissions.canReset;
    }

    public get canShowMetaInformation(): boolean {
        return this._dayCard.status !== DayCardStatusEnum.Open;
    }

    public getStatusIcon(status: string): IconModel {
        return DAY_CARD_STATUS_ICON[status];
    }

    public getStatusLabel(status: string): string {
        return DayCardStatusEnumHelper.getLabelByValue(status);
    }

    public getDataAutomationAttr(suffix: string): string {
        return `day-card-status-${suffix}`;
    }

    public handleApprove(): void {
        this._store.dispatch(new DayCardActions.Approve.One(this._dayCard.id));
    }

    public handleCancel(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmDayCardStatusChangeWithReasons,
            data: {
                dayCardId: this._dayCard.id,
            }
        });
    }

    public handleComplete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Daycard_Update_ConfirmTitle',
                description: 'Daycard_Update_ConfirmMessage',
                confirmCallback: () => this._store.dispatch(new DayCardActions.Complete.One(this._dayCard.id)),
                cancelCallback: () => this._store.dispatch(new DayCardActions.Complete.OneReset()),
                requestStatusObservable: this._dayCardQueries.observeCurrentDayCardRequestStatus()
            }
        });
    }

    public handleReset(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Daycard_Reset_ConfirmTitle',
                description: 'Daycard_Reset_ConfirmMessage',
                confirmCallback: () => this._store.dispatch(new DayCardActions.Reset.One(this._dayCard.id)),
                cancelCallback: () => this._store.dispatch(new DayCardActions.Reset.OneReset()),
                requestStatusObservable: this._dayCardQueries.observeCurrentDayCardRequestStatus()
            }
        });
    }
}
