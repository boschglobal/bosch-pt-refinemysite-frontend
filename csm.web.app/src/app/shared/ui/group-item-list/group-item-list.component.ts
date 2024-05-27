/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    TemplateRef,
} from '@angular/core';

export interface GroupItemIdentifier {
    id: string;
}

export interface GroupItem<T extends GroupItemIdentifier = GroupItemIdentifier> {
    id: string;
    title?: string;
    items: T[];
}

@Component({
    selector: 'ss-group-item-list',
    templateUrl: './group-item-list.component.html',
    styleUrls: ['./group-item-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupItemListComponent {

    @Input()
    public set groupItem(groupItem: GroupItem) {
        this._groupItem = groupItem;

        this._setItems();
        this._setShowLoadMore();
    }

    public get groupItem(): GroupItem {
        return this._groupItem;
    }

    @Input()
    public itemsPerGroupItem: number;

    @Input()
    public itemTemplate: TemplateRef<any>;

    public items: GroupItemIdentifier[] = [];

    public showLoadMore = false;

    private _groupItem: GroupItem;

    private _loadMoreTriggered = false;

    public handleLoadMore(): void {
        this.showLoadMore = false;
        this._loadMoreTriggered = true;
        this._setItems();
    }

    public trackByFn(index: number, item: GroupItemIdentifier): string {
        return item.id;
    }

    private _setItems(): void {
        this.items = this._loadMoreTriggered ? this.groupItem.items : this.groupItem.items.slice(0, this.itemsPerGroupItem);
    }

    private _setShowLoadMore(): void {
        this.showLoadMore = !this._loadMoreTriggered && this.groupItem.items.length > this.itemsPerGroupItem;
    }
}
