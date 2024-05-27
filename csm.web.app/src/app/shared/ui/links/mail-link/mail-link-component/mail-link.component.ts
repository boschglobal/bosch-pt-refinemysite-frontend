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
    selector: 'ss-mail-link',
    templateUrl: './mail-link.component.html',
    styleUrls: ['./mail-link.component.scss'],
})
export class MailLinkComponent {
    /**
     * @description Message to display on the link
     * @type {string}
     */
    @Input() public text: string;

    /**
     * @description Recipient e-mail
     * @type {string}
     */
    @Input() public email: string;

    /**
     * @description Input to define if the icon should be shown
     * @type {boolean}
     */
    @Input() public showIcon: boolean;

    /**
     * @description Sets CC e-mails
     * @param cc
     */
    @Input() public set cc(cc: string) {
        this._cc = cc;
    }

    /**
     * @description Sets BCC e-mails
     * @param bcc
     */
    @Input() public set bcc(bcc: string) {
        this._bcc = bcc;
    }

    /**
     * @description Sets subject of the e-mail
     * @param subject
     */
    @Input() public set subject(subject: string) {
        this._subject = subject;
    }

    /**
     * @description Sets body of the e-mail
     * @param body
     */
    @Input() public set body(body: string) {
        this._body = body;
    }

    public iconColor = COLORS.dark_grey_75;

    /**
     * @description Retrieves CC url part
     * @returns {string}
     */
    public get cc(): string {
        return this._cc ? `cc=${encodeURIComponent(this._cc)}&` : '';
    }

    /**
     * @description Retrieves BCC url part
     * @returns {string}
     */
    public get bcc(): string {
        return this._bcc ? `bcc=${encodeURIComponent(this._bcc)}&` : '';
    }

    /**
     * @description Retrieves subject url part
     * @returns {string}
     */
    public get subject(): string {
        return this._subject ? `subject=${encodeURIComponent(this._subject)}&` : '';
    }

    /**
     * @description Retrieves body url part
     * @returns {string}
     */
    public get body(): string {
        return this._body ? `body=${encodeURIComponent(this._body)}` : '';
    }

    private _body: string;
    private _cc: string;
    private _bcc: string;
    private _subject: string;

    /**
     * @description Retrieves full email url
     * @returns {string}
     */
    public getLink(): string {
        return `mailto:${encodeURIComponent(this.email)}?${this.cc}${this.bcc}${this.subject}${this.body}`;
    }

    /**
     * @description Retrieves link text
     * @returns {string}
     */
    public getLinkText(): string {
        return this.text || this.email;
    }
}
