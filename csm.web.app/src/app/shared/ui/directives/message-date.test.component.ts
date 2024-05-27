/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import * as moment from 'moment';

@Component({
    templateUrl: './message-date.test.component.html'
})
export class MessageDateTestComponent {
    public date = moment().toDate();
}
