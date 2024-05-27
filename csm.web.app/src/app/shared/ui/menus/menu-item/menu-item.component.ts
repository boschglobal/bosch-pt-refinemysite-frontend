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
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';

export type MenuItemType =
    'button' |
    'select' |
    'select-icon' |
    'checkbox' |
    'radio';

export type MenuItemSize = 'tiny' | 'small';

export const CSS_CLASS_MENU_ITEM_SELECTED = 'ss-menu-item--selected';
export const CSS_CLASS_MENU_ITEM_FOCUSED = 'ss-menu-item--focused';
export const CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE = 'ss-menu-item--reserve-indicator-space';

@Component({
    selector: 'ss-menu-item',
    templateUrl: './menu-item.component.html',
    styleUrls: ['./menu-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent implements OnChanges {

    @Input()
    public disabled: boolean;

    @Input()
    public focused: boolean;

    @Input()
    public label: string;

    @Input()
    public reserveIndicatorSpace: boolean;

    @Input()
    public selected: boolean;

    @Input()
    public selectedIcon = 'check';

    @Input()
    public size: MenuItemSize = 'small';

    @Input()
    public type: MenuItemType;

    @Output()
    public itemClick = new EventEmitter<Event>();

    public classes: { [key: string]: boolean };

    ngOnChanges(changes: SimpleChanges): void {
        this._setClasses();
    }

    public handleClick(event: Event): void {
        if (!this.disabled) {
            this.itemClick.emit(event);
        }
    }

    private _setClasses(): void {
        this.classes = {
            [CSS_CLASS_MENU_ITEM_SELECTED]: this.selected,
            [CSS_CLASS_MENU_ITEM_FOCUSED]: this.focused,
            [CSS_CLASS_MENU_ITEM_RESERVE_INDICATOR_SPACE]: this.reserveIndicatorSpace,
            [`ss-menu-item--${this.type}`]: true,
            [`ss-menu-item--${this.size}`]: true,
        };
    }
}
