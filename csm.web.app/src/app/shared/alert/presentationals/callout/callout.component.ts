/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {AlertTypeEnum} from '../../enums/alert-type.enum';

@Component({
    selector: 'ss-callout',
    templateUrl: './callout.component.html',
    styleUrls: ['./callout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalloutComponent {
    @Input()
    public type: AlertTypeEnum;

    @Input()
    public message: string;

    @Input()
    public preformatted = false;

    @Input()
    public isCloseable = false;

    @Output()
    public calloutClosed: EventEmitter<void> = new EventEmitter<void>();

    public handleCloseCallout(): void {
        this.calloutClosed.emit();
    }
}
