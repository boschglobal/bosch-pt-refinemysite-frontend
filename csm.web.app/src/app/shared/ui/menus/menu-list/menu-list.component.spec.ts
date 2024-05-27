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
import {TranslateService} from '@ngx-translate/core';

import {setEventKey} from '../../../../../test/helpers';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {TranslationModule} from '../../../translation/translation.module';
import {MenuItemType} from '../menu-item/menu-item.component';
import {
    MenuItem,
    MenuListComponent,
    ParsedMenuItem,
    ParsedMenuItemsList,
} from './menu-list.component';
import {MenuListTestComponent} from './menu-list.test.component';

interface MenuItemCustomizableParams {
    id?: string;
    type?: MenuItemType;
    groupId?: string;
    selected?: boolean;
    customData?: any;
    label?: string;
    unsearchable?: boolean;
}

interface ParsedMenuItemCustomizableParams extends MenuItemCustomizableParams {
    index: number;
}

describe('Menu List Component', () => {
    let testHostComp: MenuListTestComponent;
    let comp: MenuListComponent;
    let fixture: ComponentFixture<MenuListTestComponent>;
    let de: DebugElement;
    let translateService: TranslateService;

    const menuListComponentSelector = 'ss-menu-list';
    const menuListSeparatorSelector = '[data-automation="ss-menu-list-separator"]';
    const menuListTitleSelector = '[data-automation="ss-menu-list-title"]';
    const menuListSublistSelector = '[data-automation="ss-menu-list-sub-list"]';
    const clickEvent = new Event('click');
    const keydownEvent = new KeyboardEvent('keydown');
    const mouseenterEvent = new KeyboardEvent('mouseenter');
    const mouseleaveEvent = new KeyboardEvent('mouseleave');

    const pressKey = (key: KeyEnum | string): void => {
        setEventKey(keydownEvent, key);
        document.dispatchEvent(keydownEvent);
    };
    const getCustomizedMenuItem = (item: MenuItem, customizableParams: MenuItemCustomizableParams): MenuItem => {
        const {id, type, groupId, selected, customData, label, unsearchable} = customizableParams;

        return {
            ...item,
            ...id !== undefined ? {id} : {},
            ...type !== undefined ? {type} : {},
            ...groupId !== undefined ? {groupId} : {},
            ...selected !== undefined ? {selected} : {},
            ...customData !== undefined ? {customData} : {},
            ...label !== undefined ? {label} : {},
            ...unsearchable !== undefined ? {unsearchable} : {},
        };
    };

    const getCustomizedParsedMenuItem = (item: MenuItem, customizableParams: ParsedMenuItemCustomizableParams): ParsedMenuItem => {
        const index = customizableParams.index;

        return {
            ...getCustomizedMenuItem(item, customizableParams),
            index,
        };
    };

    const mockMenuItemButton: MenuItem = {
        id: 'item-1',
        label: 'Item 1',
        type: 'button',
        selected: undefined,
    };

    const mockMenuItemCheckbox1 = getCustomizedMenuItem(mockMenuItemButton, {id: 'item-1', type: 'checkbox', selected: false});
    const mockMenuItemCheckbox2 = getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2', type: 'checkbox', selected: false});
    const mockMenuItemRadio1 = getCustomizedMenuItem(mockMenuItemCheckbox1, {type: 'radio', groupId: 'group-1'});
    const mockMenuItemRadio2 = getCustomizedMenuItem(mockMenuItemCheckbox2, {type: 'radio', groupId: 'group-1'});
    const mockMenuItemSelect1 = getCustomizedMenuItem(mockMenuItemRadio1, {type: 'select'});
    const mockMenuItemSelect2 = getCustomizedMenuItem(mockMenuItemRadio2, {type: 'select'});
    const mockMenuItemSelectIcon1 = getCustomizedMenuItem(mockMenuItemRadio1, {type: 'select-icon'});
    const mockMenuItemSelectIcon2 = getCustomizedMenuItem(mockMenuItemRadio2, {type: 'select-icon'});

    const getMenuListItemSelector = (itemIndex: number): string => `[data-automation="ss-menu-list-item-${itemIndex}"]`;
    const getMenuSublistSelector = (listIndex: number): string =>
        `[data-automation="ss-menu-list-${listIndex}"] > ${menuListSublistSelector}`;
    const getMenuListTitleSelector = (listIndex: number): string =>
        `[data-automation="ss-menu-list-${listIndex}"] > ${menuListTitleSelector}`;
    const getMenuListSeparatorSelector = (listIndex: number): string =>
        `[data-automation="ss-menu-list-${listIndex}"] > ${menuListSeparatorSelector}`;
    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule,
        ],
        providers: [
            {
                provide: TranslateService,
                useValue: new TranslateServiceStub(),
            },
        ],
        declarations: [
            MenuListComponent,
            MenuListTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MenuListTestComponent);
        testHostComp = fixture.componentInstance;
        translateService = TestBed.inject(TranslateService);
        testHostComp.itemsList = [];
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(menuListComponentSelector));
        comp = de.componentInstance;
    });

    it('should parse the provided items list and enhance it with the index of the item', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [
            {
                id: `${mockMenuItemButton.id}-${mockMenuItemButton.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0}),
                    getCustomizedParsedMenuItem(mockMenuItemButton, {index: 1}),
                ],
            },
            {
                id: mockMenuItemButton.id,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemButton, {index: 2}),
                ],
            },
        ];

        testHostComp.itemsList = [
            {
                items: [
                    mockMenuItemButton,
                    mockMenuItemButton,
                ],
            },
            {
                items: [mockMenuItemButton],
            },
        ];
        fixture.detectChanges();

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should parse the provided items when a single list of items is provided', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [
            {
                id: `${mockMenuItemButton.id}-${mockMenuItemButton.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0}),
                    getCustomizedParsedMenuItem(mockMenuItemButton, {index: 1}),
                ],
            },
        ];

        testHostComp.itemsList = [
            mockMenuItemButton,
            mockMenuItemButton,
        ];
        fixture.detectChanges();

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should parse the provided items when an empty list of items is provided', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [];

        testHostComp.itemsList = [
            {items: []},
        ];
        fixture.detectChanges();

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should parse the provided items as empty list when a undefined list of items is provided', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [];

        testHostComp.itemsList = undefined;
        fixture.detectChanges();

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should parse the provided items and translate the labels that are provided', () => {
        const label = 'foo';

        spyOn(translateService, 'instant').and.callThrough();

        testHostComp.itemsList = [
            getCustomizedMenuItem(mockMenuItemButton, {label: null}),
            getCustomizedMenuItem(mockMenuItemButton, {label}),
        ];
        fixture.detectChanges();

        expect(translateService.instant).toHaveBeenCalledTimes(1);
        expect(translateService.instant).toHaveBeenCalledWith(label);
    });

    it('should show the list separator when the separator is set to true and the list is not the last one', () => {
        testHostComp.itemsList = [
            {
                items: [mockMenuItemButton],
                separator: true,
            },
            {
                items: [mockMenuItemButton],
            },
        ];
        fixture.detectChanges();

        expect(getElement(getMenuListSeparatorSelector(0))).toBeTruthy();
        expect(getComputedStyle(getElement(getMenuListSeparatorSelector(0))).height).toBe('1px');
    });

    it('should not show the list separator when the separator is set to true and the list is the last one', () => {
        testHostComp.itemsList = [
            {
                items: [mockMenuItemButton],
            },
            {
                separator: true,
                items: [mockMenuItemButton],
            },
        ];
        fixture.detectChanges();

        expect(getElement(getMenuListSeparatorSelector(1))).toBeTruthy();
        expect(getComputedStyle(getElement(getMenuListSeparatorSelector(1))).height).not.toBe('1px');
    });

    it('should not show the list separator when the separator is set to false', () => {
        testHostComp.itemsList = [
            {
                items: [mockMenuItemButton],
            },
            {
                items: [mockMenuItemButton],
            },
        ];
        fixture.detectChanges();

        expect(getElement(getMenuListSeparatorSelector(1))).toBeFalsy();
    });

    it('should render the list title when the list has title', () => {
        const title = 'Foo';

        testHostComp.itemsList = [{
            title,
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        expect(getElement(getMenuListTitleSelector(0)).innerText).toBe(title);
    });

    it('should not render the list title when the list doesn\'t have title', () => {
        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        expect(getElement(getMenuListTitleSelector(0))).toBeFalsy();
    });

    it('should inject the custom figure to the menu item when the list has the template of the custom figure', () => {
        testHostComp.itemsList = [{
            customFigureTemplate: testHostComp.customFigureTemplate,
            items: [
                getCustomizedMenuItem(mockMenuItemButton, {customData: 'yellow'}),
            ],
        }];
        fixture.detectChanges();

        expect(getElement(getMenuListItemSelector(0)).childElementCount).toBe(1);
    });

    it('should not inject the custom figure to the menu item when the list doesn\'t have the template of the custom figure', () => {
        testHostComp.itemsList = [{
            items: [
                getCustomizedMenuItem(mockMenuItemButton, {customData: 'yellow'}),
            ],
        }];
        fixture.detectChanges();

        expect(getElement(getMenuListItemSelector(0)).childElementCount).toBe(0);
    });

    it('should emit itemClicked when an item was clicked', () => {
        const parsedMockMenuItemButton = getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0});
        spyOn(comp.itemClicked, 'emit').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemButton);

        expect(comp.itemClicked.emit).toHaveBeenCalledWith(parsedMockMenuItemButton);
    });

    it('should emit itemsListChange when an item was clicked', () => {
        const expectedItemsListChangePayload: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemCheckbox1.id}-${mockMenuItemCheckbox2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemCheckbox1, {index: 0, selected: true}),
                getCustomizedParsedMenuItem(mockMenuItemCheckbox2, {index: 1}),
            ],
        }];
        const parsedMockMenuItemCheckbox1 = expectedItemsListChangePayload[0].items[0];

        spyOn(comp.itemsListChange, 'emit').and.callThrough();

        testHostComp.itemsList = [{
            items: [
                mockMenuItemCheckbox1,
                mockMenuItemCheckbox2,
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemCheckbox1);

        expect(comp.itemsListChange.emit).toHaveBeenCalledWith(expectedItemsListChangePayload);
    });

    it('should emit itemsListChange when an item was clicked and a single list of items was provided', () => {
        const expectedItemsListChangePayload: ParsedMenuItem[] = [
            getCustomizedParsedMenuItem(mockMenuItemCheckbox1, {index: 0, selected: true}),
            getCustomizedParsedMenuItem(mockMenuItemCheckbox2, {index: 1}),
        ];
        const parsedMockMenuItemCheckbox1 = expectedItemsListChangePayload[0];

        spyOn(comp.itemsListChange, 'emit').and.callThrough();

        testHostComp.itemsList = [
            mockMenuItemCheckbox1,
            mockMenuItemCheckbox2,
        ];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemCheckbox1);

        expect(comp.itemsListChange.emit).toHaveBeenCalledWith(expectedItemsListChangePayload);
    });

    it('should emit itemsListChange before itemClicked when an item was clicked', () => {
        const parsedMockMenuItemButton = getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0});
        const itemClickedSpy = spyOn(comp.itemClicked, 'emit').and.callThrough();
        const itemsListChangeSpy = spyOn(comp.itemsListChange, 'emit').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemButton);

        expect(itemsListChangeSpy).toHaveBeenCalledBefore(itemClickedSpy);
    });

    it('should handle the click of an item when it is of type button', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemButton.id}-${mockMenuItemCheckbox1.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0}),
                getCustomizedParsedMenuItem(mockMenuItemCheckbox1, {index: 1}),
            ],
        }];
        const parsedMockMenuItemButton = expectedParsedMenuItemsLists[0].items[0];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                mockMenuItemCheckbox1,
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemButton);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type checkbox and the item wasn\'t selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemCheckbox1.id}-${mockMenuItemCheckbox2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemCheckbox1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemCheckbox2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemCheckbox2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemCheckbox1,
                mockMenuItemCheckbox2,
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemCheckbox2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type checkbox and the item was already selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemCheckbox1.id}-${mockMenuItemCheckbox2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemCheckbox1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemCheckbox2, {index: 1, selected: false}),
            ],
        }];
        const parsedMockMenuItemCheckbox2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemCheckbox1,
                getCustomizedMenuItem(mockMenuItemCheckbox2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemCheckbox2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type radio and the item wasn\'t selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemRadio1.id}-${mockMenuItemRadio2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemRadio1, {index: 0, selected: true}),
                getCustomizedParsedMenuItem(mockMenuItemRadio2, {index: 1, selected: false}),
            ],
        }];
        const parsedMockMenuItemRadio1 = expectedParsedMenuItemsLists[0].items[0];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemRadio1,
                mockMenuItemRadio2,
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemRadio1);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type radio and the item was already selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemRadio1.id}-${mockMenuItemRadio2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemRadio1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemRadio2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemRadio2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemRadio1,
                getCustomizedMenuItem(mockMenuItemRadio2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemRadio2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should unselect the items of the same group and the same type when an item of type radio is clicked', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [
            {
                id: `${mockMenuItemRadio1.id}-${mockMenuItemSelect1.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemRadio1, {index: 0, selected: true}),
                    getCustomizedParsedMenuItem(mockMenuItemSelect1, {index: 1, selected: true}),
                ],
            },
            {
                id: `${mockMenuItemRadio2.id}-${mockMenuItemSelect2.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemRadio2, {index: 2, selected: false}),
                    getCustomizedParsedMenuItem(mockMenuItemSelect2, {index: 3, selected: false}),
                ],
            },
        ];
        const parsedMockMenuItemRadio1 = expectedParsedMenuItemsLists[0].items[0];

        testHostComp.itemsList = [
            {
                items: [
                    mockMenuItemRadio1,
                    getCustomizedMenuItem(mockMenuItemSelect1, {selected: true}),
                ],
            },
            {
                items: [
                    getCustomizedMenuItem(mockMenuItemRadio2, {selected: true}),
                    mockMenuItemSelect2,
                ],
            },
        ];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemRadio1);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type select and the is wasn\'t selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemSelect1.id}-${mockMenuItemSelect2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemSelect1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemSelect2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemSelect2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemSelect1,
                getCustomizedMenuItem(mockMenuItemSelect2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelect2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type select and the item was already selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemSelect1.id}-${mockMenuItemSelect2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemSelect1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemSelect2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemSelect2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemSelect1,
                getCustomizedMenuItem(mockMenuItemSelect2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelect2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should unselect the items of the same group and the same type when an item of type select is clicked', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [
            {
                id: `${mockMenuItemSelect1.id}-${mockMenuItemRadio1.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemSelect1, {index: 0, selected: true}),
                    getCustomizedParsedMenuItem(mockMenuItemRadio1, {index: 1, selected: true}),
                ],
            },
            {
                id: `${mockMenuItemSelect2.id}-${mockMenuItemRadio2.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemSelect2, {index: 2, selected: false}),
                    getCustomizedParsedMenuItem(mockMenuItemRadio2, {index: 3, selected: false}),
                ],
            },
        ];
        const parsedMockMenuItemSelect1 = expectedParsedMenuItemsLists[0].items[0];

        testHostComp.itemsList = [
            {
                items: [
                    mockMenuItemSelect1,
                    getCustomizedMenuItem(mockMenuItemRadio1, {selected: true}),
                ],
            },
            {
                items: [
                    getCustomizedMenuItem(mockMenuItemSelect2, {selected: true}),
                    mockMenuItemRadio2,
                ],
            },
        ];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelect1);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type select-icon and the is wasn\'t selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemSelectIcon1.id}-${mockMenuItemSelectIcon2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemSelectIcon1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemSelectIcon2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemSelectIcon2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemSelectIcon1,
                getCustomizedMenuItem(mockMenuItemSelectIcon2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelectIcon2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should handle the click of an item when it is of type select-icon and the item was already selected', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [{
            id: `${mockMenuItemSelectIcon1.id}-${mockMenuItemSelectIcon2.id}`,
            items: [
                getCustomizedParsedMenuItem(mockMenuItemSelectIcon1, {index: 0, selected: false}),
                getCustomizedParsedMenuItem(mockMenuItemSelectIcon2, {index: 1, selected: true}),
            ],
        }];
        const parsedMockMenuItemSelectIcon2 = expectedParsedMenuItemsLists[0].items[1];

        testHostComp.itemsList = [{
            items: [
                mockMenuItemSelectIcon1,
                getCustomizedMenuItem(mockMenuItemSelectIcon2, {selected: true}),
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelectIcon2);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should unselect the items of the same group and the same type when an item of type select-icon is clicked', () => {
        const expectedParsedMenuItemsLists: ParsedMenuItemsList[] = [
            {
                id: `${mockMenuItemSelectIcon1.id}-${mockMenuItemRadio1.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemSelectIcon1, {index: 0, selected: true}),
                    getCustomizedParsedMenuItem(mockMenuItemRadio1, {index: 1, selected: true}),
                ],
            },
            {
                id: `${mockMenuItemSelectIcon2.id}-${mockMenuItemRadio2.id}`,
                items: [
                    getCustomizedParsedMenuItem(mockMenuItemSelectIcon2, {index: 2, selected: false}),
                    getCustomizedParsedMenuItem(mockMenuItemRadio2, {index: 3, selected: false}),
                ],
            },
        ];
        const parsedMockMenuItemSelectIcon1 = expectedParsedMenuItemsLists[0].items[0];

        testHostComp.itemsList = [
            {
                items: [
                    mockMenuItemSelectIcon1,
                    getCustomizedMenuItem(mockMenuItemRadio1, {selected: true}),
                ],
            },
            {
                items: [
                    getCustomizedMenuItem(mockMenuItemSelectIcon2, {selected: true}),
                    mockMenuItemRadio2,
                ],
            },
        ];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemSelectIcon1);

        expect(comp.parsedMenuItemsLists).toEqual(expectedParsedMenuItemsLists);
    });

    it('should focus on the first item when Arrow Down key is pressed', () => {
        const expectedInitialCursorIndex = -1;
        const expectedNextCursorIndex = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        expect(comp.cursorIndex).toBe(expectedInitialCursorIndex);

        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedNextCursorIndex);
    });

    it('should focus on the second item when Arrow Down key is pressed and the first item is focused', () => {
        const expectedMidCursorIndex = 0;
        const expectedNextCursorIndex = 1;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedMidCursorIndex);

        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedNextCursorIndex);
    });

    it('should focus on the last item when Arrow Down key is pressed and the last item is already focused', () => {
        const expectedCursorIndex = 2;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedCursorIndex);

        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should prevent the default behaviour of the Arrow Down key when it is pressed', () => {
        spyOn(keydownEvent, 'preventDefault').and.callThrough();

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);

        expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });

    it('should focus on the first item when Arrow Up key is pressed', () => {
        const expectedInitialCursorIndex = -1;
        const expectedNextCursorIndex = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        expect(comp.cursorIndex).toBe(expectedInitialCursorIndex);

        pressKey(KeyEnum.ArrowUp);

        expect(comp.cursorIndex).toBe(expectedNextCursorIndex);
    });

    it('should focus on the first item when Arrow Up key is pressed and the second item is focused', () => {
        const expectedMidCursorIndex = 1;
        const expectedNextCursorIndex = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);

        expect(comp.cursorIndex).toBe(expectedMidCursorIndex);

        pressKey(KeyEnum.ArrowUp);

        expect(comp.cursorIndex).toBe(expectedNextCursorIndex);
    });

    it('should focus on the first item when Arrow Up key is pressed and the first item is already focused', () => {
        const expectedCursorIndex = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowUp);

        expect(comp.cursorIndex).toBe(expectedCursorIndex);

        pressKey(KeyEnum.ArrowUp);

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should prevent the default behaviour of the Arrow Up key when it is pressed', () => {
        spyOn(keydownEvent, 'preventDefault').and.callThrough();

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
            ],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowUp);

        expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });

    it('should select the focused item when Enter key is pressed', () => {
        const parsedMockMenuItemButton = getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0});
        spyOn(comp.itemClicked, 'emit').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.Enter);

        expect(comp.itemClicked.emit).toHaveBeenCalledWith(parsedMockMenuItemButton);
    });

    it('should not select any item when there is no item focused', () => {
        spyOn(comp.itemClicked, 'emit').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.Enter);

        expect(comp.itemClicked.emit).not.toHaveBeenCalled();
    });

    it('should mark the clicked item as focused when it is clicked', () => {
        const customMockMenuItemButton = getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'});
        const parsedMockMenuItemButton = getCustomizedParsedMenuItem(customMockMenuItemButton, {index: 1});
        const expectedCursorIndex = 1;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                customMockMenuItemButton,
            ],
        }];
        fixture.detectChanges();

        comp.handleClick(parsedMockMenuItemButton);

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should prevent the default behaviour of the Enter key when it is pressed and an item is focused', () => {
        spyOn(keydownEvent, 'preventDefault').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.Enter);

        expect(keydownEvent.preventDefault).toHaveBeenCalled();
    });

    it('should not prevent the default behaviour of the Enter key when it is pressed and no item is focused', () => {
        spyOn(keydownEvent, 'preventDefault').and.callThrough();

        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.Enter);

        expect(keydownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should focus on the first item for witch the first character of the label matches the pressed key', () => {
        const expectedCursorIndex = 2;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3', label: 'Option 3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey('o');

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should keep the same focused item when the pressed key doesn\'t match any label of the item\'s label', () => {
        const expectedCursorIndex = 2;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3', label: 'Option 3'}),
            ],
        }];
        fixture.detectChanges();

        pressKey('o');

        expect(comp.cursorIndex).toBe(expectedCursorIndex);

        pressKey('a');

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should focus on the second item for witch the first character of the label matches the pressed key and is searchable', () => {
        const expectedCursorIndex = 2;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-4', label: 'Option 4', unsearchable: true}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-5', label: 'Option 5'}),
            ],
        }];
        fixture.detectChanges();

        pressKey('o');

        expect(comp.cursorIndex).toBe(expectedCursorIndex);
    });

    it('should not prevent the default behaviour of the pressed keys that are not the supported ones', () => {
        spyOn(keydownEvent, 'preventDefault').and.callThrough();

        pressKey('r');

        expect(keydownEvent.preventDefault).not.toHaveBeenCalled();
    });

    it('should allow to mark the focused item as focused when the keyboard navigation happens', () => {
        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        expect(comp.showFocus).toBeFalsy();

        pressKey(KeyEnum.ArrowDown);

        expect(comp.showFocus).toBeTruthy();
    });

    it('should not allow to mark the focused item as focused when a mouse click is received', () => {
        testHostComp.itemsList = [{
            items: [mockMenuItemButton],
        }];
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);

        expect(comp.showFocus).toBeTruthy();

        document.dispatchEvent(clickEvent);

        expect(comp.showFocus).toBeFalsy();
    });

    it('should keep the scroll so that the first item is at the top when the first item is focused', () => {
        const expectedScrollTop = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-4'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-5'}),
            ],
        }];
        de.styles['max-height'] = '48px';
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);

        expect(de.nativeElement.scrollTop).toBe(expectedScrollTop);
    });

    it('should keep the scroll so that the first item is at the top when the second item is focused', () => {
        const expectedScrollTop = 0;

        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-4'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-5'}),
            ],
        }];
        de.styles['max-height'] = '48px';
        fixture.detectChanges();

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);

        expect(de.nativeElement.scrollTop).toBe(expectedScrollTop);
    });

    it('should move the scroll so that the second item is at the top when the third item is focused', () => {
        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-4'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-5'}),
            ],
        }];
        de.styles['max-height'] = '48px';
        fixture.detectChanges();

        const firstItemY = getElement(getMenuListItemSelector(0)).getBoundingClientRect().y;
        const secondItemY = getElement(getMenuListItemSelector(1)).getBoundingClientRect().y;
        const expectedScrollTop = Math.round(secondItemY - firstItemY);

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);

        expect(de.nativeElement.scrollTop).toBe(expectedScrollTop);
    });

    it('should move the scroll so that the third item is at the top when the fourth item is focused', () => {
        testHostComp.itemsList = [{
            items: [
                mockMenuItemButton,
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-2'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-3'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-4'}),
                getCustomizedMenuItem(mockMenuItemButton, {id: 'item-5'}),
            ],
        }];
        de.styles['max-height'] = '48px';
        fixture.detectChanges();

        const firstItemY = getElement(getMenuListItemSelector(0)).getBoundingClientRect().y;
        const thirdItemY = getElement(getMenuListItemSelector(2)).getBoundingClientRect().y;
        const expectedScrollTop = Math.round(thirdItemY - firstItemY);

        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);
        pressKey(KeyEnum.ArrowDown);

        expect(de.nativeElement.scrollTop).toBe(expectedScrollTop);
    });

    it('should emit itemHovered with the item when mouse enter a menu item', () => {
        const expectedPayload = getCustomizedParsedMenuItem(mockMenuItemButton, {index: 0});

        testHostComp.itemsList = [{
            title: 'title',
            items: [
                mockMenuItemButton,
                mockMenuItemButton,
            ],
        }];
        fixture.detectChanges();

        spyOn(comp.itemHovered, 'emit');
        getElement(getMenuListItemSelector(0)).dispatchEvent(mouseenterEvent);

        expect(comp.itemHovered.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit itemHovered with null when mouse leave a menu item list', () => {
        const expectedPayload = null;

        testHostComp.itemsList = [{
            title: 'title',
            items: [
                mockMenuItemButton,
                mockMenuItemButton,
            ],
        }];
        fixture.detectChanges();

        getElement(getMenuListItemSelector(0)).dispatchEvent(mouseenterEvent);
        spyOn(comp.itemHovered, 'emit');
        getElement(getMenuSublistSelector(0)).dispatchEvent(mouseleaveEvent);

        expect(comp.itemHovered.emit).toHaveBeenCalledWith(expectedPayload);
    });
});
