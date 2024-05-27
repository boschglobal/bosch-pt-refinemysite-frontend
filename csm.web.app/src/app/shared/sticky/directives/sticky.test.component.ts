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
    templateUrl: 'sticky.test.component.html',
    styleUrls: ['./sticky.test.component.scss']
})
export class StickyTestComponent {
    @Input()
    public stickyElements: any[];

    @Input()
    public spacerHeight = '1500px';

    @Input()
    public elementHeight = '50px';
}
