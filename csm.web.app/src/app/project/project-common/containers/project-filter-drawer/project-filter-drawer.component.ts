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

import {
    DRAWER_DATA,
    DrawerService,
} from '../../../../shared/ui/drawer/api/drawer.service';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneActions} from '../../store/milestones/milestone.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {ProjectTaskActions} from '../../store/tasks/task.actions';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {
    ProjectFilterCaptureComponent,
    ProjectFiltersCaptureContextEnum,
} from '../project-filter-capture/project-filter-capture.component';

export type ProjectFilterDrawerContext = ProjectFiltersCaptureContextEnum.Calendar | ProjectFiltersCaptureContextEnum.TaskList;

@Component({
    selector: 'ss-project-filter-drawer',
    templateUrl: './project-filter-drawer.component.html',
    styleUrls: ['./project-filter-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFilterDrawerComponent implements OnInit, OnDestroy {

    @ViewChild('projectFilterCapture')
    public projectFilterCapture: ProjectFilterCaptureComponent;

    public readonly form = this._formBuilder.group({
        highlight: new FormControl(false),
    });

    public isFormValid: boolean;

    public projectTaskFilters = new ProjectTaskFilters();

    public milestoneFilters = new MilestoneFilters();

    public showHighlightOption = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _taskFilterActions: { [key in ProjectFilterDrawerContext]: (filters: ProjectTaskFilters) => Action } = {
        [ProjectFiltersCaptureContextEnum.TaskList]: filters => new ProjectTaskActions.Set.Filters(filters),
        [ProjectFiltersCaptureContextEnum.Calendar]: filters => new ProjectTaskActions.Set.CalendarFilters(filters),
    };

    private _taskFilterObservable: { [key in ProjectFilterDrawerContext]: Observable<ProjectTaskFilters> } = {
        [ProjectFiltersCaptureContextEnum.TaskList]: this._projectTaskQueries.observeTaskListFilters(),
        [ProjectFiltersCaptureContextEnum.Calendar]: this._projectTaskQueries.observeCalendarFilters(),
    };

    constructor(@Inject(DRAWER_DATA) public context: ProjectFilterDrawerContext,
                private _changeDetectorRef: ChangeDetectorRef,
                private _drawerService: DrawerService,
                private _formBuilder: FormBuilder,
                private _milestoneQueries: MilestoneQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store) {
    }

    ngOnInit(): void {
        this._requestCrafts();
        this._requestParticipants();
        this._requestWorkAreas();
        this._setSubscriptions();
        this._setHighlightOption();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleClearFilters(): void {
        if (this.context !== ProjectFiltersCaptureContextEnum.TaskList) {
            this._dispatchSetMilestoneFiltersAction(new MilestoneFilters());
        }

        this._dispatchSetTaskFiltersAction(new ProjectTaskFilters());
    }

    public handleClose(): void {
        this._drawerService.close();
    }

    public handleFormValidityChange(isFormValid: boolean): void {
        this.isFormValid = isFormValid;
        this._changeDetectorRef.detectChanges();
    }

    public handleMilestoneFiltersChanged(criteria: MilestoneFiltersCriteria): void {
        const newFilters = Object.assign(new MilestoneFilters(), this.milestoneFilters, {criteria});

        this._dispatchSetMilestoneFiltersAction(newFilters);
    }

    public handleTaskFiltersChanged(criteria: ProjectTaskFiltersCriteria): void {
        const newFilters = Object.assign(new ProjectTaskFilters(), this.projectTaskFilters, {criteria});

        this._dispatchSetTaskFiltersAction(newFilters);
    }

    public submitForm(): void {
        const highlight = this.form.value.highlight;
        const {task, milestone} = this.projectFilterCapture.getFormValue();

        task.highlight = highlight;
        this._dispatchSetTaskFiltersAction(task);

        if (milestone) {
            milestone.highlight = highlight;
            this._dispatchSetMilestoneFiltersAction(milestone);
        }

        this._drawerService.close();
    }

    public resetForm(): void {
        this._setProjectTaskFilters(new ProjectTaskFilters());
        this._setMilestoneFilters(new MilestoneFilters());
        this._setFormValue(false);
    }

    private _dispatchSetMilestoneFiltersAction(filters: MilestoneFilters): void {
        this._store.dispatch(new MilestoneActions.Set.Filters(filters));
    }

    private _dispatchSetTaskFiltersAction(filters: ProjectTaskFilters): void {
        this._store.dispatch(this._taskFilterActions[this.context](filters));
    }

    private _setFormValue(highlight: boolean): void {
        this.form.setValue({highlight});
    }

    private _setHighlightOption(): void {
        this.showHighlightOption = this.context === ProjectFiltersCaptureContextEnum.Calendar;
        this._changeDetectorRef.detectChanges();
    }

    private _setMilestoneFilters(milestoneFilters: MilestoneFilters): void {
        this.milestoneFilters = milestoneFilters;
    }

    private _setProjectTaskFilters(projectTaskFilters: ProjectTaskFilters): void {
        this.projectTaskFilters = projectTaskFilters;
    }

    private _requestCrafts(): void {
        this._store.dispatch(new ProjectCraftActions.Request.All());
    }

    private _requestParticipants(): void {
        this._store.dispatch(new ProjectParticipantActions.Request.AllActive());
    }

    private _requestWorkAreas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _setSubscriptions(): void {
        if (this.context === ProjectFiltersCaptureContextEnum.Calendar) {
            this._disposableSubscriptions.add(
                this._milestoneQueries.observeFilters()
                    .subscribe(milestoneFilters => {
                        this._setMilestoneFilters(milestoneFilters);
                        this._changeDetectorRef.detectChanges();
                    }));

            this._disposableSubscriptions.add(
                combineLatest([
                    this._taskFilterObservable[this.context],
                    this._milestoneQueries.observeFilters(),
                ])
                    .subscribe(([{highlight: highlightTask}, {highlight: highlightMilestone}]) => {
                        this._setFormValue(highlightTask || highlightMilestone);
                        this._changeDetectorRef.detectChanges();
                    })
            );
        }

        this._disposableSubscriptions.add(
            this._taskFilterObservable[this.context]
                .subscribe(projectTaskFilters => {
                    this._setProjectTaskFilters(projectTaskFilters);
                    this._changeDetectorRef.detectChanges();
                }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
