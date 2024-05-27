/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {
    ButtonLink,
    ButtonLinkIcon,
    DEFAULT_BUTTON_LINK_ICON,
} from './button-link.component';

@Component({
    selector: 'ss-button-test-link',
    template: '<ss-button-link [link]="link" [linkIcon]="linkIcon"></ss-button-link>',
})
export class ButtonLinkTestComponent {

    @Input()
    public link: ButtonLink;

    @Input()
    public linkIcon: ButtonLinkIcon | null = DEFAULT_BUTTON_LINK_ICON;
}
