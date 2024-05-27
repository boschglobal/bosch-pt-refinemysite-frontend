/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';

import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {DAY_CARD_STATUS_ICON} from '../../constants/day-card-status-icon.constant';
import {DayCardStatusEnum} from '../../enums/day-card-status.enum';
import {DayCard} from '../../models/day-cards/day-card';

export const CSS_CLASS_DAY_CARD_COPYING = 'ss-day-card--copying';
export const CSS_CLASS_DAY_CARD_MOVABLE = 'ss-day-card--movable';
export const CSS_CLASS_DAY_CARD_RELEVANT = 'ss-day-card--relevant';
export const CSS_CLASS_DAY_CARD_SELECTED = 'ss-day-card--selected';
export const CSS_CLASS_DAY_CARD_MULTI_SELECTING = 'ss-day-card--multi-selecting';
export const CSS_CLASS_DAY_CARD_HAS_SELECTED_ITEMS = 'ss-day-card--has-selected-items';
export const CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT = 'ss-day-card--can-multi-select';

@Component({
    selector: 'ss-day-card',
    templateUrl: './day-card.component.html',
    styleUrls: ['./day-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DayCardComponent implements OnChanges {

    @Input()
    public canMultiSelect: boolean;

    @Input()
    public dayCard: DayCard;

    @Input()
    public hasSelectedItems: boolean;

    @Input()
    public isCopying: boolean;

    @Input()
    public isRelevant: boolean;

    @Input()
    public isSelected: boolean;

    @Input()
    public isMultiSelecting: boolean;

    public cardClasses: Object;

    public canShowDayCardStatusIcon: boolean;

    public dayCardStatusIcon: IconModel;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.dayCard) {
            this._setCanShowDayCardStatusIcon();
            this._setDayCardStatusIcon();
        }
        this._setCardClasses();
    }

    private _setCardClasses(): void {
        const isCopying = this.isCopying && this.isRelevant;
        const isMultiSelecting = this.isMultiSelecting || this.hasSelectedItems;

        this.cardClasses = {
            [CSS_CLASS_DAY_CARD_COPYING]: isCopying,
            [CSS_CLASS_DAY_CARD_MOVABLE]: !isCopying && this.dayCard.permissions.canUpdate && !isMultiSelecting,
            [CSS_CLASS_DAY_CARD_MULTI_SELECTING]: this.isMultiSelecting,
            [CSS_CLASS_DAY_CARD_HAS_SELECTED_ITEMS]: this.hasSelectedItems,
            [CSS_CLASS_DAY_CARD_RELEVANT]: this.isRelevant,
            [CSS_CLASS_DAY_CARD_SELECTED]: this.isSelected,
            [CSS_CLASS_DAY_CARD_CAN_MULTI_SELECT]: this.canMultiSelect,
        };
    }

    private _setCanShowDayCardStatusIcon(): void {
        this.canShowDayCardStatusIcon = this.dayCard.status !== DayCardStatusEnum.Open;
    }

    private _setDayCardStatusIcon(): void {
        this.dayCardStatusIcon = DAY_CARD_STATUS_ICON[this.dayCard.status];
    }
}
