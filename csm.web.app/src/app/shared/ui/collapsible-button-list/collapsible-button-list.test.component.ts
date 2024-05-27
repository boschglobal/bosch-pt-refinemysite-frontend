/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

@Component({
    selector: 'ss-collapsible-button-list-test',
    templateUrl: './collapsible-button-list.test.component.html',
    styles: [`
        :host {
            display: block;
            padding: 8px;
        }

        ss-collapsible-button-list {
            display: flex;
            flex: 1;
            justify-content: flex-end;
        }
    `],
})
export class CollapsibleButtonListTestComponent {

    public buttonClick(event: Event): void {
    }
}
