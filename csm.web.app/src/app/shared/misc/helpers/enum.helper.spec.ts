/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {MenuItemType} from '../../ui/menus/menu-item/menu-item.component';
import {MenuItem} from '../../ui/menus/menu-list/menu-list.component';
import {EnumHelper} from './enum.helper';

enum TestEnum {
    KeyOne = 'ValueOne',
    KEYTWO = 'VALUETWO',
    key_three = 'value_three'
}

describe('Enum Helper', () => {

    const prefix = 'TestEnum';
    const groupId = 'TestGroupId';
    const helper = new EnumHelper(prefix, TestEnum);

    it('should set the groupId to the one passed in the parameters when getMenuItems is called', () => {
        const menuItems = helper.getMenuItems('button', groupId);

        menuItems.forEach(menuItem => {
            expect(menuItem.groupId).toBe(groupId);
        });
    });

    it('should set the groupId to the label prefix when then groupId is not passed to the getMenuItems', () => {
        const menuItems = helper.getMenuItems('button');

        menuItems.forEach(menuItem => {
            expect(menuItem.groupId).toBe(prefix);
        });
    });

    it('should get correct label key from the Key', () => {
        expect(helper.getLabelByKey('KeyOne')).toBe(`${prefix}_KeyOne`);
        expect(helper.getLabelByKey('KEYTWO')).toBe(`${prefix}_KEYTWO`);
        expect(helper.getLabelByKey('key_three')).toBe(`${prefix}_key_three`);
    });

    it('should get correct label key from the Value', () => {
        expect(helper.getLabelByValue('ValueOne')).toBe(`${prefix}_KeyOne`);
        expect(helper.getLabelByValue('VALUETWO')).toBe(`${prefix}_KEYTWO`);
        expect(helper.getLabelByValue('value_three')).toBe(`${prefix}_key_three`);
    });

    it('should return all the enum Values', () => {
        expect(helper.getValues()).toEqual(['ValueOne', 'VALUETWO', 'value_three']);
    });

    it('should return a list of select Options', () => {
        expect(helper.getSelectOptions()).toEqual([
            {
                label: `${prefix}_KeyOne`,
                value: 'ValueOne',
            },
            {
                label: `${prefix}_KEYTWO`,
                value: 'VALUETWO',
            },
            {
                label: `${prefix}_key_three`,
                value: 'value_three',
            },
        ]);
    });

    it('should return a list of menu items', () => {
        const type: MenuItemType = 'select';
        const expectedResult: MenuItem[] = [
            {
                type,
                id: 'KeyOne',
                label: `${prefix}_KeyOne`,
                value: 'ValueOne',
                groupId: prefix,
            },
            {
                type,
                id: 'KEYTWO',
                label: `${prefix}_KEYTWO`,
                value: 'VALUETWO',
                groupId: prefix,
            },
            {
                type,
                id: 'key_three',
                label: `${prefix}_key_three`,
                value: 'value_three',
                groupId: prefix,
            },
        ];

        expect(helper.getMenuItems(type)).toEqual(expectedResult);
    });

    it('should return the correct key by value', () => {
        const key = Object.keys(TestEnum)[0];
        expect(helper.getKeyByValue(TestEnum[key])).toBe(key);
    });
});
