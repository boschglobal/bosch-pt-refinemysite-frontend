/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    ViewEncapsulation
} from '@angular/core';

@Component({
    selector: 'ss-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent {

    @Input() public set percentage(value: number | null) {
        this.showIndeterminateBar = value == null;

        this.percentageValue = Math.min(Math.max(value, 0), 100);
    }

    @Input() public showBarBorder = false;

    public percentageValue: number | null = null;

    public showIndeterminateBar = true;
}
