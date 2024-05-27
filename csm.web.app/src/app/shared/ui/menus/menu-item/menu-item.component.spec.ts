/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {
    CSS_CLASS_MENU_ITEM_FOCUSED,
    CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE,
    CSS_CLASS_MENU_ITEM_SELECTED,
    MenuItemComponent,
} from './menu-item.component';
import {MenuItemTestComponent} from './menu-item.test.component';

describe('Menu Item Component', () => {
    let testHostComp: MenuItemTestComponent;
    let fixture: ComponentFixture<MenuItemTestComponent>;
    let de: DebugElement;

    const clickEvent = new Event('click');

    const menuItemComponentSelector = 'ss-menu-item';
    const menuItemSelector = '[data-automation="ss-menu-item"]';
    const menuItemIndicatorSelector = '[data-automation="ss-menu-item-indicator"]';
    const menuItemCheckboxSelector = '[data-automation="ss-menu-item-checkbox"]';
    const menuItemRadioButtonSelector = '[data-automation="ss-menu-item-radio-button"]';
    const menuItemIconSelector = '[data-automation="ss-menu-item-icon"]';
    const menuItemCustomContentSelector = '[data-automation="ss-menu-item-custom-content"]';
    const menuItemLabelSelector = '[data-automation="ss-menu-item-label"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            MenuItemComponent,
            MenuItemTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuItemTestComponent);
        testHostComp = fixture.componentInstance;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(menuItemComponentSelector));
    });

    it('should set CSS_CLASS_MENU_ITEM_SELECTED class when menu item is selected', () => {
        testHostComp.selected = true;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(CSS_CLASS_MENU_ITEM_SELECTED);
    });

    it('should not set CSS_CLASS_MENU_ITEM_SELECTED class when menu item isn\'t selected', () => {
        testHostComp.selected = false;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).not.toContain(CSS_CLASS_MENU_ITEM_SELECTED);
    });

    it('should set CSS_CLASS_MENU_ITEM_FOCUSED class when menu item is focused', () => {
        testHostComp.focused = true;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(CSS_CLASS_MENU_ITEM_FOCUSED);
    });

    it('should not set CSS_CLASS_MENU_ITEM_FOCUSED class when menu item isn\'t focused', () => {
        testHostComp.focused = false;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).not.toContain(CSS_CLASS_MENU_ITEM_FOCUSED);
    });

    it('should set CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE class when reserveIndicatorSpace is true', () => {
        testHostComp.reserveIndicatorSpace = true;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE);
    });

    it('should not set CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE class when reserveIndicatorSpace is false', () => {
        testHostComp.reserveIndicatorSpace = false;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).not.toContain(CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE);
    });

    it('should set css class depending on the menu item type', () => {
        const cssClassCheckboxType = 'ss-menu-item--checkbox';
        const cssClassRadioType = 'ss-menu-item--radio';

        testHostComp.type = 'checkbox';
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(cssClassCheckboxType);

        testHostComp.type = 'radio';
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(cssClassRadioType);
    });

    it('should set css class depending on the menu item size', () => {
        const cssClassSmallSize = 'ss-menu-item--small';
        const cssClassTinySize = 'ss-menu-item--tiny';

        testHostComp.size = 'tiny';
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(cssClassTinySize);

        testHostComp.size = 'small';
        fixture.detectChanges();

        expect(getElement(menuItemSelector).classList).toContain(cssClassSmallSize);
    });

    it('should render the menu item with a checkbox when the type is "checkbox"', () => {
        testHostComp.type = 'checkbox';
        fixture.detectChanges();

        expect(getElement(menuItemCheckboxSelector)).toBeTruthy();
    });

    it('should render the menu item with a radio button when the type is "radio"', () => {
        testHostComp.type = 'radio';
        fixture.detectChanges();

        expect(getElement(menuItemRadioButtonSelector)).toBeTruthy();
    });

    it('should render the menu item with a selected icon when the type is "select-icon"', () => {
        testHostComp.type = 'select-icon';
        fixture.detectChanges();

        expect(getElement(menuItemIconSelector)).toBeTruthy();
    });

    it('should render the menu item without any indicator when the type is "button"', () => {
        testHostComp.type = 'button';
        fixture.detectChanges();

        expect(getElement(menuItemIndicatorSelector).childElementCount).toBe(0);
    });

    it('should render the menu item without any indicator when the type is "select"', () => {
        testHostComp.type = 'select';
        fixture.detectChanges();

        expect(getElement(menuItemIndicatorSelector).childElementCount).toBe(0);
    });

    it('should show the selected icon when the menu item is selected', () => {
        testHostComp.type = 'select-icon';
        testHostComp.selected = true;
        fixture.detectChanges();

        expect(getElement(menuItemIconSelector).hidden).toBeFalsy();
    });

    it('should hide the selected icon when the menu item isn\'t selected', () => {
        testHostComp.type = 'select-icon';
        testHostComp.selected = false;
        fixture.detectChanges();

        expect(getElement(menuItemIconSelector).hidden).toBeTruthy();
    });

    it('should mark the menu item as disabled when disabled is true', () => {
        testHostComp.disabled = true;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).attributes['disabled']).toBeTruthy();
    });

    it('should not mark the menu item as disabled when disabled is false', () => {
        testHostComp.disabled = false;
        fixture.detectChanges();

        expect(getElement(menuItemSelector).attributes['disabled']).toBeFalsy();
    });

    it('should render the custom content injected in the menu item', () => {
        testHostComp.customContent = true;
        fixture.detectChanges();

        expect(getElement(menuItemCustomContentSelector).childElementCount).toBe(1);

        testHostComp.customContent = false;
        fixture.detectChanges();

        expect(getElement(menuItemCustomContentSelector).childElementCount).toBe(0);
    });

    it('should render the menu item label when a label is provided', () => {
        const label = 'foo';

        testHostComp.label = label;
        fixture.detectChanges();

        expect(getElement(menuItemLabelSelector).innerText).toBe(label);
    });

    it('should not render the menu item label when no label is provided', () => {
        testHostComp.label = undefined;
        fixture.detectChanges();

        expect(getElement(menuItemLabelSelector)).toBeFalsy();
    });

    it('should reserve the indicator space when CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE class is set', () => {
        const expectedWidth = '24px';
        const expectedMarginRight = '16px';

        testHostComp.reserveIndicatorSpace = true;
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemIndicatorSelector)).width).toBe(expectedWidth);
        expect(getComputedStyle(getElement(menuItemIndicatorSelector)).marginRight).toBe(expectedMarginRight);
    });

    it('should not reserve the indicator space when CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE class isn\'t set ' +
        'and there are no indicator', () => {
        testHostComp.reserveIndicatorSpace = false;
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemIndicatorSelector)).width).toBe('0px');
        expect(getComputedStyle(getElement(menuItemIndicatorSelector)).marginRight).toBe('0px');
    });

    it('should set the custom content right margin to 16px when there are no indicator, reserveIndicatorSpace is set to false' +
        ' and a label is provided', () => {
        const expectedMarginRight = '16px';

        testHostComp.label = 'foo';
        testHostComp.reserveIndicatorSpace = false;
        testHostComp.customContent = true;
        testHostComp.type = 'button';
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemCustomContentSelector)).marginRight).toBe(expectedMarginRight);
    });

    it('should set the custom content right margin to 8px when there are no indicator, reserveIndicatorSpace is set to true ' +
        'and a label is provided', () => {
        const expectedMarginRight = '8px';

        testHostComp.label = 'foo';
        testHostComp.reserveIndicatorSpace = true;
        testHostComp.customContent = true;
        testHostComp.type = 'button';
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemCustomContentSelector)).marginRight).toBe(expectedMarginRight);
    });

    it('should set the custom content right margin to 8px when there are an indicator and a label is provided', () => {
        const expectedMarginRight = '8px';

        testHostComp.label = 'foo';
        testHostComp.customContent = true;
        testHostComp.type = 'checkbox';
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemCustomContentSelector)).marginRight).toBe(expectedMarginRight);
    });

    it('should not set the custom content right margin when a label is not provided', () => {
        const expectedMarginRight = '0px';

        testHostComp.label = undefined;
        testHostComp.customContent = true;
        testHostComp.type = 'checkbox';
        fixture.detectChanges();

        expect(getComputedStyle(getElement(menuItemCustomContentSelector)).marginRight).toBe(expectedMarginRight);
    });

    it('should emit itemClick when menu item isn\'t disabled', () => {
        spyOn(testHostComp, 'handleItemClick').and.callThrough();

        testHostComp.disabled = false;
        fixture.detectChanges();

        getElement(menuItemSelector).dispatchEvent(clickEvent);

        expect(testHostComp.handleItemClick).toHaveBeenCalledWith(clickEvent);
    });

    it('should not emit itemClick when menu item is disabled', () => {
        spyOn(testHostComp, 'handleItemClick').and.callThrough();

        testHostComp.disabled = true;
        fixture.detectChanges();

        getElement(menuItemSelector).dispatchEvent(clickEvent);

        expect(testHostComp.handleItemClick).not.toHaveBeenCalledWith(clickEvent);
    });
});
