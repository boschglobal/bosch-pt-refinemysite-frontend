/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

@Component({
    templateUrl: './description-label.test.component.html',
    styles: [
        ':host {padding: 8px; display: block}',
    ],
})
export class DescriptionLabelTestComponent {

    @Input()
    public description: string;

    @Input()
    public title: string;

}
