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
    Input
} from '@angular/core';

import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';

@Component({
    selector: 'ss-craft-label',
    templateUrl: './craft-label.component.html',
    styleUrls: ['./craft-label.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CraftLabelComponent {

    @Input() public craft: ProjectCraftResource;

    @Input() public hasEllipsis?: boolean;

}

export interface CraftLabel {
    name: string;
    color: string;
}
