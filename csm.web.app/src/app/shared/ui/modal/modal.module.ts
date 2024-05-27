/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {IconModule} from '../icons/icon.module';
import {ModalComponent} from './containers/modal-component/modal.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
    ],
    declarations: [
        ModalComponent,
    ],
    exports: [
        ModalComponent,
    ],
})
export class ModalModule {}
