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
    Output
} from '@angular/core';

@Component({
    selector: 'ss-generic-dashboard-tile',
    templateUrl: './generic-dashboard-tile.component.html',
    styleUrls: ['./generic-dashboard-tile.component.scss']
})
export class GenericDashboardTileComponent {

    /**
     * @description Defines the title of the tile
     * @type {string}
     */
    @Input()
    public title: string;

    /**
     * @description Defines the left bottom statistic
     * @type {number | string}
     */
    @Input()
    public statistic: number | string;

    /**
     * @description Defines the left bottom statistic label
     * @type {string}
     */
    @Input()
    public statisticLabel: string;

    /**
     * @description Defines the icon
     * @type {string}
     */
    @Input()
    public icon: string;

    /**
     * @description Triggered when card is clicked
     * @type {EventEmitter<Object>}
     */
    @Output()
    public tileClick: EventEmitter<void> = new EventEmitter<void>();

    /**
     * @description Triggered when card is clicked
     * @type {EventEmitter<Object>}
     */
    @Output()
    public statisticClick: EventEmitter<void> = new EventEmitter<void>();
}
