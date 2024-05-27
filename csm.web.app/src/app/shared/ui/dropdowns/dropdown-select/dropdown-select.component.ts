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
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
} from '@angular/core';
import {flatten} from 'lodash';
import {
    merge,
    Subscription,
} from 'rxjs';
import {
    filter,
    map,
} from 'rxjs/operators';

import {ElementAlignment} from '../../../misc/helpers/element-positioning.helper';
import {UUID} from '../../../misc/identification/uuid';
import {ButtonStyle} from '../../button/button.component';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';

export type DropdownSelectSize = 'tiny' | 'small';

@Component({
    selector: 'ss-dropdown-select',
    templateUrl: './dropdown-select.component.html',
    styleUrls: ['./dropdown-select.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownSelectComponent implements OnInit, OnDestroy {

    @Input()
    public buttonStyle: ButtonStyle = 'tertiary-black';

    @Input()
    public set items(items: MenuItemsList[]) {
        this._setItems(items);
        this._setSelectedItem();
        this._setCustomFigureTemplate();
    }

    public get items(): MenuItemsList[] {
        return this._items;
    }

    @Input()
    public itemsAlignment: ElementAlignment = 'start';

    @Input()
    public size: DropdownSelectSize = 'small';

    @Output()
    public itemClicked = new EventEmitter<MenuItem>();

    @Output()
    public itemsChange = new EventEmitter<MenuItemsList[]>();

    public customFigureTemplate: TemplateRef<any>;

    public flyoutId = `ss-dropdown-select-${UUID.v4()}`;

    public iconRotation = -90;

    public selectedItem: MenuItem;

    private _disposableSubscriptions = new Subscription();

    private _items: MenuItemsList[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _flyoutService: FlyoutService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleItemClicked(item: MenuItem): void {
        this._flyoutService.close(this.flyoutId);
        this.itemClicked.emit(item);
    }

    public handleItemsListChange(items: MenuItemsList[]): void {
        this.itemsChange.emit(items);
    }

    private _getSelectedItem(menuItemsList: MenuItemsList[]): MenuItem | undefined {
        const flattenItems = flatten(menuItemsList.map(({items}) => items));

        return flattenItems.find(({selected}) => selected);
    }

    private _setCustomFigureTemplate(): void {
        const itemList = this._items.find(({items}) => items.find(({id}) => this.selectedItem.id === id));

        this.customFigureTemplate = itemList?.customFigureTemplate;
    }

    private _setIconRotation(isFlyoutOpen: boolean): void {
        this.iconRotation = isFlyoutOpen ? 90 : -90;
        this._changeDetectorRef.detectChanges();
    }

    private _setItems(items: MenuItemsList[]): void {
        const selectedItem = this._getSelectedItem(items);
        const firstListWithItems = items.find(itemList => !!itemList.items.length);

        if (!selectedItem && firstListWithItems) {
            firstListWithItems.items[0] = {
                ...firstListWithItems.items[0],
                selected: true,
            };
        }

        this._items = items;
    }

    private _setSelectedItem(): void {
        this.selectedItem = this._getSelectedItem(this._items);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            merge(
                this._flyoutService.openEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => true),
                ),
                this._flyoutService.closeEvents.pipe(
                    filter(flyoutId => flyoutId === this.flyoutId),
                    map(() => false),
                )
            ).subscribe(isFlyoutOpen => this._setIconRotation(isFlyoutOpen))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
