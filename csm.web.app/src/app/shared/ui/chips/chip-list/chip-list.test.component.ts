/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {Chip} from '../chip/chip.component';

@Component({
    templateUrl: './chip-list.test.component.html',
})
export class ChipListTestComponent {

    @Input()
    public items: Chip[] = [];

    @Input()
    public listLabel: string;

    @Input()
    public maxChipsToShow = 6;

    @Input()
    public removeAllLabel: string;

    @Input()
    public showRemoveAll = true;
}
