/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {ButtonLink} from '../../../ui/links/button-link/button-link.component';

@Component({
    selector: 'ss-generic-banner',
    templateUrl: './generic-banner.component.html',
    styleUrls: ['./generic-banner.component.scss'],
})
export class GenericBannerComponent {
    /**
     * @description Input for banner title
     */
    @Input()
    public title: string;

    /**
     * @description Input for banner subtitle
     */
    @Input()
    public subtitle: string;

    /**
     * @description Input for banner description
     */
    @Input()
    public description: string;

    /**
     * @description Input for banner picture
     */
    @Input()
    public picture: string;

    /**
     * @description Input for banner link
     */
    @Input()
    public link: ButtonLink;

    /**
     * @description Input for showing full description
     */
    @Input()
    public showFullDescription = false;

    /**
     * @description Input for showing border on picture
     */
    @Input()
    public isPictureBorder = false;
}
