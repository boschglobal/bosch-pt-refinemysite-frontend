/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    ViewChild,
    ViewContainerRef
} from '@angular/core';

@Component({
    selector: 'ss-project-tasks',
    templateUrl: './project-tasks.component.html',
    styleUrls: ['./project-tasks.component.scss'],
})
export class ProjectTasksComponent {

    @ViewChild('filterDrawer', {static: true, read: ViewContainerRef})
    public filterDrawerViewContainerRef: ViewContainerRef;
}
