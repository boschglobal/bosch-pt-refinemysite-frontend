/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {Milestone} from '../../models/milestones/milestone';

@Component({
    templateUrl: './milestone-task-relation-list.test.component.html',
})
export class MilestoneTaskRelationListTestComponent {

    public milestone: Milestone;
}
