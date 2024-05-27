/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MenuItemsList} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {SortableListRecord} from '../../../../shared/ui/sortable-list/sortable-list.component';

export class ProjectWorkareaModel implements SortableListRecord {
    public id: string;
    public name: string;
    public position: number;
    public version: number;
    public drag: boolean;
    public dropdownItems: MenuItemsList[];
}
