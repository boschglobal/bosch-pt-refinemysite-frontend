/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
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
import {
    ButtonSize,
    ButtonStyle,
} from '../../button/button.component';
import {FlyoutService} from '../../flyout/service/flyout.service';
import {MenuItemSize} from '../../menus/menu-item/menu-item.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';

@Component({
    selector: 'ss-dropdown-menu',
    templateUrl: './dropdown-menu.component.html',
    styleUrls: ['./dropdown-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuComponent implements OnInit, OnDestroy {

    @Input()
    public buttonNoPadding = true;

    @Input()
    public buttonSize: ButtonSize = 'small';

    @Input()
    public buttonStyle: ButtonStyle = 'tertiary-black';

    @Input()
    public closeOnItemClick = true;

    @Input()
    public icon: string;

    @Input()
    public items: MenuItemsList[] = [];

    @Input()
    public itemsAlignment: ElementAlignment = 'end';

    @Input()
    public label: string;

    @Input()
    public menuItemSize: MenuItemSize = 'small';

    @Input()
    public title = '';

    @Output()
    public itemClicked = new EventEmitter<MenuItem>();

    @Output()
    public itemsChange = new EventEmitter<MenuItemsList[]>();

    @Output()
    public flyoutStateChange = new EventEmitter<boolean>();

    public flyoutId = `ss-dropdown-menu-${UUID.v4()}`;

    private _disposableSubscriptions = new Subscription();

    constructor(private _flyoutService: FlyoutService) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleItemClicked(item: MenuItem): void {
        if (this.closeOnItemClick) {
            this._flyoutService.close(this.flyoutId);
        }

        this.itemClicked.emit(item);
    }

    public handleItemsListChange(items: MenuItemsList[]): void {
        this.itemsChange.emit(items);
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
            ).subscribe(isFlyoutOpen => this.flyoutStateChange.emit(isFlyoutOpen))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
