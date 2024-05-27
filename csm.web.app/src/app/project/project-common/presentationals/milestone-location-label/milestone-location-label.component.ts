/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {Milestone} from '../../models/milestones/milestone';

@Component({
    selector: 'ss-milestone-location-label',
    templateUrl: './milestone-location-label.component.html',
    styleUrls: ['./milestone-location-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MilestoneLocationLabelComponent {

    @Input()
    public milestone: Milestone;

    @Input()
    public workArea: WorkareaResource;

    @Output()
    public addLocation: EventEmitter<Milestone> = new EventEmitter<Milestone>();

    public handleAddLocation(): void {
        this.addLocation.emit(this.milestone);
    }
}
