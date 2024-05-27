/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {COLORS} from '../../constants/colors.constant';
import {
    MenuItemSize,
    MenuItemType,
} from './menu-item.component';

@Component({
    selector: 'ss-menu-item-test',
    templateUrl: './menu-item.test.component.html',
    styles: [
        `::ng-deep body {
            background-color: ${COLORS.light_grey_12_5};
        }`,
        `ss-menu-item {
            display: inline-block;
        }`,
        `span {
            display: inline-block;
            width: 24px;
            height: 24px;
            background: ${COLORS.light_green};
        }`,
    ],
})
export class MenuItemTestComponent {

    public customContent: boolean;

    public focused: boolean;

    public disabled: boolean;

    public label: string;

    public reserveIndicatorSpace: boolean;

    public selected: boolean;

    public selectedIcon: string;

    public size: MenuItemSize;

    public type: MenuItemType;

    public handleItemClick(event: Event): void {
    }
}
