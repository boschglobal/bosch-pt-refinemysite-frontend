/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgStyle} from '@angular/common';
import {
    Component,
    Input
} from '@angular/core';

@Component({
    selector: 'ss-card-contact',
    templateUrl: './card-contact.component.html',
    styleUrls: ['./card-contact.component.scss'],
})
export class CardContactComponent {
    /**
     * @description Input to get contact information
     */
    @Input() public contact: CardContact;

    /**
     * @description Input to add image styles to special use cases
     * @type NgStyle
     */
    @Input() public imgStyle: NgStyle;

    /**
     * @description Replace phone RegExp to allow type tel
     * @type {RegExp}
     */
    public replacePhone = /\s+/g;

    /**
     * @description Retrieve contact card svg
     * @returns {string}
     */
    public getImage(): string {
        return `url('resources/icons/common/contact.svg')`;
    }

    /**
     * @description Retrieve contact email
     * @returns {string}
     */
    public getEmail(): string {
        return this.contact.email;
    }

    /**
     * @description Retrieve contact phone
     * @returns {string}
     */
    public getPhone(): string {
        return this.contact.phone;
    }

    /**
     * @description Return if anchor should be added to an element
     * @param content
     * @returns {boolean}
     */
    public hasAnchor(content: string): boolean {
        return content.length > 1;
    }
}

export interface CardContact {
    email: string;
    phone: string;
}
