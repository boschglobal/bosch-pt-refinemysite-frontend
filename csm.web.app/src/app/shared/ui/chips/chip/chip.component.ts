/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
    TemplateRef
} from '@angular/core';

import {IconModel} from '../../icons/icon.component';

@Component({
    selector: 'ss-chip',
    templateUrl: './chip.component.html',
    styleUrls: ['./chip.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChipComponent {

    /**
     * @description Property with chip state
     * @type Chip
     */
    @Input()
    public item: Chip;

    /**
     * @description Emits when chip is removed
     * @type {EventEmitter}
     */
    @Output()
    public remove: EventEmitter<Chip> = new EventEmitter<Chip>();

    /**
     * @description Triggered when remove chip is clicked
     * @param {Chip} item
     */
    public removeChip(item: Chip): void {
        this.remove.emit(item);
    }
}

export interface Chip<I = string> {
    id: I;
    text: string;
    customVisualContent?: ChipCustomVisualContent;
    icon?: IconModel;
    imageUrl?: string;
}

export interface ChipCustomVisualContent {
    template: TemplateRef<any>;
    data?: any;
}
