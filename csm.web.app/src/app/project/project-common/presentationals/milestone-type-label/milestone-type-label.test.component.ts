/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {Milestone} from '../../models/milestones/milestone';

@Component({
    templateUrl: './milestone-type-label.test.component.html',
    styles: [
        ':host {padding: 8px; display: block}',
    ],
})
export class MilestoneTypeLabelTestComponent {

    @Input()
    public milestone: Milestone;

}
