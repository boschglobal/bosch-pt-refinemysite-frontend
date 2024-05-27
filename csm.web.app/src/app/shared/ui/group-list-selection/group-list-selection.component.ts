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
    ContentChild,
    Input,
    TemplateRef,
} from '@angular/core';

import {GroupItem} from '../group-item-list/group-item-list.component';
import {MultipleSelectionToolbarConfirmationModeEnum} from '../multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';

export interface MultipleSelectionToolbarTranslations {
    emptyItemsLabel: string;
    selectedItemLabel: string;
    selectedItemsLabel: string;
}

export interface MultipleSelectionToolbarData extends MultipleSelectionToolbarTranslations {
    itemsCount: number;
    mode: MultipleSelectionToolbarConfirmationModeEnum;
    submitSelection: () => void;
    dismissSelection: () => void;
}

const COLLAPSED_ICON_ROTATION = 270;
const EXPANDED_ICON_ROTATION = 90;

@Component({
    selector: 'ss-group-list-selection',
    templateUrl: './group-list-selection.component.html',
    styleUrls: ['./group-list-selection.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupListSelectionComponent {

    @Input()
    public set groups(groupItems: GroupItem[]) {
        this._groups = groupItems;

        this._setTotalItems();
        this._setShowCollapsedButton();
    }

    public get groups(): GroupItem[] {
        return this._groups;
    }

    @Input()
    public itemsPerGroupItem: number;

    @Input()
    public multipleSelectionToolbarData: MultipleSelectionToolbarData;

    @Input()
    public title: string;

    @ContentChild('actionsTemplate')
    public actionsTemplate: TemplateRef<any>;

    @ContentChild('itemTemplate')
    public itemTemplate: TemplateRef<any>;

    @ContentChild('messageTemplate')
    public messageTemplate: TemplateRef<any>;

    public arrowIconRotation = EXPANDED_ICON_ROTATION;

    public collapsed = false;

    public showCollapsedButton = true;

    public totalItems = 0;

    private _groups: GroupItem[];

    public handleCollapse(): void {
        this.collapsed = !this.collapsed;
        this.arrowIconRotation = this.collapsed ? COLLAPSED_ICON_ROTATION : EXPANDED_ICON_ROTATION;
    }

    public trackByFn(index: number, groupItem: GroupItem): string {
        return groupItem.id;
    }

    private _setTotalItems(): void {
        this.totalItems = this._groups.reduce((a, b) => a + b.items.length, 0);
    }

    private _setShowCollapsedButton(): void {
        this.showCollapsedButton = this.totalItems > 0;
    }
}
