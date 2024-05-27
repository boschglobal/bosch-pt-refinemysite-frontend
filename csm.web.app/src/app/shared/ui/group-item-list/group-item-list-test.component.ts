/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {GroupItem} from './group-item-list.component';

@Component({
    template: `
        <ss-group-item-list
            [groupItem]="groupItem"
            [itemTemplate]="itemTemplate"
            [itemsPerGroupItem]="itemsPerGroupItem">
        </ss-group-item-list>
        <ng-template #itemTemplate let-item>
            <span>{{item | json}}</span>
        </ng-template>
    `,
})
export class GroupItemListTestComponent {

    public groupItem: GroupItem = {
        id: '',
        items: [],
    };

    public itemsPerGroupItem: number;
}
