/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {ElementAlignment} from '../../../misc/helpers/element-positioning.helper';
import {ButtonStyle} from '../../button/button.component';
import {COLORS} from '../../constants/colors.constant';
import {InputCheckboxNestedOption} from '../../forms/input-checkbox-nested/input-checkbox-nested.component';
import {DropdownSelectSize} from './dropdown-multiple-select.component';

@Component({
    selector: 'ss-scope-dropdown-multiple-test',
    templateUrl: './dropdown-multiple-select.test.component.html',
    styles: [
        `::ng-deep body {
            background-color: ${COLORS.light_grey_12_5};
        }`,
    ],
})
export class DropdownMultiSelectTestComponent {

    public hasSelectAllOption: boolean;

    public buttonStyle: ButtonStyle;

    public label: string;

    public icon: string;

    public options: InputCheckboxNestedOption[];

    public selectAllTextKey: string;

    public showBadge: boolean;

    public itemsAlignment: ElementAlignment;

    public size: DropdownSelectSize;
}
