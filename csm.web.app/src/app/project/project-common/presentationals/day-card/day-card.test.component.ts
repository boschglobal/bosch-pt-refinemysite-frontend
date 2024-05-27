/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {DayCard} from '../../models/day-cards/day-card';

@Component({
    selector: 'ss-day-card-test',
    template: `
        <ss-day-card
            [canMultiSelect]="canMultiSelect"
            [dayCard]="dayCard"
            [hasSelectedItems]="hasSelectedItems"
            [isCopying]="isCopying"
            [isRelevant]="isRelevant"
            [isMultiSelecting]="isMultiSelecting"
            [isSelected]="isSelected"></ss-day-card>`,
})
export class DayCardTestComponent {

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
}
