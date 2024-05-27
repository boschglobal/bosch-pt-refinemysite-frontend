/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

@Component({
    selector: 'ss-description-label',
    templateUrl: './description-label.component.html',
    styleUrls: ['./description-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescriptionLabelComponent {

    @Input()
    public description: string;

    @Input()
    public title: string;

}
