/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {AuthService} from '../../../../shared/authentication/services/auth.service';

@Component({
    selector: 'ss-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    constructor(private _authService: AuthService) {
    }

    /**
     * @description Trigger the auth service login method to proceed with login
     */
    public login(): void {
        this._authService.login();
    }
}
