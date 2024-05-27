/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnInit
} from '@angular/core';

@Component({
    selector: 'ss-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
    /**
     * @description Property that has default background image
     * @type {string}
     */
    public backgroundImage: string;

    /**
     * @description Property with source path of brand identifier
     * @type {string}
     */
    public srcBrandIdentifier: string;

    /**
     * @description Property with css class brand identifier
     * @type {string}
     */
    public classBrandIdentifier: string;

    ngOnInit() {
        this._setBackgroundImage();
    }

    private _setBackgroundImage(): void {
        const image: number = Math.floor(Math.random() * 2) + 1;
        this.backgroundImage = `url('/assets/images/background/${image}.jpg')`;
    }
}
