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

import {ElementAlignment} from '../../../misc/helpers/element-positioning.helper';
import {ButtonStyle} from '../../button/button.component';
import {COLORS} from '../../constants/colors.constant';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';
import {DropdownSelectSize} from './dropdown-select.component';

@Component({
    selector: 'ss-scope-dropdown-test',
    templateUrl: './dropdown-select.test.component.html',
    styles: [
        `::ng-deep body {
            background-color: ${COLORS.light_grey_12_5};
        }

        ss-dropdown-select {
            margin-left: 16px;
        }`,
    ],
})
export class DropdownSelectTestComponent {

    @ViewChild('customFigureTemplate', {static: true})
    public customFigureTemplate: TemplateRef<any>;

    public buttonStyle: ButtonStyle;

    public customContent: boolean;

    public icon: string;

    public items: MenuItemsList[] = [];

    public itemsAlignment: ElementAlignment;

    public size: DropdownSelectSize;

    public handleItemClicked(item: MenuItem): void {
    }
}
