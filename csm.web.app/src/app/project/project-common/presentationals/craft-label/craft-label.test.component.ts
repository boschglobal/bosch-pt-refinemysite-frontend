/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';

@Component({
    selector: 'ss-craft-label-test',
    templateUrl: './craft-label.test.component.html',
})
export class CraftLabelTestComponent {

    @Input() public craft: ProjectCraftResource;
    @Input() public hasEllipsis: boolean;
}
