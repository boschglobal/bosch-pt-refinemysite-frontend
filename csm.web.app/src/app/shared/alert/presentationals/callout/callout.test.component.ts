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

import {AlertTypeEnum} from '../../enums/alert-type.enum';

@Component({
    selector: 'ss-callout-test',
    templateUrl: './callout.test.component.html',
})
export class CalloutTestComponent {

    @Input()
    public message: string;

    @Input()
    public type: AlertTypeEnum;

    @Input()
    public preformatted = false;

    @Input()
    public isCloseable = false;
}
