/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';

import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../api/tasks/resources/task.resource';

@Component({
    selector: 'ss-task-card-test-indicators',
    templateUrl: './task-card-indicators.test.component.html',
    styles: [
        `:host {
            display: block;
            padding: 16px;
            background-color: ${COLORS.salmon};
        }`,
    ],
})
export class TaskCardIndicatorsTestComponent {

    public constraints: TaskConstraintsResource;

    public isDimmed: boolean;

    public isFocused: boolean;

    public isSelected: boolean;

    public set predecessorRelations(relations: RelationResource[]) {
        this._predecessorRelations = relations;
    }

    public set predecessorCriticalRelations(relations: RelationResource[]) {
        this._predecessorCriticalRelations = relations;
    }

    public set successorRelations(relations: RelationResource[]) {
        this._successorRelations = relations;
    }

    public set successorCriticalRelations(relations: RelationResource[]) {
        this._successorCriticalRelations = relations;
    }

    public get successorRelations(): RelationResource[] {
        return [...this._successorRelations, ...this._successorCriticalRelations];
    }

    public get predecessorRelations(): RelationResource[] {
        return [...this._predecessorRelations, ...this._predecessorCriticalRelations];
    }

    public statistics: TaskStatistics;

    private _predecessorRelations: RelationResource[] = [];

    private _predecessorCriticalRelations: RelationResource[] = [];

    private _successorRelations: RelationResource[] = [];

    private _successorCriticalRelations: RelationResource[] = [];
}
