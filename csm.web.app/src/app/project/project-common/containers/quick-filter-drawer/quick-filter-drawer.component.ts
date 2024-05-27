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
    Inject,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {
    Action,
    Store,
} from '@ngrx/store';
import {
    combineLatest,
    Observable,
    Subscription,
} from 'rxjs';
import {take} from 'rxjs/operators';

import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BreakpointHelper} from '../../../../shared/misc/helpers/breakpoint.helper';
import {
    DRAWER_DATA,
    DrawerService,
} from '../../../../shared/ui/drawer/api/drawer.service';
import {SaveQuickFilterResource} from '../../api/quick-filters/resources/save-quick-filter.resource';
import {
    QuickFilter,
    QuickFilterId,
} from '../../models/quick-filters/quick-filter';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {QuickFilterActions} from '../../store/quick-filters/quick-filter.actions';
import {QuickFilterQueries} from '../../store/quick-filters/quick-filter.queries';
import {QuickFilterContext} from '../../store/quick-filters/quick-filter.slice';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {ProjectFilterFormData} from '../project-filter-capture/project-filter-capture.component';
import {
    QuickFilterCaptureComponent,
    QuickFilterCaptureFormData,
} from '../quick-filter-capture/quick-filter-capture.component';
import {DefaultQuickFilter} from '../quick-filter-list/quick-filter-list.component';

export type QuickFilterDrawerActivePanel = 'list' | 'edit' | 'create';

export const DEFAULT_FILTERS: ProjectFilterFormData = {
    task: new ProjectTaskFilters(),
    milestone: new MilestoneFilters(),
};

