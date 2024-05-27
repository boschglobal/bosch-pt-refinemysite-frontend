/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {ElementAlignment} from '../../../misc/helpers/element-positioning.helper';
import {
    ButtonSize,
    ButtonStyle
} from '../../button/button.component';
import {COLORS} from '../../constants/colors.constant';
import {MenuItemSize} from '../../menus/menu-item/menu-item.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';

@Component({
    selector: 'ss-menu-dropdown-test',
    templateUrl: './dropdown-menu.test.component.html',
    styles: [
        `ss-dropdown-menu {
            margin-left: 16px;
        }

        span {
            display: block;
            width: 24px;
            height: 24px;
            background: ${COLORS.light_green};
        }`,
    ],
})
export class DropdownMenuTestComponent {

    public buttonNoPadding = true;

    public buttonSize: ButtonSize;

    public buttonStyle: ButtonStyle;

    public closeOnItemClick = true;

    public customContent: boolean;

    public icon: string;

    public items: MenuItemsList[] = [];

    public itemsAlignment: ElementAlignment;

    public label: string;

    public menuItemSize: MenuItemSize;

    public title = '';

    public handleItemClicked(item: MenuItem): void {
    }

    public handleItemsChange(items: MenuItemsList[]): void {
    }
}
