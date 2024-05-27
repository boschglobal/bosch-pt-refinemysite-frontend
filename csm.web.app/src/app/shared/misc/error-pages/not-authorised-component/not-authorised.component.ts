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
    selector: 'ss-not-authorised',
    templateUrl: './not-authorised.component.html',
    styleUrls: ['./not-authorized.component.scss'],
})
export class NotAuthorisedComponent {

    constructor(private _router: Router) {
    }

    public routeToStartPage(): void {
        this._router.navigate(['']);
    }
}
