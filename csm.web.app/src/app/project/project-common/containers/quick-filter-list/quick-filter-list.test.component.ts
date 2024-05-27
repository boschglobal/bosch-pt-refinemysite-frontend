/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {QuickFilterId} from '../../models/quick-filters/quick-filter';

@Component({
    selector: 'ss-quick-filter-list-test',
    template: `
        <ss-quick-filter-list [appliedFilterId]="appliedFilterId"></ss-quick-filter-list>
    `,
})
export class QuickFilterListTestComponent {

    public appliedFilterId: QuickFilterId = 'all';
}
