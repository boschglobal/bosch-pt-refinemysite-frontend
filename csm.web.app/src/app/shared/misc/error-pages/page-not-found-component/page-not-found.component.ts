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
    selector: 'ss-page-not-found',
    templateUrl: './page-not-found.component.html',
    styleUrls: ['./page-not-found.component.scss'],
})
export class PageNotFoundComponent {
    constructor(private _router: Router) {
    }

    public routeToStartPage(): void {
        this._router.navigate(['']);
    }
}
