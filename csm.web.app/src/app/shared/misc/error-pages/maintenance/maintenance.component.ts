/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import {Router} from '@angular/router';

@Component({
    selector: 'ss-maintenance',
    templateUrl: './maintenance.component.html',
    styleUrls: ['./maintenance.component.scss'],
})
export class MaintenanceComponent {

    constructor(private _router: Router) {}

    public navigateToHome(): void {
        this._router.navigate(['']);
    }
}
