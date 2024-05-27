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

import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-constraint-info-header',
    templateUrl: './constraint-info-header.component.html',
    styleUrls: ['./constraint-info-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstraintInfoHeaderComponent {

    @Input()
    public activeItems: number;

    @Input()
    public totalItems: number;

    public iconColor = COLORS.dark_blue;
}
