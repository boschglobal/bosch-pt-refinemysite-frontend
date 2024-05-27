/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {AuthService} from '../../../../shared/auth/auth.service';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    /**
     * @description Define the icon user color
     * @type {string}
     */
    public userColor: string = COLORS.dark_grey;
    public userIconSrc = `../../../../../assets/images/user/user.svg`;

    constructor(private _authService: AuthService) {
    }

    /**
     * @description Trigger the auth service login method to proceed with login
     */
    public login(): void {
        this._authService.login();
    }
}
