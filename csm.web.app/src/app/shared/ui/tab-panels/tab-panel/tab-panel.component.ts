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

@Component({
    selector: 'ss-tab-panel',
    templateUrl: './tab-panel.component.html',
    styleUrls: ['./tab-panel.component.scss']
})
export class TabPanelComponent {
    /**
     * @description Title of the tab
     * @type {string}
     */
    @Input() public title: string;

    /**
     * @description Icon of tab
     * @type {string}
     */
    @Input() public icon: string;

    /**
     * @description Active state of the tab
     * @type {boolean}
     */
    @Input() public active = false;

    /**
     * @description Disabled state of the tab
     * @type {boolean}
     */
    @Input() public disabled = false;

    /**
     * @description Tab alignment
     * @type {TabAlignment}
     */
    @Input() public alignment: TabAlignment = 'left';

    /**
     * @description  id of tab
     * @type {string}
     */
    @Input() public id: string;
}

type TabAlignment = 'right' | 'left';
