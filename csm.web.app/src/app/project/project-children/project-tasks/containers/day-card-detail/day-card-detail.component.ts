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
    Input,
    OnDestroy,
    OnInit,
    Output
} from '@angular/core';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {ShowMore} from '../../../../../shared/ui/show-more/show-more.component';
import {DayCardDateFormatEnum} from '../../../../project-common/enums/date-format.enum';
import {DayCard} from '../../../../project-common/models/day-cards/day-card';
import {
    DayCardActions,
    DeleteDayCardPayload
} from '../../../../project-common/store/day-cards/day-card.actions';
import {DayCardQueries} from '../../../../project-common/store/day-cards/day-card.queries';

const NOTES_MAX_CHARS = 180;
export const DELETE_DAYCARD_ITEM_ID = 'delete-daycard';

@Component({
    selector: 'ss-day-card-detail',
    templateUrl: './day-card-detail.component.html',
    styleUrls: ['./day-card-detail.component.scss'],
})
export class DayCardDetailComponent implements OnInit, OnDestroy {

    @Input()
    public set dayCard(dayCard: DayCard) {
        this._dayCard = dayCard;
        this._setDayCardInfo();
        this._setDropdownItems();
    }

    public get dayCard(): DayCard {
        return this._dayCard;
    }

    @Output()
    public close: EventEmitter<void> = new EventEmitter<void>();

    public dayCardInfo: InfoEntry[] = [];

    public showMoreConfig: ShowMore = {
        enabled: false,
        message: {
            more: 'Generic_ShowMore',
            less: 'Generic_ShowLess',
        },
    };

    public isLoading: boolean;

    public dropdownItems: MenuItemsList[] = [];

    public maxLength = NOTES_MAX_CHARS;

    private _dayCard: DayCard;

    private _notesCollapsed: boolean;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _textLength = 0;

    constructor(private _dayCardQueries: DayCardQueries,
                private _modalService: ModalService,
                private _store: Store<State>,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._requestDayCard();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public get canEdit(): boolean {
        return this._dayCard.permissions.canUpdate;
    }

    public get canShowMore(): boolean {
        return this._textLength > this.maxLength;
    }

    public get dayCardTitle(): string {
        return this._dayCard.title;
    }

    public get dayCardNotes(): string {
        return this._dayCard.notes ? this._dayCard.notes.trim() : '';
    }

    public handleClose(): void {
        this.close.emit();
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_DAYCARD_ITEM_ID:
                this._handleDelete();
                break;
        }
    }

    public handleEdit(focus?: string): void {
        this._modalService.open({
            id: ModalIdEnum.UpdateDayCard,
            data: {
                dayCard: this._dayCard,
                focus,
            },
        });
    }

    public handleShowMoreNotes(isOpen: boolean): void {
        this._notesCollapsed = !isOpen;
        this._setMaxLength();
    }

    public handleTextLengthChanged(textLength: number): void {
        this._textLength = textLength;
        this._setNotesCollapsedState();
    }

    public _handleDelete(): void {
        const payload: DeleteDayCardPayload = {
            dayCardId: this._dayCard.id,
            taskId: this._dayCard.task.id,
        };

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                dayCard: this._dayCard,
                title: 'Daycard_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new DayCardActions.Delete.One(payload)),
                cancelCallback: () => this._store.dispatch(new DayCardActions.Delete.OneReset()),
                requestStatusObservable: this._dayCardQueries.observeCurrentDayCardRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _setDayCardInfo(): void {
        this.dayCardInfo = [
            this._setManpower,
            this._setDate,
        ];
    }

    private get _setManpower(): InfoEntry {
        return {
            icon: 'manpower',
            text: this._dayCard.manpower,
        };
    }

    private get _setDate(): InfoEntry {
        return {
            icon: 'calendar',
            text: this._getDate(),
        };
    }

    private _getDate() {
        const currentLang: string = this._translateService.defaultLang;
        const dateFormat: string = DayCardDateFormatEnum[currentLang];

        return moment(this._dayCard.date).locale(currentLang).format(dateFormat);
    }

    private _setMaxLength(): void {
        this.maxLength = this._notesCollapsed ? NOTES_MAX_CHARS : 0;
    }

    private _setNotesCollapsedState() {
        this._notesCollapsed = this.canShowMore && typeof this._notesCollapsed !== 'undefined'
            ? this._notesCollapsed
            : !this.showMoreConfig.enabled;
        this._setMaxLength();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._dayCardQueries
                .observeCurrentDayCardRequestStatus()
                .subscribe((status: RequestStatusEnum) => this._handleRequestStatus(status))
        );

        this._disposableSubscriptions.add(
            this._translateService.onDefaultLangChange
                .subscribe(() => this._setDayCardInfo())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleRequestStatus(status: RequestStatusEnum): void {
        this.isLoading = status === RequestStatusEnum.progress;
    }

    private _requestDayCard() {
        this._store.dispatch(new DayCardActions.Request.One(this._dayCard.id));
    }

    private get _canDelete(): boolean {
        return this._dayCard.permissions.canDelete;
    }

    private _setDropdownItems(): void {
        const items: MenuItem[] = [];

        if (this._canDelete) {
            items.push({
                id: DELETE_DAYCARD_ITEM_ID,
                type: 'button',
                label: 'Daycard_Delete_Label',
            });
        }

        this.dropdownItems = items.length ? [{items}] : [];
    }
}

export interface InfoEntry {
    icon: string;
    text: string | number;
}
