/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {ButtonStyle} from '../../../ui/button/button.component';
import {COLORS} from '../../../ui/constants/colors.constant';

export type NoItemsSize = 'small' | 'normal';

export const CSS_CLASSES_NO_ITEMS: { [key in NoItemsSize]: string } = {
    normal: 'ss-no-items--normal',
    small: 'ss-no-items--small',
};
export const ICON_SIZE: { [key in NoItemsSize]: number } = {
    normal: 96,
    small: 64,
};

@Component({
    selector: 'ss-no-items',
    templateUrl: './no-items.component.html',
    styleUrls: ['./no-items.component.scss'],
})
export class NoItemsComponent {

    /**
     * @description Property with button icon
     */
    @Input()
    public buttonIcon: string;

    /**
     * @description Property with button icon color
     */
    @Input()
    public buttonIconColor = COLORS.white;

    /**
     * @description Property with button style
     */
    @Input()
    public buttonStyle: ButtonStyle = 'secondary-black';

    /**
     * @description Property with button text information
     */
    @Input()
    public buttonText: string;

    /**
     * @description Property with description information
     */
    @Input()
    public description: string;

    /**
     * @description Property with icon
     */
    @Input()
    public icon: string;

    /**
     * @description Property to specify if the icon is animated
     */
    @Input()
    public animatedIcon: boolean;

    /**
     * @description Property with the showButton permission
     * @type {boolean}
     */
    @Input()
    public showButton = false;

    /**
     * @description Property with size of the component
     */
    @Input()
    public set size(size: NoItemsSize) {
        this.noItemsClasses = CSS_CLASSES_NO_ITEMS[size];
        this.iconSize = ICON_SIZE[size];
    }

    /**
     * @description Property with title information
     */
    @Input()
    public title: string;

    /**
     * @description Property with the button Event
     */
    @Output()
    public clickButton: EventEmitter<Event> = new EventEmitter<Event>();

    /**
     * @description Color of main icon
     */
    public titleIconColor = COLORS.dark_grey;

    public noItemsClasses = CSS_CLASSES_NO_ITEMS['normal'];

    public iconSize = ICON_SIZE['normal'];
}
