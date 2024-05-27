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

import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-project-rfv-info-header',
    templateUrl: './project-rfv-info-header.component.html',
    styleUrls: ['./project-rfv-info-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRfvInfoHeaderComponent {

    @Input()
    public activeItems: number;

    @Input()
    public totalItems: number;

    public iconColor = COLORS.dark_blue;
}
