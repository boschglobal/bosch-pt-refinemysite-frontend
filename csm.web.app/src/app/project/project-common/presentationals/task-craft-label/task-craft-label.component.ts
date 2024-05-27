/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';

@Component({
    selector: 'ss-task-craft-label',
    templateUrl: './task-craft-label.component.html',
    styleUrls: ['./task-craft-label.component.scss']
})
export class TaskCraftLabelComponent {
    @Input()
    public craft: ProjectCraftResource;
}
