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

import {COLORS} from '../../../constants/colors.constant';

@Component({
    selector: 'ss-phone-link',
    templateUrl: './phone-link.component.html',
    styleUrls: ['./phone-link.component.scss'],
})
export class PhoneLinkComponent {
    /**
     * @description Telephone number to call
     * @type {string}
     */
    @Input() public phone: string;

    /**
     * @description Input to define if the icon should be shown
     * @type {boolean}
     */
    @Input() public showIcon: boolean;

    /**
     * @description Message to display on the link
     * @type {string}
     */
    @Input() public text: string;

    public iconColor = COLORS.dark_grey_75;

    private _whiteSpace = /\s+/g;

    /**
     * @description Retrieves full telephone url
     * @returns {string}
     */
    public getLink(): string {
        return `tel:${this.phone.replace(this._whiteSpace, '')}`;
    }

    /**
     * @description Retrieves link text
     * @returns {string}
     */
    public getLinkText(): string {
        return this.text || this.phone;
    }
}
