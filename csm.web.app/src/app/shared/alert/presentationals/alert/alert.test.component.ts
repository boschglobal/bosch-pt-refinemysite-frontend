/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {AlertResource} from '../../api/resources/alert.resource';

@Component({
    templateUrl: './alert.test.component.html',
})
export class AlertTestComponent {

    public alert: AlertResource;

    public handleClose(alertId: string): void {
    }
}
