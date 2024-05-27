/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {
    DAY_CARD_INDICATORS_ICON,
    DAY_CARD_STATUS_UNAVAILABLE
} from '../../constants/day-card-indicators-icon.constant';

@Component({
    selector: 'ss-day-card-indicator',
    templateUrl: './day-card-indicator.component.html',
    styleUrls: ['./day-card-indicator.component.scss']
})
export class DayCardIndicatorComponent {

    @Input()
    public set status(status: string) {
        this.icon = DAY_CARD_INDICATORS_ICON[status];
    }

    public icon: IconModel = DAY_CARD_INDICATORS_ICON[DAY_CARD_STATUS_UNAVAILABLE];
}
