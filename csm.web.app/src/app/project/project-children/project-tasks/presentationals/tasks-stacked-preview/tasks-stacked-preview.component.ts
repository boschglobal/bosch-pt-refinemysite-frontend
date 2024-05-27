/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
} from '@angular/core';

import {
    COLORS,
    CraftColor
} from '../../../../../shared/ui/constants/colors.constant';

@Component({
    selector: 'ss-tasks-stacked-preview',
    templateUrl: './tasks-stacked-preview.component.html',
    styleUrls: ['./tasks-stacked-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksStackedPreviewComponent {

    @Input()
    public topCard: TasksStackedPreviewModel;

    @Input()
    public backgroundCard: TasksStackedPreviewModel;

    @Input()
    public cardCount: number;

    public counterColor: string = COLORS.light_blue;

}

export class TasksStackedPreviewModel {
    title?: string;
    description?: string;
    color: CraftColor;
    dimmed: boolean;
}
