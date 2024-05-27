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

import {TabPanelComponent} from './tab-panel/tab-panel.component';

@Component({
    templateUrl: 'tab-panels.test.component.html'
})
export class TabPanelsTestComponent {
    @Input() public tabs: TabPanelComponent[];
}
