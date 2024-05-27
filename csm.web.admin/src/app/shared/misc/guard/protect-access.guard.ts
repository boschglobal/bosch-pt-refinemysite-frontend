/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Router} from '@angular/router';
import {NOT_AUTHORISED_ROUTE} from '../../../app-routes';


export class ProtectAccessGuard {

    private _myRouter: Router;

    constructor(myRouter: Router) {
        this._myRouter = myRouter;
    }

    protected _handleUnauthorized(): void {
        this._myRouter.navigate([`/unauthorized`]);
    }
}
