/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';

@NgModule({
    providers: [
        CookieService,
    ],
})
export class CookieModule {
}
