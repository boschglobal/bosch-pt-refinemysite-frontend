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
} from '@angular/core';

import {MilestoneTypeEnumHelper} from '../../enums/milestone-type.enum';
import {Milestone} from '../../models/milestones/milestone';
import {MilestoneMarkerModel} from '../milestone-marker/milestone-marker.component';

@Component({
    selector: 'ss-milestone-type-label',
    templateUrl: './milestone-type-label.component.html',
    styleUrls: ['./milestone-type-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneTypeLabelComponent {

    @Input()
    public set milestone(milestone: Milestone) {
        const {type, craft} = milestone;
        const {displayName, color} = craft || {};

        this.craftName = displayName;
        this.milestoneType = MilestoneTypeEnumHelper.getLabelByValue(type);
        this.milestoneMarker = {type, color};
    }

    public craftName: string;

    public milestoneMarker: MilestoneMarkerModel;

    public milestoneType: string;
}
