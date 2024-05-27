/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

@Component({
    selector: 'ss-button-link',
    templateUrl: './button-link.component.html',
    styleUrls: ['./button-link.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonLinkComponent {

    @Input()
    public link: ButtonLink;

    @Input()
    public linkIcon: ButtonLinkIcon | null = DEFAULT_BUTTON_LINK_ICON;
}

export interface ButtonLink {
    label: string;
    action?: Function;
    href?: string;
    hrefNewTab?: boolean;
    routerLink?: any[] | string;
    queryParams?: { [k: string]: any };
}

export interface ButtonLinkIcon {
    name: string;
    rotation?: number;
}

export const DEFAULT_BUTTON_LINK_ICON: ButtonLinkIcon = {
    name: 'arrow',
    rotation: 180,
};
