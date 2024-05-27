/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    TemplateRef,
    ViewChild,
} from '@angular/core';

import {COLORS} from '../../constants/colors.constant';
import {MenuItemSize} from '../menu-item/menu-item.component';
import {
    MenuItem,
    MenuItemsList,
} from './menu-list.component';

@Component({
    selector: 'ss-menu-list-test',
    templateUrl: './menu-list.test.component.html',
    styles: [
        `::ng-deep body {
            background-color: ${COLORS.light_grey_12_5};
        }

        ss-menu-list {
            width: fit-content;
        }`,
    ],
})
export class MenuListTestComponent {

    @ViewChild('customFigureTemplate', {static: true})
    public customFigureTemplate: TemplateRef<any>;

    public customContent: boolean;

    public size: MenuItemSize;

    public itemsList: MenuItem[] | MenuItemsList[];

    public restrictedHeight: boolean;

    public handleItemClicked(item: MenuItem): void {
    }

    public handleItemHovered(item: MenuItem | null): void {
    }

    public handleItemsListChange(itemsList: MenuItemsList[] | MenuItem[]): void {
    }
}
