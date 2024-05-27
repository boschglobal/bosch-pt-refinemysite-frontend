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
    selector: 'ss-toolbar-test',
    templateUrl: './toolbar.test.component.html'
})
export class ToolbarTestComponent {
    @Input()
    public toolbarTitle: string;
}
