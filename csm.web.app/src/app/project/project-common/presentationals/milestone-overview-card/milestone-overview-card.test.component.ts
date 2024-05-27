/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {MOCK_MILESTONE_CRAFT} from '../../../../../test/mocks/milestones';
import {MenuItemsList} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {Milestone} from '../../models/milestones/milestone';

@Component({
    template: `
        <ss-milestone-overview-card [milestone]="milestone"
                                    [isCritical]="isCritical"
                                    [actions]="actions"></ss-milestone-overview-card>
    `,
    styles: [
        ':host { display: block; border: 1px solid #d4d7da; max-width: 272px; }',
    ],
})
export class MilestoneOverviewCardTestComponent {

    public actions: MenuItemsList[];

    public isCritical: boolean;

    public milestone: Milestone;

    public triggerChangeDetection(): void {
        this.milestone = {...MOCK_MILESTONE_CRAFT};
    }
}
