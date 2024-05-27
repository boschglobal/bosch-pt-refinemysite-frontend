/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    HTTP_INTERCEPTORS,
    HttpClientModule
} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {HttpServices} from './interceptor/http-services.interceptor';

@NgModule({
    imports: [
        HttpClientModule
    ],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpServices,
            multi: true,
        }
    ]
})
export class RestModule {}
