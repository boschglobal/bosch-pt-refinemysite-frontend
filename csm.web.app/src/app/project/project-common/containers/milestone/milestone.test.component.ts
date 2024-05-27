/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
} from '@angular/core';

import {Milestone} from '../../models/milestones/milestone';

@Component({
    selector: 'ss-milestone-test',
    templateUrl: './milestone.test.component.html',
})
export class MilestoneTestComponent {

    public isDimmedOut: boolean;

    public canDragMilestone: boolean;

    public canSelectMilestone: boolean;

    public focusedMilestoneId: string;

    public milestone: Milestone;

    public selectedMilestoneIds: string[] = [];

    public selectMilestone = new EventEmitter<string>();

    public handleSelect(milestoneId: string): void {
        this.selectMilestone.emit(milestoneId);
    }
}
