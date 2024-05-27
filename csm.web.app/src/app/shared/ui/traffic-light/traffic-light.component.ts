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

export const CSS_CLASS_TRAFFIC_LIGHT_EMPTY = 'ss-traffic-light--empty';

@Component({
    selector: 'ss-traffic-light',
    templateUrl: './traffic-light.component.html',
    styleUrls: ['./traffic-light.component.scss']
})

export class TrafficLightComponent {
    @Input()
    public value: number;

    @Input()
    public settings: TrafficLightSettings = {
        size: DIMENSIONS.base_dimension__x2,
        ranges: []
    };

    public getClasses(): Object {
        return {
            [CSS_CLASS_TRAFFIC_LIGHT_EMPTY]: this._isTrafficLightEmpty()
        };
    }

    public getFillColor(): string {
        const range = this._getRangeByValue(this.value);
        return range ? range.color : null;
    }

    public getStyles(): object {
        return {
            'width': `${this._getSize()}px`,
            'height': `${this._getSize()}px`,
        };
    }

    private _isTrafficLightEmpty(): boolean {
        return this.value === null;
    }

    private _getRangeByValue(value: number): TrafficLightSettingsRange {
        const ranges = this.settings ? this.settings.ranges : [];
        return ranges.find(item => item.min <= value && value <= item.max);
    }

    private _getSize(): number {
        return this.settings.size || DIMENSIONS.base_dimension__x2;
    }

}

export interface TrafficLightSettings {
    size?: number;
    ranges: TrafficLightSettingsRange[];
}

export interface TrafficLightSettingsRange {
    min: number;
    max: number;
    color: string;
}
