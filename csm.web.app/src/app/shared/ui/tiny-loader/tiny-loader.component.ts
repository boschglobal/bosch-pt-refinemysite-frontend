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

export type TinyLoaderMode = 'normal' | 'inverted';

@Component({
    selector: 'ss-tiny-loader',
    templateUrl: './tiny-loader.component.html',
    styleUrls: ['./tiny-loader.component.scss']
})
export class TinyLoaderComponent {

    @Input()
    public set mode(mode: TinyLoaderMode) {
        this._setLoaderClasses(mode);
    }

    public modeClasses: Object;

    private _setLoaderClasses(mode: TinyLoaderMode = 'normal'): void {
        this.modeClasses = {
            [`ss-tiny-loader--${mode}`]: true
        };
    }
}
