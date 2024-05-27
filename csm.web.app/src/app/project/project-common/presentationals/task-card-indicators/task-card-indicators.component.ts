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
    OnChanges,
    SimpleChanges,
} from '@angular/core';

import {RelationResource} from '../../api/relations/resources/relation.resource';
import {TaskConstraintsResource} from '../../api/task-constraints/resources/task-constraints.resource';
import {TaskStatistics} from '../../api/tasks/resources/task.resource';

type TaskCardIndicatorsDependenciesType =
    'predecessors' | 'criticalPredecessors' |
    'successors' | 'criticalSuccessors' |
    'both' | 'criticalBoth';

type TaskCardIndicatorsTopicsType = 'critical' | 'uncritical';

type TaskCardIndicatorsIcon = { [key in TaskCardIndicatorsIconState]: string };

type TaskCardIndicatorsIconState = 'normal' | 'focus' | 'dimmed';

@Component({
    selector: 'ss-task-card-indicators',
    templateUrl: './task-card-indicators.component.html',
    styleUrls: ['./task-card-indicators.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskCardIndicatorsComponent implements OnChanges {

    @Input()
    public set constraints(constraints: TaskConstraintsResource) {
        this._constraints = constraints;

        this._setConstraintsIcon();
        this._setConstraintsLabel();
    }

    @Input()
    public isDimmed: boolean;

    @Input()
    public isFocused: boolean;

    @Input()
    public isSelected: boolean;

    @Input()
    public set predecessorRelations(relations: RelationResource[]) {
        this._hasPredecessors = relations.length > 0;
        this._hasCriticalPredecessors = relations.some(relation => relation.critical);

        this._setDependenciesType();
        this._setDependenciesIcon();
        this._setDependenciesLabel();
    }

    @Input()
    public set successorRelations(relations: RelationResource[]) {
        this._hasSuccessors = relations.length > 0;
        this._hasCriticalSuccessors = relations.some(relation => relation.critical);

        this._setDependenciesType();
        this._setDependenciesIcon();
        this._setDependenciesLabel();
    }

    @Input()
    public set statistics(statistics: TaskStatistics) {
        this._statistics = statistics;

        this._setTopicsType();
        this._setTopicsIcon();
        this._setTopicsLabel();
    }

    public constraintsIcon: string;

    public constraintsLabel: string;

    public dependenciesIcon: string;

    public dependenciesLabel: string;

    public topicsIcon: string;

    public topicsLabel: string;

    private _constraints: TaskConstraintsResource;

    private readonly _constraintsIcons: TaskCardIndicatorsIcon = {
        normal: 'problem-tiny',
        focus: 'problem-tiny-focus',
        dimmed: 'problem-tiny',
    };

    private readonly _dependenciesIcons: { [key in TaskCardIndicatorsDependenciesType]: TaskCardIndicatorsIcon } = {
        predecessors: {
            normal: 'dependencies-predecessor-tiny',
            focus: 'dependencies-predecessor-tiny-focus',
            dimmed: 'dependencies-predecessor-tiny-focus',
        },
        criticalPredecessors: {
            normal: 'dependencies-predecessor-critical-tiny',
            focus: 'dependencies-predecessor-critical-tiny-focus',
            dimmed: 'dependencies-predecessor-critical-tiny',
        },
        successors: {
            normal: 'dependencies-successor-tiny',
            focus: 'dependencies-successor-tiny-focus',
            dimmed: 'dependencies-successor-tiny-focus',
        },
        criticalSuccessors: {
            normal: 'dependencies-successor-critical-tiny',
            focus: 'dependencies-successor-critical-tiny-focus',
            dimmed: 'dependencies-successor-critical-tiny',
        },
        both: {
            normal: 'dependencies-tiny',
            focus: 'dependencies-tiny-focus',
            dimmed: 'dependencies-tiny-focus',
        },
        criticalBoth: {
            normal: 'dependencies-critical-tiny',
            focus: 'dependencies-critical-tiny-focus',
            dimmed: 'dependencies-critical-tiny',
        },
    };

    private readonly _dependenciesLabels: { [key in TaskCardIndicatorsDependenciesType]: string } = {
        predecessors: 'Generic_Predecessor',
        criticalPredecessors: 'Generic_CriticalPredecessor',
        successors: 'Generic_Successor',
        criticalSuccessors: 'Generic_CriticalSuccessor',
        both: 'Generic_PredecessorAndSuccessor',
        criticalBoth: 'Generic_CriticalPredecessorAndSuccessor',
    };

    private _dependenciesType: TaskCardIndicatorsDependenciesType;

    private _hasPredecessors: boolean;

    private _hasCriticalPredecessors: boolean;

    private _hasSuccessors: boolean;

    private _hasCriticalSuccessors: boolean;

    private _iconState: TaskCardIndicatorsIconState;

    private _statistics: TaskStatistics;

    private readonly _topicsIcons: { [key in TaskCardIndicatorsTopicsType]: TaskCardIndicatorsIcon } = {
        critical: {
            normal: 'topic-critical-tiny',
            focus: 'topic-critical-tiny-focus',
            dimmed: 'topic-critical-tiny',
        },
        uncritical: {
            normal: 'topic-tiny',
            focus: 'topic-tiny-focus',
            dimmed: 'topic-tiny-focus',
        },
    };

    private _topicsType: TaskCardIndicatorsTopicsType;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.hasOwnProperty('isDimmed') ||
            changes.hasOwnProperty('isFocused') ||
            changes.hasOwnProperty('isSelected')) {
            this._setIconState();
            this._setConstraintsIcon();
            this._setDependenciesIcon();
            this._setTopicsIcon();
        }
    }

    private _setConstraintsIcon(): void {
        const hasConstraints = this._constraints?.items?.length;

        if (hasConstraints) {
            this.constraintsIcon = this._constraintsIcons[this._iconState];
        } else {
            this.constraintsIcon = null;
        }
    }

    private _setConstraintsLabel(): void {
        this.constraintsLabel = this._constraints?.items.map(constraint => constraint.name).join(', ');
    }

    private _setDependenciesIcon(): void {
        this.dependenciesIcon = this._dependenciesIcons[this._dependenciesType]?.[this._iconState];
    }

    private _setDependenciesLabel(): void {
        this.dependenciesLabel = this._dependenciesLabels[this._dependenciesType];
    }

    private _setDependenciesType(): void {
        if (this._hasPredecessors && !this._hasSuccessors) {
            this._dependenciesType = this._hasCriticalPredecessors ? 'criticalPredecessors' : 'predecessors';
        } else if (this._hasSuccessors && !this._hasPredecessors) {
            this._dependenciesType = this._hasCriticalSuccessors ? 'criticalSuccessors' : 'successors';
        } else if (this._hasPredecessors && this._hasSuccessors) {
            this._dependenciesType = this._hasCriticalSuccessors || this._hasCriticalPredecessors ? 'criticalBoth' : 'both';
        } else {
            this._dependenciesType = null;
        }
    }

    private _setTopicsType(): void {
        const {criticalTopics, uncriticalTopics} = this._statistics || {criticalTopics: 0, uncriticalTopics: 0};
        const hasCriticalTopics = criticalTopics > 0;
        const hasUncriticalTopics = uncriticalTopics > 0;

        if (hasCriticalTopics) {
            this._topicsType = 'critical';
        } else if (hasUncriticalTopics) {
            this._topicsType = 'uncritical';
        } else {
            this._topicsType = null;
        }
    }

    private _setTopicsIcon(): void {
        this.topicsIcon = this._topicsIcons[this._topicsType]?.[this._iconState];
    }

    private _setTopicsLabel(): void {
        const criticalTopics = this._statistics?.criticalTopics || 0;
        const hasCriticalTopics = criticalTopics > 0;

        this.topicsLabel = hasCriticalTopics ? 'Generic_CriticalTopics' : 'Generic_Topics';
    }

    private _setIconState(): void {
        if (this.isSelected || this.isFocused) {
            this._iconState = 'focus';
        } else if (this.isDimmed) {
            this._iconState = 'dimmed';
        } else {
            this._iconState = 'normal';
        }
    }
}
