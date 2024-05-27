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

@Component({
    selector: 'ss-project-card',
    templateUrl: './project-card.component.html'
})
export class ProjectCardComponent {
    /**
     * @description Property with project card title
     */
    @Input() public title: string;
}
