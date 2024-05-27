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

@Component({
    templateUrl: './background-image.test.component.html',
})
export class BackgroundImageTestComponent {
    @Input()
    public link = '';
}
