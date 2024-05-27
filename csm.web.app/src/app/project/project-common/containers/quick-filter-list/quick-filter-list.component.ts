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
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {Store} from '@ngrx/store';
import {
    combineLatest,
    Subscription,
} from 'rxjs';
import {filter} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {SelectOption} from '../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectFiltersCriteriaResource} from '../../api/misc/resources/project-filters-criteria.resource';
import {
    QuickFilter,
    QuickFilterId
} from '../../models/quick-filters/quick-filter';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {
    ParticipantByCompany,
    ProjectParticipantQueries,
} from '../../store/participants/project-participant.queries';
import {QuickFilterActions} from '../../store/quick-filters/quick-filter.actions';
import {QuickFilterQueries} from '../../store/quick-filters/quick-filter.queries';
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria,
} from '../../store/tasks/slice/project-task-filters-criteria';

export interface DefaultQuickFilter {
    id: QuickFilterId;
    name: string;
    criteria: ProjectFiltersCriteriaResource;
    useMilestoneCriteria: boolean;
    useTaskCriteria: boolean;
    highlight: boolean;
}

export interface QuickFilterOption {
    option: SelectOption;
    dropdownItems: MenuItemsList[];
}

export interface QuickFilterListFormData {
    quickFilter: QuickFilterId;
}

export const DELETE_QUICK_FILTER_ITEM_ID = 'delete-quick-filter';
export const UPDATE_QUICK_FILTER_ITEM_ID = 'update-quick-filter';

export const QUICK_FILTER_LIST_DEFAULT_VALUE: QuickFilterListFormData = {
    quickFilter: 'all',
};

