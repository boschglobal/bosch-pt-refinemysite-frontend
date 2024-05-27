/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {MilestoneMarkerModel} from './milestone-marker.component';

@Component({
    templateUrl: './milestone-marker.test.component.html',
    styles: [
        'ss-milestone-marker {display: block}',
    ],
})
export class MilestoneMarkerTestComponent {

    public isDimmedOut: boolean;

    public isFocused: boolean;

    public isSelected: boolean;

    public isCritical: boolean;

    public milestoneMarker: MilestoneMarkerModel;
}
