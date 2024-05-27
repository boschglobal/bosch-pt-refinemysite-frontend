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

import {DIMENSIONS} from '../constants/dimensions.constant';
import {TrafficLightSettings} from './traffic-light.component';

@Component({
    selector: 'ss-traffic-light-with-label',
    templateUrl: './traffic-light-with-label.component.html',
    styleUrls: ['./traffic-light-with-label.component.scss'],
})

export class TrafficLightWithLabelComponent {
    @Input()
    public value: string | number;

    @Input()
    public settings: TrafficLightWithLabelSettings = {
        valueFormatter: value => value,
        size: DIMENSIONS.base_dimension__x2,
        ranges: []
    };

    public getValue(): any {
        return this.settings.valueFormatter(this.value);
    }
}

export interface TrafficLightWithLabelSettings extends TrafficLightSettings {
    valueFormatter?: (value: string | number) => string | number;
}
