/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {SystemHelper} from '../../../../../shared/misc/helpers/system.helper';
import {
    COLORS,
    CraftColor
} from '../../../../../shared/ui/constants/colors.constant';
import {RelationResource} from '../../../../project-common/api/relations/resources/relation.resource';
import {TaskConstraintsResource} from '../../../../project-common/api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../../../project-common/api/tasks/resources/task.resource';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';

@Component({
    selector: 'ss-tasks-card-preview',
    templateUrl: './tasks-card-preview.component.html',
    styleUrls: ['./tasks-card-preview.component.scss'],
})
export class TasksCardPreviewComponent {

    @Input()
    public hasNews = false;

    @Input()
    public predecessorRelations: RelationResource[] = [];

    @Input()
    public successorRelations: RelationResource[] = [];

    @Input()
    public task: TasksCardPreviewModel;

    public isCssHasSupported = this._systemHelper.isCssHasSupported();

    public selectedCheckColor = COLORS.light_blue;

    constructor(private _systemHelper: SystemHelper) {
    }
}

export class TasksCardPreviewModel {
    constraints: TaskConstraintsResource;
    color: CraftColor;
    description: string;
    focused: boolean;
    selected: boolean;
    dimmed: boolean;
    statistics: TaskStatistics;
    status: TaskStatusEnum;
    title: string;
}
