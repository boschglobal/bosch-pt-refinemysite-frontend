/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit,
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {AuthService} from '../../../../shared/authentication/services/auth.service';

export const PARAM_HAS_BOSCH_ID = 'hasBoschId';

@Component({
    selector: 'ss-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

    constructor(private _activatedRoute: ActivatedRoute,
                private _authService: AuthService) {
    }

    ngOnInit() {
        this._redirectToCIAM();
    }

    private _redirectToCIAM(): void {
        if (this._activatedRoute.snapshot.queryParamMap.has(PARAM_HAS_BOSCH_ID)) {
            this._authService.login();
        } else {
            this._authService.signup();
        }
    }
}
