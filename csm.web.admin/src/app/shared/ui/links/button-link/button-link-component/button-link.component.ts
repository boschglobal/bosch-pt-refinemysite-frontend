/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

@Component({
    selector: 'ss-button-link',
    templateUrl: './button-link.component.html',
    styleUrls: ['./button-link.component.scss']
})
export class ButtonLinkComponent {

    /**
     * @description Link configuration
     * @type {ButtonLink}
     */
    @Input() public link: ButtonLink;

    /**
     * @description Variable that flags the arrow to be visible
     * @type {boolean}
     */
    @Input() public showArrow = true;

    /**
     * @description Retrieves link text
     * @returns {string}
     */
    public get getLinkText(): string {
        return this.link.label;
    }

    /**
     * @description Retrieves link action
     * @returns {Function}
     */
    public getLinkAction(): Function {
        return this.link.action();
    }

    /**
     * @description Retrieves router link
     * @returns {any[] | string}
     */
    public getRouterLink(): any[] | string {
        return this.link.routerLink;
    }

    /**
     * @description Retrieves router query parameters
     * @returns {[k: string]: any}
     */
    public getQueryParams(): { [k: string]: any } {
        return this.link.queryParams;
    }

    /**
     * @description Verifies if it is a action button
     * @returns {boolean}
     */
    public isActionButton(): boolean {
        return this.link && !!this.link.action;
    }

    /**
     * @description Verifies if it is a link button
     * @returns {boolean}
     */
    public isLinkButton(): boolean {
        return this.link && !!this.link.routerLink;
    }
}

export interface ButtonLink {
    label: string;
    action?: Function;
    routerLink?: any[] | string;
    queryParams?: { [k: string]: any };
}
