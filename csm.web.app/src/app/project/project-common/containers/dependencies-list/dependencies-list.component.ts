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
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {sum} from 'lodash';
import {
    combineLatest,
    Observable,
    Subscription,
} from 'rxjs';
import {
    filter,
    map,
    pairwise,
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {BREAKPOINTS_RANGE as breakpointsRange} from '../../../../shared/ui/constants/breakpoints.constant';
import {GroupItem} from '../../../../shared/ui/group-item-list/group-item-list.component';
import {
    MultipleSelectionToolbarData,
    MultipleSelectionToolbarTranslations,
} from '../../../../shared/ui/group-list-selection/group-list-selection.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {MultipleSelectionToolbarConfirmationModeEnum} from '../../../../shared/ui/multiple-selection-toolbar-confirmation/multiple-selection-toolbar-confirmation.component';
import {RelationResource} from '../../api/relations/resources/relation.resource';
import {SaveRelationResource} from '../../api/relations/resources/save-relation.resource';
import {SaveRelationFilters} from '../../api/relations/resources/save-relation-filters';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {DependenciesSortHelper} from '../../helpers/dependencies-sort.helper';
import {Milestone} from '../../models/milestones/milestone';
import {RelationWithResource} from '../../models/relation-with-resource/relation-with-resource';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';
import {RelationActions} from '../../store/relations/relation.actions';
import {RelationResourceDirection} from '../../store/relations/relation.queries';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export interface Dependency {
    id: string;
    type: ObjectTypeEnum;
    resource: Task | Milestone;
    actions: MenuItemsList[];
    critical: boolean;
}

export interface DependenciesListRelationsObservables {
    predecessorsObservable: Observable<RelationResource[]>;
    predecessorsWithResourcesObservable: Observable<RelationWithResource<Task | Milestone>[]>;
    requestStatusObservable: Observable<RequestStatusEnum>;
    successorsObservable: Observable<RelationResource[]>;
    successorsWithResourcesObservable: Observable<RelationWithResource<Task | Milestone>[]>;
}

export enum DependencyTypeEnum {
    Successor = 'successor',
    Predecessor = 'predecessor',
}

export const MULTIPLE_SELECTION_TOOLBAR_TRANSLATIONS: { [key in DependencyTypeEnum]: MultipleSelectionToolbarTranslations } = {
    [DependencyTypeEnum.Predecessor]: {
        emptyItemsLabel: 'DependenciesList_MultipleSelectionToolbar_EmptyPredecessorsLabel',
        selectedItemLabel: 'DependenciesList_MultipleSelectionToolbar_SelectedPredecessorLabel',
        selectedItemsLabel: 'DependenciesList_MultipleSelectionToolbar_SelectedPredecessorsLabel',
    },
    [DependencyTypeEnum.Successor]: {
        emptyItemsLabel: 'DependenciesList_MultipleSelectionToolbar_EmptySuccessorsLabel',
        selectedItemLabel: 'DependenciesList_MultipleSelectionToolbar_SelectedSuccessorLabel',
        selectedItemsLabel: 'DependenciesList_MultipleSelectionToolbar_SelectedSuccessorsLabel',
    },
};

export const DEPENDENCIES_LIST_SUBMIT_PAYLOAD_BY_TYPE:
    { [key in DependencyTypeEnum]: { payloadParserFn: Function; successMessageKey: string } } = {
        [DependencyTypeEnum.Predecessor]: {
            payloadParserFn: SaveRelationResource.forPredecessor,
            successMessageKey: 'DependenciesList_CreateAllPredecessors_SuccessMessage',
        },
        [DependencyTypeEnum.Successor]: {
            payloadParserFn: SaveRelationResource.forSuccessor,
            successMessageKey: 'DependenciesList_CreateAllSuccessors_SuccessMessage',
        },
    };

export const DELETE_DEPENDENCY_ITEM_ID = 'delete-dependency';

@Component({
    selector: 'ss-dependencies-list',
    templateUrl: './dependencies-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DependenciesListComponent implements OnInit, OnDestroy {

    @Input()
    public originator: ObjectIdentifierPair;

    @Input()
    public set canAddDependencies(canAddDependencies: boolean) {
        this._canAddDependencies = canAddDependencies;

        this._setCanShowAddButton();
        this._setCanShowRelationList();
    }

    @Input()
    public set relationsObservables(relationsObservables: DependenciesListRelationsObservables) {
        this._unsetRelationsObservablesSubscriptions();
        this._setRelationsObservablesSubscriptions(relationsObservables);
    }

    @ViewChild('iconTemplate', {static: false})
    public iconTemplate: TemplateRef<any>;

    public canShowAddButton: boolean;

    public canShowRelationList: boolean;

    public dropdownItems: MenuItemsList<DependencyTypeEnum>[] = [];

    public groups: GroupItem<Dependency>[] = [];

    public isLoading: boolean;

    public itemsPerGroupItem = 3;

    public multipleSelectionToolbarData: MultipleSelectionToolbarData = null;

    public objectTypeEnumTask = ObjectTypeEnum.Task;

    public objectTypeEnumMilestone = ObjectTypeEnum.Milestone;

    private _canAddDependencies: boolean;

    private _calendarSelectionItems: ObjectIdentifierPair[] = [];

    private _currentDependencyTypeEnabled: DependencyTypeEnum;

    private _disposableSubscriptions = new Subscription();

    private _disposableRelationsObservablesSubscriptions = new Subscription();

    private _isSubmitting: boolean;

    private _isXsScreen: boolean;

    private _predecessorsGroupId = 'ss-dependencies-list-predecessors-groupId';

    private _successorsGroupId = 'ss-dependencies-list-successors-groupId';

    constructor(private _breakpointHelper: BreakpointHelper,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _store: Store,
                private _workareaQueries: WorkareaQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
        this._requestRelations();
        this._handleBreakpointChange();
        this._setDropdownItems();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleActionClicked({value}: MenuItem<RelationWithResource<Task | Milestone>>): void {
        this._store.dispatch(new RelationActions.Delete.One(value.id, value.version, 'DependenciesList_DeleteOne_SuccessMessage'));
    }

    public handleDropdownItemClicked({value}: MenuItem<DependencyTypeEnum>): void {
        this._handleAddDependency(value);
    }

    public handleMilestoneCardClicked(milestone: Milestone): void {
        this._store.dispatch(new CalendarScopeActions.Resolve.NavigateToElement(
            new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)));
    }

    public handleTaskCardClicked(task: Task): void {
        this._store.dispatch(new CalendarScopeActions.Resolve.NavigateToElement(
            new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)));
    }

    private _requestRelations(): void {
        const payload = SaveRelationFilters.forFinishToStartDependenciesByObjectIdentifierPair(this.originator);

        this._store.dispatch(new RelationActions.Request.All(payload, true));
    }

    private _handleAddDependency(dependencyType: DependencyTypeEnum): void {
        this._currentDependencyTypeEnabled = dependencyType;
        this._setMultipleSelectionToolbarData(dependencyType);

        this._store.dispatch(new CalendarSelectionActions.Set.Selection(true, CalendarSelectionContextEnum.Dependencies, []));
    }

    private _handleDismissSelection(): void {
        this._unsetMultipleSelectionToolbarData();

        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
    }

    private _createGroupItemFromRelations(id: string,
                                          title: string,
                                          relations: RelationResource[],
                                          direction: RelationResourceDirection): GroupItem<Dependency> {
        const items: Dependency[] = relations.map(relation => ({
            id: relation.id,
            type: relation[direction].type,
            critical: relation.critical,
            resource: null,
            actions: [],
        })
        );

        return {
            id,
            title,
            items,
        };
    }

    private _createGroupItemFromRelationsWithResources(id: string,
                                                       title: string,
                                                       relations: RelationWithResource<Task | Milestone>[]): GroupItem<Dependency> {
        const items: Dependency[] = relations.map(relation => {
            const actions: MenuItemsList[] = relation.permissions.canDelete ? [{
                items: [{
                    id: DELETE_DEPENDENCY_ITEM_ID,
                    type: 'button',
                    label: 'DependenciesList_DeleteOne_Label',
                    value: relation,
                }],
            }] : [];

            return {
                actions,
                id: relation.resource.id,
                type: relation.type,
                critical: relation.critical,
                resource: relation.resource,
            };
        });

        return {
            id,
            title,
            items,
        };
    }

    private _handleRequestStatus(requestStatus: RequestStatusEnum): void {
        if (this._isSubmitting && requestStatus !== RequestStatusEnum.progress) {
            this._isSubmitting = false;
        }

        this._setLoading(requestStatus);
        this._changeDetectorRef.detectChanges();
    }

    private _handleSubmitSelection(): void {
        const {payloadParserFn, successMessageKey} = DEPENDENCIES_LIST_SUBMIT_PAYLOAD_BY_TYPE[this._currentDependencyTypeEnabled];
        const payload: SaveRelationResource[] =
            this._calendarSelectionItems.map(selectedItem => payloadParserFn(this.originator, selectedItem));

        this._store.dispatch(new RelationActions.Create.All(payload, successMessageKey));
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());

        this._isSubmitting = true;
        this._unsetMultipleSelectionToolbarData();
    }

    private _handleRelationsWithResources(predecessors: RelationWithResource<Task | Milestone>[],
                                          successors: RelationWithResource<Task | Milestone>[]): void {
        this._setGroupsFromRelationsWithResources(predecessors, successors);

        this._changeDetectorRef.detectChanges();
    }

    private _handleRelations(predecessors: RelationResource[], successors: RelationResource[]): void {
        this._setGroupsFromRelations(predecessors, successors);
        this._setCanShowRelationList();

        this._changeDetectorRef.detectChanges();
    }

    private _handleBreakpointChange(): void {
        this._setIsXsScreen();
        this._setCanShowAddButton();

        this._changeDetectorRef.detectChanges();
    }

    private _handleCalendarSelectionItems(selectionItems: ObjectIdentifierPair[]): void {
        this._calendarSelectionItems = selectionItems;
        this._setMultipleSelectionToolbarData(this._currentDependencyTypeEnabled, selectionItems.length);
    }

    private _setCanShowAddButton(): void {
        this.canShowAddButton = this._canAddDependencies && !this._isXsScreen;
    }

    private _setCanShowRelationList(): void {
        const numberOfRelations = sum(this.groups.map(group => group.items.length));

        this.canShowRelationList = this._canAddDependencies || numberOfRelations > 0;
    }

    private _setDropdownItems(): void {
        this.dropdownItems = [{
            customFigureTemplate: this.iconTemplate,
            items: [
                {
                    id: DependencyTypeEnum.Predecessor,
                    type: 'button',
                    label: 'Generic_Predecessor',
                    customData: 'dependencies-predecessor',
                    value: DependencyTypeEnum.Predecessor,
                },
                {
                    id: DependencyTypeEnum.Successor,
                    type: 'button',
                    label: 'Generic_Successor',
                    customData: 'dependencies-successor',
                    value: DependencyTypeEnum.Successor,
                },
            ],
        }];

        this._changeDetectorRef.detectChanges();
    }

    private _setGroupsFromRelationsWithResources(predecessors: RelationWithResource<Task | Milestone>[],
                                                 successors: RelationWithResource<Task | Milestone>[]): void {
        this.groups = [
            this._createGroupItemFromRelationsWithResources(this._predecessorsGroupId, 'Generic_Predecessors', predecessors),
            this._createGroupItemFromRelationsWithResources(this._successorsGroupId, 'Generic_Successors', successors),
        ];
    }

    private _setGroupsFromRelations(predecessors: RelationResource[], successors: RelationResource[]): void {
        this.groups = [
            this._createGroupItemFromRelations(this._predecessorsGroupId, 'Generic_Predecessors', predecessors, 'source'),
            this._createGroupItemFromRelations(this._successorsGroupId, 'Generic_Successors', successors, 'target'),
        ];
    }

    private _setIsXsScreen(): void {
        this._isXsScreen = this._breakpointHelper.isCurrentBreakpoint(breakpointsRange.xs);
    }

    private _setLoading(requestStatus: RequestStatusEnum): void {
        this.isLoading = this._isSubmitting && requestStatus === RequestStatusEnum.progress;
    }

    private _setMultipleSelectionToolbarData(dependencyType: DependencyTypeEnum, itemsCount = 0): void {
        const {emptyItemsLabel, selectedItemLabel, selectedItemsLabel} = MULTIPLE_SELECTION_TOOLBAR_TRANSLATIONS[dependencyType];

        this.multipleSelectionToolbarData = {
            emptyItemsLabel,
            itemsCount,
            selectedItemLabel,
            selectedItemsLabel,
            mode: MultipleSelectionToolbarConfirmationModeEnum.Add,
            submitSelection: () => this._handleSubmitSelection(),
            dismissSelection: () => this._handleDismissSelection(),
        };

        this._changeDetectorRef.detectChanges();
    }

    private _setRelationsObservablesSubscriptions(relationsObservables: DependenciesListRelationsObservables): void {
        this._disposableRelationsObservablesSubscriptions = new Subscription();

        this._disposableRelationsObservablesSubscriptions.add(
            this._breakpointHelper.breakpointChange()
                .subscribe(() => this._handleBreakpointChange()));

        this._disposableRelationsObservablesSubscriptions.add(
            combineLatest([
                relationsObservables.predecessorsObservable,
                relationsObservables.successorsObservable,
            ]).subscribe(([predecessors, successors]) =>
                this._handleRelations(predecessors, successors))
        );

        this._disposableRelationsObservablesSubscriptions.add(
            combineLatest([
                relationsObservables.predecessorsWithResourcesObservable,
                relationsObservables.successorsWithResourcesObservable,
                this._workareaQueries.observeWorkareas(),
            ]).pipe(map(([predecessors, successors, workAreas]) => ([
                DependenciesSortHelper.sort(predecessors, workAreas),
                DependenciesSortHelper.sort(successors, workAreas),
            ]))).subscribe(([predecessors, successors]) =>
                this._handleRelationsWithResources(predecessors, successors)));

        this._disposableRelationsObservablesSubscriptions.add(
            relationsObservables.requestStatusObservable
                .subscribe(status => this._handleRequestStatus(status)));
    }

    private _unsetMultipleSelectionToolbarData(): void {
        this.multipleSelectionToolbarData = null;
        this._currentDependencyTypeEnabled = null;

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._calendarSelectionQueries.observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.Dependencies),
                this._calendarSelectionQueries.observeCalendarSelectionItems(),
            ])
                .pipe(
                    filter(([isDependenciesModeActive]) => isDependenciesModeActive),
                    map(([, items]) => items),
                )
                .subscribe(selectedItems => this._handleCalendarSelectionItems(selectedItems)));

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionIsContextActive(CalendarSelectionContextEnum.Dependencies)
                .pipe(
                    pairwise(),
                    filter(([prev, curr]) => prev && !curr)
                )
                .subscribe(() => this._unsetMultipleSelectionToolbarData()));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
        this._disposableRelationsObservablesSubscriptions.unsubscribe();
    }

    private _unsetRelationsObservablesSubscriptions(): void {
        this._disposableRelationsObservablesSubscriptions.unsubscribe();
    }
}
