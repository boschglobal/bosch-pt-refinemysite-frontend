/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

@Component({
    selector: 'ss-text-link-test',
    template: '<ss-text-link [text]="text" [maxLength]="textMaxSize"></ss-text-link>',
})
export class TextLinkTestComponent {

    @Input()
    public text: string;

    @Input()
    public textMaxSize?: number = 180;
}
