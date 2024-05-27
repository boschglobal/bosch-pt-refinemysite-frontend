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
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';

import {Milestone} from '../../models/milestones/milestone';

@Component({
    templateUrl: './milestone-location-label.test.component.html',
    styles: [
        ':host {padding: 8px; display: block}',
    ],
})
export class MilestoneLocationLabelTestComponent {

    @Input()
    public milestone: Milestone;

    @Input()
    public workArea: WorkareaResource;

}
