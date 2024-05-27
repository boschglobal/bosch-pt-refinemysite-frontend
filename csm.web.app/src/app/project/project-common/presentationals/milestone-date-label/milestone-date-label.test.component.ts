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
import * as moment from 'moment';

@Component({
    templateUrl: './milestone-date-label.test.component.html',
    styles: [
        ':host {padding: 8px; display: block}',
    ],
})
export class MilestoneDateLabelTestComponent {

    @Input()
    public date: moment.Moment;

}
