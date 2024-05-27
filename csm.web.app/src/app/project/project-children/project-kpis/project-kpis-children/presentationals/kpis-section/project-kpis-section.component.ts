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
    selector: 'ss-project-kpis-section',
    templateUrl: './project-kpis-section.component.html',
    styleUrls: ['./project-kpis-section.component.scss']
})
export class ProjectKpisSectionComponent {

    @Input() public title: string;
}