@Component({
    selector: 'ss-quick-filter-list',
    templateUrl: './quick-filter-list.component.html',
    styleUrls: ['./quick-filter-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFilterListComponent implements OnInit, OnDestroy {

    @Input()
    public set appliedFilterId(quickFilter: QuickFilterId) {
        this._appliedFilterId = quickFilter;
        this._setFormValue({quickFilter});
    }

    @Output()
    public apply = new EventEmitter<QuickFilter | DefaultQuickFilter>();

    @Output()
    public create = new EventEmitter<void>();

    @Output()
    public edit = new EventEmitter<QuickFilterId>();

    public canCreateUserQuickFilters: boolean;

    public defaultQuickFiltersOptions: QuickFilterOption[] = [];

    public readonly form = this._formBuilder.group({
        quickFilter: new FormControl(QUICK_FILTER_LIST_DEFAULT_VALUE.quickFilter),
    });

    public userQuickFiltersOptions: QuickFilterOption[] = [];

    private _appliedFilterId: QuickFilterId;

    private _defaultQuickFilters: DefaultQuickFilter[] = [];

    private _disposableSubscriptions = new Subscription();

    private _userQuickFilters: QuickFilter[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _formBuilder: FormBuilder,
                private _modalService: ModalService,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _quickFilterQueries: QuickFilterQueries,
                private _store: Store<State>,
                private _userQueries: UserQueries) {
    }

    ngOnInit() {
        this._requestQuickFilters();
        this._requestParticipants();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleCreate(): void {
        this.create.emit();
    }

    public handleDropdownItemClicked({id: itemId, value: {id, version}}: MenuItem<QuickFilter>): void {
        switch (itemId) {
            case UPDATE_QUICK_FILTER_ITEM_ID:
                this._handleUpdate(id);
                break;
            case DELETE_QUICK_FILTER_ITEM_ID:
                this._handleDelete(id, version);
                break;
        }
    }

    public trackByFn(index: number, item: QuickFilterOption): string {
        return item.option.value;
    }

    private _applyFilter(filterId: QuickFilterId): void {
        const quickFilter = [
            ...this._defaultQuickFilters,
            ...this._userQuickFilters,
        ].find(({id}) => id === filterId);

        if (quickFilter) {
            this.apply.emit(quickFilter);
        }
    }

    private _handleDelete(id: QuickFilterId, version: number): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'QuickFilter_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new QuickFilterActions.Delete.One(id, version)),
                cancelCallback: () => this._store.dispatch(new QuickFilterActions.Delete.OneReset()),
                requestStatusObservable: this._quickFilterQueries.observeCurrentQuickFilterRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _handleUpdate(id: QuickFilterId): void {
        this.edit.emit(id);
    }

    private _requestParticipants(): void {
        this._store.dispatch(new ProjectParticipantActions.Request.AllActive());
    }

    private _requestQuickFilters(): void {
        this._store.dispatch(new QuickFilterActions.Request.All());
    }

    private _setDefaultQuickFilters(participantsByCompany: ParticipantByCompany[], currentUser: UserResource): void {
        const myCompany = participantsByCompany.find(({participants}) => participants.some(({user}) => user.id === currentUser.id));
        const currentParticipant = myCompany.participants.find(({user}) => user.id === currentUser.id);

        this._defaultQuickFilters = [
            {
                id: 'all',
                name: 'Generic_AllTasks',
                criteria: new ProjectFiltersCriteriaResource(),
                useMilestoneCriteria: true,
                useTaskCriteria: true,
                highlight: false,
            },
            {
                id: 'my-company',
                name: 'Generic_MyCompanyLabel',
                criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                    tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                        assignees: new ProjectTaskFiltersAssignees([], [myCompany.id]),
                    }),
                }),
                useMilestoneCriteria: true,
                useTaskCriteria: true,
                highlight: false,
            },
            {
                id: 'my-tasks',
                name: 'Generic_MyTasks',
                criteria: Object.assign(new ProjectFiltersCriteriaResource(), {
                    tasks: Object.assign(new ProjectTaskFiltersCriteria(), {
                        assignees: new ProjectTaskFiltersAssignees([currentParticipant.id], []),
                    }),
                }),
                useMilestoneCriteria: true,
                useTaskCriteria: true,
                highlight: false,
            },
        ];

        this.defaultQuickFiltersOptions = this._defaultQuickFilters.map(({id, name}) => ({
            option: {
                label: name,
                value: id,
            },
            dropdownItems: [],
        }));

        this._changeDetectorRef.detectChanges();
    }

    private _getDropdownItems(quickFilter: QuickFilter): MenuItemsList[] {
        const {permissions: {canDelete, canUpdate}} = quickFilter;
        const items: MenuItem<QuickFilter>[] = [];

        if (canUpdate) {
            items.push({
                id: UPDATE_QUICK_FILTER_ITEM_ID,
                type: 'button',
                label: 'QuickFilter_Update_Label',
                value: quickFilter,
            });
        }

        if (canDelete) {
            items.push({
                id: DELETE_QUICK_FILTER_ITEM_ID,
                type: 'button',
                label: 'QuickFilter_Delete_Label',
                value: quickFilter,
            });
        }

        return items.length ? [{items}] : [];
    }

    private _setUserQuickFilters(quickFilters: QuickFilter[]): void {
        this._userQuickFilters = quickFilters;
        this.userQuickFiltersOptions = quickFilters.map(quickFilter => ({
            option: {
                label: quickFilter.name,
                value: quickFilter.id,
            },
            dropdownItems: this._getDropdownItems(quickFilter),
        }));

        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._quickFilterQueries.observeQuickFilterList()
                .subscribe(quickFilters => this._setUserQuickFilters(quickFilters))
        );

        this._disposableSubscriptions.add(
            this._quickFilterQueries.observeQuickFilterListCreatePermission()
                .subscribe(canCreate => {
                    this.canCreateUserQuickFilters = canCreate;
                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._userQueries.observeCurrentUser(),
                this._projectParticipantQueries.observeActiveParticipantsByCompanies(),
            ]).pipe(filter(([currentUser, participantsByCompany]) => !!currentUser && !!participantsByCompany.length)
            ).subscribe(([currentUser, participantsByCompany]) => this._setDefaultQuickFilters(participantsByCompany, currentUser))
        );

        this._disposableSubscriptions.add(
            this.form.controls.quickFilter.valueChanges
                .pipe(filter(value => value !== this._appliedFilterId))
                .subscribe(value => this._applyFilter(value))
        );
    }

    private _setFormValue(value: QuickFilterListFormData): void {
        this.form.setValue(value);
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