@Component({
    selector: 'ss-quick-filter-drawer',
    templateUrl: './quick-filter-drawer.component.html',
    styleUrls: ['./quick-filter-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickFilterDrawerComponent implements OnInit, OnDestroy {

    @ViewChild('quickFilterCapture')
    public quickFilterCapture: QuickFilterCaptureComponent;

    public activePanel: QuickFilterDrawerActivePanel = 'list';

    public appliedFilterId: QuickFilterId;

    public isFormValid: boolean;

    public isLoading: boolean;

    public quickFilterCaptureFormData: QuickFilterCaptureFormData = {
        name: null,
        projectFilter: DEFAULT_FILTERS,
    };

    public readonly form = this._formBuilder.group({
        highlight: new FormControl(false),
    });

    public showHighlightOption = false;

    private _appliedFilters: ProjectFilterFormData = DEFAULT_FILTERS;

    private _editFilter: QuickFilter;

    private readonly _disposableSubscriptions: Subscription = new Subscription();

    private readonly _taskFiltersActions: { [key in QuickFilterContext]: (filters: ProjectTaskFilters) => Action } = {
        list: filters => new ProjectTaskActions.Set.Filters(filters),
        calendar: filters => new ProjectTaskActions.Set.CalendarFilters(filters),
    };

    private readonly _taskFiltersObservable: { [key in QuickFilterContext]: Observable<ProjectTaskFilters> } = {
        list: this._projectTaskQueries.observeTaskListFilters(),
        calendar: this._projectTaskQueries.observeCalendarFilters(),
    };

    constructor(@Inject(DRAWER_DATA) public context: QuickFilterContext,
                private _breakpointHelper: BreakpointHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _drawerService: DrawerService,
                private _formBuilder: FormBuilder,
                private _milestoneQueries: MilestoneQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _quickFilterQueries: QuickFilterQueries,
                private _store: Store) {
    }

    ngOnInit() {
        this._setSubscriptions();
        this.showHighlightOption = this.context === 'calendar';
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleApplyQuickFilter(quickFilter: QuickFilter | DefaultQuickFilter): void {
        const taskFilters: ProjectTaskFilters = this._mapQuickFilterToProjectTaskFilters(quickFilter);
        const milestoneFilters: MilestoneFilters = this._mapQuickFilterToMilestoneFilters(quickFilter);

        this._dispatchSetTaskFiltersAction(taskFilters);

        if (this.context === 'calendar') {
            this._store.dispatch(new MilestoneActions.Set.Filters(milestoneFilters));
        }
        this._store.dispatch(new QuickFilterActions.Set.AppliedFilter(quickFilter.id, this.context));

        if (this._breakpointHelper.currentBreakpoint() === 'xs') {
            this._drawerService.close();
        }
    }

    public handleCloseCapture(): void {
        this.activePanel = 'list';
        this.resetForm();
    }

    public handleCloseDrawer(): void {
        this._drawerService.close();
    }

    public handleCreate(): void {
        this.activePanel = 'create';

        if (!this.appliedFilterId) {
            const highlight = this._appliedFilters.task.highlight || this._appliedFilters.milestone?.highlight;

            this._setQuickFilterCaptureFormData(this._appliedFilters);
            this._setFormValue(highlight);
        }

        this._changeDetectorRef.detectChanges();
    }

    public handleEdit(filterId: QuickFilterId): void {
        this.activePanel = 'edit';

        this._quickFilterQueries.observeQuickFilterById(filterId)
            .pipe(take(1))
            .subscribe((quickFilter: QuickFilter) => {
                const {name, highlight} = quickFilter;
                const projectFilters = this._mapQuickFilterToProjectFilterFormData(quickFilter);
                this._editFilter = quickFilter;

                this._setQuickFilterCaptureFormData(projectFilters, name);
                this._setFormValue(highlight);
                this._changeDetectorRef.detectChanges();
            });
    }

    public resetForm(): void {
        this._setQuickFilterCaptureFormData(DEFAULT_FILTERS);
        this._setFormValue(false);
    }

    public handleFormValidityChange(isFormValid: boolean): void {
        this.isFormValid = isFormValid;
        this._changeDetectorRef.detectChanges();
    }

    public submitForm(): void {
        const saveQuickFilterResource: SaveQuickFilterResource = this._getSubmitValue();

        switch (this.activePanel) {
            case 'create':
                this._store.dispatch(new QuickFilterActions.Create.One(saveQuickFilterResource, this.context));
                break;
            case 'edit': {
                const {id, version} = this._editFilter;

                this._store.dispatch(new QuickFilterActions.Update.One(id, saveQuickFilterResource, version));
                break;

            }
        }
    }

    private _dispatchSetTaskFiltersAction(filters: ProjectTaskFilters): void {
        this._store.dispatch(this._taskFiltersActions[this.context](filters));
    }

    private _getSubmitValue(): SaveQuickFilterResource {
        const criteriaFormValue = this.quickFilterCapture.getFormValue();
        const {name, projectFilter: {task, milestone}} = criteriaFormValue;
        const highlight = this.form.value.highlight;

        return SaveQuickFilterResource.fromFormData(name, task, milestone, highlight);
    }

    private _handleRequestStatus(status: RequestStatusEnum): void {
        if (this.activePanel === 'edit' || this.activePanel === 'create') {
            this.isLoading = status === RequestStatusEnum.progress;

            if (status === RequestStatusEnum.success) {
                this.handleCloseCapture();
            }
            this._changeDetectorRef.detectChanges();
        }
    }

    private _mapQuickFilterToProjectTaskFilters(quickFilter: QuickFilter | DefaultQuickFilter): ProjectTaskFilters {
        const {criteria: {tasks}, useTaskCriteria, highlight} = quickFilter;

        return Object.assign<ProjectTaskFilters, Partial<ProjectTaskFilters>>(new ProjectTaskFilters(), {
            highlight,
            criteria: tasks,
            useCriteria: useTaskCriteria,
        });
    }

    private _mapQuickFilterToMilestoneFilters(quickFilter: QuickFilter | DefaultQuickFilter): MilestoneFilters {
        const {criteria: {milestones}, useMilestoneCriteria, highlight} = quickFilter;

        return Object.assign<MilestoneFilters, Partial<MilestoneFilters>>(new MilestoneFilters(), {
            highlight,
            criteria: milestones,
            useCriteria: useMilestoneCriteria,
        });
    }

    private _mapQuickFilterToProjectFilterFormData(quickFilter: QuickFilter): ProjectFilterFormData {
        return {
            task: this._mapQuickFilterToProjectTaskFilters(quickFilter),
            milestone: this._mapQuickFilterToMilestoneFilters(quickFilter),
        };
    }

    private _setAppliedFilterId(filterId: QuickFilterId): void {
        this.appliedFilterId = filterId;
        this._changeDetectorRef.detectChanges();
    }

    private _setAppliedFilters(taskFilters: ProjectTaskFilters, milestoneFilters: MilestoneFilters): void {
        this._appliedFilters = {
            task: taskFilters,
            milestone: milestoneFilters,
        };
    }

    private _setFormValue(highlight: boolean): void {
        this.form.setValue({highlight});
    }

    private _setQuickFilterCaptureFormData(projectFilter: ProjectFilterFormData, name: string = null): void {
        this.quickFilterCaptureFormData = {
            name,
            projectFilter,
        };
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._quickFilterQueries.observeCurrentQuickFilterRequestStatus()
                .subscribe((status: RequestStatusEnum) => this._handleRequestStatus(status))
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._taskFiltersObservable[this.context],
                this._milestoneQueries.observeFilters(),
            ]).subscribe(([taskFilters, milestoneFilters]: [ProjectTaskFilters, MilestoneFilters]) =>
                this._setAppliedFilters(taskFilters, milestoneFilters))
        );

        this._disposableSubscriptions.add(
            this._quickFilterQueries.observeAppliedFilterByContext(this.context)
                .subscribe(filterId => this._setAppliedFilterId(filterId))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
