/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule
    ],
    exports: [
        SharedModule
    ]
})
export class AuthCommonModule {
}
