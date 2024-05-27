/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    QueryList,
    Renderer2,
    TemplateRef,
    ViewChildren,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

import {KeyEnum} from '../../../misc/enums/key.enum';
import {
    MenuItemSize,
    MenuItemType,
} from '../menu-item/menu-item.component';

@Component({
    selector: 'ss-menu-list',
    templateUrl: './menu-list.component.html',
    styleUrls: ['./menu-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuListComponent {

    @Input()
    public set itemsList(itemsList: MenuItem[] | MenuItemsList[]) {
        const definedItemsList = itemsList || [];

        this._setIsSingleList(definedItemsList);
        this._setParsedMenuItemsLists(definedItemsList);
    }

    @Input()
    public size: MenuItemSize = 'small';

    @Output()
    public itemClicked = new EventEmitter<MenuItem>();

    @Output()
    public itemsListChange = new EventEmitter<MenuItemsList[] | MenuItem[]>();

    @Output()
    public itemHovered = new EventEmitter<MenuItem | null>();

    @ViewChildren('menuItem', {read: ElementRef})
    private _itemElements = new QueryList<ElementRef<HTMLElement>>();

    @HostListener('document:click')
    private _handleClick(): void {
        this.showFocus = false;
    }

    @HostListener('document:keydown', ['$event'])
    private _handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyEnum.ArrowUp:
                this._handleArrowUp();
                event.preventDefault();
                break;
            case KeyEnum.ArrowDown:
                this._handleArrowDown();
                event.preventDefault();
                break;
            case KeyEnum.Enter:
                this._handleEnter(event);
                break;
            default:
                this._handleSearch(event.key);
        }
    }

    public cursorIndex = -1;

    public parsedMenuItemsLists: ParsedMenuItemsList[];

    public showFocus = false;

    private _isSingleList = false;

    private _flattenedItems: ParsedMenuItem[];

    private _selectFunctionByType: { [key in MenuItemType]: (item: MenuItem, clickItem: MenuItem) => boolean } = {
        button: (item) => item.selected,
        checkbox: (item, clickItem) => clickItem.id === item.id ? !item.selected : item.selected,
        radio: (item, clickItem) => clickItem.id === item.id,
        select: (item, clickItem) => clickItem.id === item.id,
        'select-icon': (item, clickItem) => clickItem.id === item.id,
    };

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _elementRef: ElementRef,
                private _renderer2: Renderer2,
                private _translateService: TranslateService) {
    }

    public handleClick(clickItem: ParsedMenuItem): void {
        const selectFunction = this._selectFunctionByType[clickItem.type];

        this.parsedMenuItemsLists = this.parsedMenuItemsLists.map(parsedItemsList => ({
            ...parsedItemsList,
            items: parsedItemsList.items.map(item => {
                if (item.type === clickItem.type && item.groupId === clickItem.groupId) {
                    item.selected = selectFunction(item, clickItem);
                }
                return item;
            }),
        }));
        this.cursorIndex = clickItem.index;
        this._changeDetectorRef.detectChanges();

        this._emitItemsListChange();
        this.itemClicked.emit(clickItem);
    }

    public handleItemHovered(item: ParsedMenuItem | null): void {
        this.itemHovered.emit(item);
    }

    public trackByItemFn(index: number, item: ParsedMenuItem): string {
        return item.id;
    }

    public trackByItemsListFn(index: number, itemsList: ParsedMenuItemsList): string {
        return itemsList.id;
    }

    private _emitItemsListChange(): void {
        const emitFlattenList: boolean = this._isSingleList && this.parsedMenuItemsLists?.length > 0;
        const items = emitFlattenList ? this.parsedMenuItemsLists[0].items : this.parsedMenuItemsLists;

        this.itemsListChange.emit(items);
    }

    private _handleArrowDown(): void {
        const nextCursorIndex = this.cursorIndex + 1;
        const maxCursorIndex = this._flattenedItems.length - 1;
        this.cursorIndex = Math.min(maxCursorIndex, nextCursorIndex);

        this._handleScrollTop();
    }

    private _handleArrowUp(): void {
        const nextCursorIndex = this.cursorIndex - 1;
        this.cursorIndex = Math.max(0, nextCursorIndex);

        this._handleScrollTop();
    }

    private _handleEnter(event: KeyboardEvent): void {
        if (this.cursorIndex >= 0) {
            this.handleClick(this._flattenedItems[this.cursorIndex]);
            event.preventDefault();
        }
    }

    private _handleSearch(char: string): void {
        const charItemIndex =
            this._flattenedItems.findIndex(item => !item.unsearchable && item.label?.[0].toLowerCase() === char.toLowerCase());

        if (charItemIndex >= 0) {
            this.cursorIndex = charItemIndex;
            this._handleScrollTop();
        }
    }

    private _handleScrollTop(): void {
        const firstItem = this._itemElements.get(0);
        const previousItem = this._itemElements.get(this.cursorIndex - 1);
        const firstItemY = firstItem.nativeElement.getBoundingClientRect().y;
        const previousItemY = previousItem?.nativeElement.getBoundingClientRect().y;
        const scrollTop = previousItemY === undefined ? 0 : Math.round(previousItemY - firstItemY);

        this._renderer2.setProperty(this._elementRef.nativeElement, 'scrollTop', scrollTop);
        this.showFocus = true;
    }

    private _setIsSingleList(items: MenuItem[] | MenuItemsList[]): void {
        this._isSingleList = !MenuItemsList.isMenuItemsListArray(items);
    }

    private _setParsedMenuItemsLists(items: MenuItem[] | MenuItemsList[]): void {
        let index = 0;
        const itemsLists: MenuItemsList[] = MenuItemsList.isMenuItemsListArray(items) ? items : [{items}];
        const flattenedItems: ParsedMenuItem[] = [];

        this.parsedMenuItemsLists = itemsLists
            .filter((itemsList: MenuItemsList) => itemsList.items.length > 0)
            .map((itemsList: MenuItemsList) => ({
                ...itemsList,
                id: itemsList.items.map(item => item.id).join('-'),
                items: itemsList.items.map(item => {
                    const parsedItem = {
                        ...item,
                        ...item.label ? {label: this._translateService.instant(item.label)} : {},
                        index,
                    };
                    flattenedItems.push(parsedItem);
                    index++;
                    return parsedItem;
                }),
            }));
        this._flattenedItems = flattenedItems;
    }
}

export class MenuItem<V = any, I = any, D = any> {
    id: I;
    type: MenuItemType;
    label?: string;
    groupId?: string;
    value?: V;
    selected?: boolean;
    disabled?: boolean;
    unsearchable?: boolean;
    customData?: D;
}

export class MenuItemsList<V = any, I = any, D = any> {
    items: MenuItem<V, I, D>[];
    customFigureTemplate?: TemplateRef<any>;
    reserveIndicatorSpace?: boolean;
    separator?: boolean;
    title?: string;

    public static isMenuItemsListArray(items: any): items is MenuItemsList[] {
        return !!items.length && items[0].hasOwnProperty('items');
    }
}

export class ParsedMenuItem<V = any, I = any, D = any> extends MenuItem<V, I, D> {
    index: number;
}

export class ParsedMenuItemsList<V = any, I = any, D = any> extends MenuItemsList<V, I, D> {
    id: string;
    items: ParsedMenuItem<V, I, D>[];
}
