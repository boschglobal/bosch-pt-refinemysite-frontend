/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {SelectOption} from '../../ui/forms/input-select-dropdown/input-select-dropdown.component';
import {MenuItemType} from '../../ui/menus/menu-item/menu-item.component';
import {MenuItem} from '../../ui/menus/menu-list/menu-list.component';

export class EnumHelper {

    constructor(private labelPrefix: string, private enumerator: any) {
    }

    public getLabelByKey(key: string) {
        return `${this.labelPrefix}_${key}`;
    }

    public getLabelByValue(value: any) {
        const k = this.getKeyByValue(value).toString();
        return this.getLabelByKey(k);
    }

    public getValues(): any[] {
        return Object.keys(this.enumerator).map(key => this.enumerator[key]);
    }

    public getKeyByValue(value): string | number {
        return Object.keys(this.enumerator).find(key => this.enumerator[key] === value);
    }

    public getSelectOptions(): SelectOption[] {
        return Object.keys(this.enumerator).map(key => ({
            label: this.getLabelByKey(key),
            value: this.enumerator[key],
        } as SelectOption));
    }

    public getMenuItems(type: MenuItemType, groupId?: string): MenuItem[] {
        return Object.keys(this.enumerator)
            .map(key => ({
                type,
                id: key,
                label: this.getLabelByKey(key),
                value: this.enumerator[key],
                groupId: groupId || this.labelPrefix,
            }));
    }
}
