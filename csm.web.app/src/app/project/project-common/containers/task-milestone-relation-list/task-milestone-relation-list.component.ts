/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Input,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription
} from 'rxjs';
import {map} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MilestoneSortHelper} from '../../helpers/milestone-sort.helper';
import {Milestone} from '../../models/milestones/milestone';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {RelationActions} from '../../store/relations/relation.actions';
import {RelationQueries} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export interface TaskMilestone {
    id: string;
    milestone: Milestone;
}

@Component({
    selector: 'ss-task-milestone-relation-list',
    templateUrl: './task-milestone-relation-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskMilestoneRelationListComponent implements OnInit, OnDestroy {

    @Input()
    public task: Task;

    public canShowGroupListSelection: boolean;

    public groups: GroupItem<TaskMilestone>[];

    public itemsPerGroupItem = 3;

    private _disposableSubscriptions = new Subscription();

    private _taskMilestoneRelationGroupId = 'ss-task-milestone-relation-groupId';

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _relationQueries: RelationQueries,
                private _store: Store,
                private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestTaskMilestonesRelations();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleMilestoneCardClicked(milestone: Milestone): void {
        this._store.dispatch(
            new CalendarScopeActions.Resolve.NavigateToElement(
                new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)
            )
        );
    }

    private _handleMilestonesOfTask(milestones: Milestone[]): void {
        this._setGroupsFromMilestones(milestones);

        this._changeDetectorRef.detectChanges();
    }

    private _handleMilestonesOfTaskRelations(relations: RelationResource[]): void {
        this._setGroupsFromRelations(relations);
        this._setCanShowGroupListSelection(relations.length);

        this._changeDetectorRef.detectChanges();
    }

    private _requestTaskMilestonesRelations(): void {
        const payload = SaveRelationFilters.forTaskMilestonesByTaskId(this.task.id);
        this._store.dispatch(new RelationActions.Request.All(payload, true));
    }

    private _setCanShowGroupListSelection(numberOfRelations: number): void {
        this.canShowGroupListSelection = numberOfRelations > 0;
    }

    private _setGroupsFromMilestones(milestones: Milestone[]): void {
        this.groups = [{
            id: this._taskMilestoneRelationGroupId,
            items: milestones.map(milestone => ({
                id: milestone.id,
                milestone,
            })),
        }];
    }

    private _setGroupsFromRelations(relations: RelationResource[]): void {
        this.groups = [{
            id: this._taskMilestoneRelationGroupId,
            items: relations.map(relation => ({
                id: relation.id,
                milestone: null,
            })),
        }];
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._relationQueries.observePartOfRelationsByTaskId(this.task.id)
                .subscribe(relations => this._handleMilestonesOfTaskRelations(relations)));

        this._disposableSubscriptions.add(
            combineLatest([
                this._workareaQueries.observeWorkareas(),
                this._relationQueries.observeRelationsTaskMilestonesByTaskId(this.task.id),
            ])
                .pipe(map(([workAreas, milestones]) => this._sortMilestoneCards(milestones, workAreas)))
                .subscribe(milestones => this._handleMilestonesOfTask(milestones)));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _sortMilestoneCards(milestones: Milestone[], workAreas: WorkareaResource[]): Milestone[] {
        return MilestoneSortHelper.sortByCalendarView(milestones, workAreas);
    }
}
