/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {ModalSize} from './modal.component';

@Component({
    template: `
        <ss-modal [id]="id"
                  [isOpened]="isOpened"
                  [title]="title"
                  [size]="size"
                  [closeable]="closeable"></ss-modal>`,
})
export class ModalTestComponent {
    @Input()
    public isOpened: boolean;

    @Input()
    public title: string;

    @Input()
    public id: string;

    @Input()
    public size: ModalSize;

    @Input()
    public closeable = true;

}
