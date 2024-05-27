/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {GroupItem} from '../group-item-list/group-item-list.component';
import {
    MenuItem,
    MenuItemsList,
} from '../menus/menu-list/menu-list.component';
import {MultipleSelectionToolbarData} from './group-list-selection.component';

@Component({
    selector: 'ss-group-list-selection-test',
    templateUrl: './group-list-selection.test.component.html',
    styleUrls: ['./group-list-selection.test.component.scss'],
})
export class GroupListSelectionTestComponent {

    public actions: MenuItemsList[] = [];

    public itemsPerGroupItem: number;

    public groups: GroupItem[] = [];

    public multipleSelectionToolbarData: MultipleSelectionToolbarData;

    public title: string;

    public showMessage: boolean;

    public handleDropdownItemClicked(item: MenuItem): void {
    }
}
