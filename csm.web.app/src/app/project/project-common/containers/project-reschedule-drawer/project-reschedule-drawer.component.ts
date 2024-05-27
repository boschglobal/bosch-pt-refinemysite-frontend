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
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {Store} from '@ngrx/store';
import {isEqual} from 'lodash';
import * as moment from 'moment';
import {
    BehaviorSubject,
    combineLatest,
    Subscription,
} from 'rxjs';
import {
    delay,
    distinctUntilChanged,
    filter,
    map,
    take,
} from 'rxjs/operators';

import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {TimeScope} from '../../../../shared/misc/api/datatypes/time-scope.datatype';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {DrawerService} from '../../../../shared/ui/drawer/api/drawer.service';
import {DateRange} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {SaveMilestoneFilters} from '../../api/milestones/resources/save-milestone-filters';
import {RescheduleResource} from '../../api/reschedule/resources/reschedule.resource';
import {SaveRescheduleResource} from '../../api/reschedule/resources/save-reschedule.resource';
import {CalendarSelectionContextEnum} from '../../enums/calendar-selection-context.enum';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper,
} from '../../enums/task-status.enum';
import {TaskFiltersHelper} from '../../helpers/task-filters.helper';
import {Milestone} from '../../models/milestones/milestone';
import {Task} from '../../models/tasks/task';
import {CalendarScopeActions} from '../../store/calendar/calendar-scope/calendar-scope.actions';
import {CalendarScopeQueries} from '../../store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {ProjectCraftActions} from '../../store/crafts/project-craft.actions';
import {MilestoneQueries} from '../../store/milestones/milestone.queries';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectParticipantActions} from '../../store/participants/project-participant.actions';
import {RescheduleActions} from '../../store/reschedule/reschedule.actions';
import {RescheduleQueries} from '../../store/reschedule/reschedule.queries';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {SaveProjectTaskFilters} from '../../store/tasks/slice/save-project-task-filters';
import {ProjectTaskQueries} from '../../store/tasks/task-queries';
import {WorkareaActions} from '../../store/workareas/workarea.actions';
import {
    ProjectFilterCaptureComponent,
    ProjectFilterFormData,
    ProjectFiltersCaptureContextEnum,
} from '../project-filter-capture/project-filter-capture.component';
import {
    PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE,
    ProjectRescheduleShiftFormData,
} from '../reschedule-shift-capture/project-reschedule-shift-capture.component';

export type ProjectRescheduleDrawerStep = 'filter' | 'planning' | 'review';

@Component({
    selector: 'ss-project-reschedule-drawer',
    templateUrl: './project-reschedule-drawer.component.html',
    styleUrls: ['./project-reschedule-drawer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectRescheduleDrawerComponent implements OnInit, OnDestroy {

    @ViewChild('projectFilterCapture')
    public projectFilterCapture: ProjectFilterCaptureComponent;

    public activeStep: ProjectRescheduleDrawerStep = 'filter';

    public canClickNext: { [key in ProjectRescheduleDrawerStep]: boolean } = {
        filter: false,
        planning: false,
        review: false,
    };

    public context = ProjectFiltersCaptureContextEnum.Reschedule;

    public filterFormValuesChangedSubject = new BehaviorSubject<void>(null);

    public milestoneFilters = new MilestoneFilters();

    public projectTaskFilters = new ProjectTaskFilters();

    public shiftFormData = PROJECT_RESCHEDULE_SHIFT_FORM_DEFAULT_VALUE;

    public wholeProjectDuration = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _filterValuesChangedSubject = new BehaviorSubject<void>(null);

    private _lastSelectedDateRange: DateRange;

    private _saveRescheduleResource: SaveRescheduleResource;

    constructor(private _calendarScopeQueries: CalendarScopeQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _drawerService: DrawerService,
                private _milestoneQueries: MilestoneQueries,
                private _modalService: ModalService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _rescheduleQueries: RescheduleQueries,
                private _store: Store,
                private _taskFiltersHelper: TaskFiltersHelper) {
    }

    ngOnInit(): void {
        this._requestCrafts();
        this._requestWorkAreas();
        this._requestParticipants();
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
        this._resetStore();
    }

    public handleBack(): void {
        switch (this.activeStep) {
            case 'planning':
                this.activeStep = 'filter';
                break;
            case 'review':
                this.activeStep = 'planning';
                break;
        }
    }

    public handleClose(): void {
        this._drawerService.close();
    }

    public handleNext(): void {
        switch (this.activeStep) {
            case 'filter':
                this.activeStep = 'planning';
                break;
            case 'planning':
                this.activeStep = 'review';
                this._submitValidation();
                break;
            case 'review':
                this._submitReschedule();
                break;
        }
    }

    public handleFilterValueChange({task, milestone, wholeProjectDuration}: ProjectFilterFormData): void {
        this.projectTaskFilters = task;
        this.milestoneFilters = milestone;
        this.wholeProjectDuration = wholeProjectDuration;

        this._filterValuesChangedSubject.next();
        this._changeDetectorRef.detectChanges();
    }

    public handleFilterFormValidityChange(valid: boolean): void {
        this.canClickNext.filter = valid && (this.projectTaskFilters.useCriteria || this.milestoneFilters.useCriteria);

        this._changeDetectorRef.detectChanges();
    }

    public handleShiftFormValueChange(shiftFormData: ProjectRescheduleShiftFormData): void {
        this.shiftFormData = shiftFormData;
        this._changeDetectorRef.detectChanges();
    }

    public handleShiftFormValidityChange(valid: boolean): void {
        this.canClickNext.planning = valid;

        this._changeDetectorRef.detectChanges();
    }

    public handleMilestoneChipsChange(criteria: MilestoneFiltersCriteria): void {
        const parsedFormData: ProjectFilterFormData = {
            task: this.projectTaskFilters,
            milestone: Object.assign(new MilestoneFilters(), this.milestoneFilters, {criteria}),
            wholeProjectDuration: this.wholeProjectDuration,
        };

        this.handleFilterValueChange(parsedFormData);
    }

    public handleTaskChipsChange(criteria: ProjectTaskFiltersCriteria): void {
        const parsedFormData: ProjectFilterFormData = {
            task: Object.assign(new ProjectTaskFilters(), this.projectTaskFilters, {criteria}),
            milestone: this.milestoneFilters,
            wholeProjectDuration: this.wholeProjectDuration,
        };

        this.handleFilterValueChange(parsedFormData);
    }

    private _dispatchCalendarSelection(items: ObjectIdentifierPair[]): void {
        this._store.dispatch(new CalendarSelectionActions.Set.Selection(true, CalendarSelectionContextEnum.Reschedule, items));
    }

    private _dispatchCalendarStart(start: moment.Moment): void {
        this._store.dispatch(new CalendarScopeActions.Set.Start(start));
    }

    private _getFilteredObjectIdentifierPairs(tasks: Task[], milestones: Milestone[]): ObjectIdentifierPair[] {
        const taskFilters = this._getProcessedTaskFilters(this.projectTaskFilters);
        const filteredTasks = taskFilters.useCriteria
            ? tasks.filter(task => this._taskFiltersHelper.matchTask(task, taskFilters.criteria))
            : [];
        const filteredMilestones = this.milestoneFilters.useCriteria
            ? milestones.filter(milestone => this.milestoneFilters.matchMilestone(milestone))
            : [];

        return [
            ...filteredTasks.map(task => new ObjectIdentifierPair(ObjectTypeEnum.Task, task.id)),
            ...filteredMilestones.map(milestone => new ObjectIdentifierPair(ObjectTypeEnum.Milestone, milestone.id)),
        ];
    }

    private _getProcessedTaskFilters(taskFilters: ProjectTaskFilters): ProjectTaskFilters {
        const status = taskFilters.criteria.status;

        return Object.assign(new ProjectTaskFilters(), taskFilters, {
            criteria: Object.assign(new ProjectTaskFiltersCriteria(), taskFilters.criteria, {
                status: status.length > 0
                    ? status
                    : TaskStatusEnumHelper.getValues().filter(value => ![TaskStatusEnum.CLOSED, TaskStatusEnum.ACCEPTED].includes(value)),
            }),
        });
    }

    private _handleCalendarScopeChange(calendarScope: TimeScope): void {
        const {start: from, end: to} = calendarScope;
        const parsedFormData: ProjectFilterFormData = {
            task: Object.assign(new ProjectTaskFilters(), this.projectTaskFilters,
                {criteria: Object.assign(new ProjectTaskFiltersCriteria(), this.projectTaskFilters.criteria, {from, to})},
            ),
            milestone: Object.assign(new MilestoneFilters(), this.milestoneFilters,
                {criteria: Object.assign(new MilestoneFiltersCriteria(), this.milestoneFilters.criteria, {from, to})},
            ),
            wholeProjectDuration: false,
        };

        this.handleFilterValueChange(parsedFormData);
    }

    private _handleValidationResults({successful: {tasks, milestones}}: RescheduleResource): void {
        this.canClickNext.review = (milestones.length + tasks.length) > 0;

        this._changeDetectorRef.detectChanges();
    }

    private _processFilterFormData(formValue: ProjectFilterFormData): ProjectFilterFormData {
        const newFormValue = Object.assign({}, formValue);
        if (!newFormValue.wholeProjectDuration && this.wholeProjectDuration && this._lastSelectedDateRange) {
            const {start, end} = this._lastSelectedDateRange;
            newFormValue.task.criteria.from = start;
            newFormValue.task.criteria.to = end;
            newFormValue.milestone.criteria.from = start;
            newFormValue.milestone.criteria.to = end;
        } else {
            this._lastSelectedDateRange = {
                start: this.projectTaskFilters.criteria.from,
                end: this.projectTaskFilters.criteria.to,
            };
        }

        return newFormValue;
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

    private _resetStore(): void {
        this._store.dispatch(new RescheduleActions.Initialize.All());
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
    }

    private _submitReschedule(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Reschedule_Confirm_Title',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new RescheduleActions.Reschedule.One(this._saveRescheduleResource)),
                completeCallback: () => this.handleClose(),
                requestStatusObservable: this._rescheduleQueries.observeRequestStatus(),
                confirmButtonMessage: 'Generic_Reschedule',
            },
        });
    }

    private _submitValidation(): void {
        const {unit, amount} = this.shiftFormData;
        const processedTaskFilters = this._getProcessedTaskFilters(this.projectTaskFilters);
        const useTaskCriteria = processedTaskFilters.useCriteria;
        const useMilestoneCriteria = this.milestoneFilters.useCriteria;
        const shiftDays = unit === 'weeks' ? amount * 7 : amount;

        const saveRescheduleResource: SaveRescheduleResource = {
            shiftDays,
            useTaskCriteria,
            useMilestoneCriteria,
            criteria: {
                tasks: SaveProjectTaskFilters.fromProjectTaskFilters(processedTaskFilters),
                milestones: SaveMilestoneFilters.fromMilestoneFilters(this.milestoneFilters),
            },
        };

        this.canClickNext.review = false;
        this._saveRescheduleResource = saveRescheduleResource;
        this._store.dispatch(new RescheduleActions.Validate.One(saveRescheduleResource));
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeCalendarScope()
                .pipe(take(1))
                .subscribe(calendarScope => this._handleCalendarScopeChange(calendarScope))
        );

        this._disposableSubscriptions.add(
            this._rescheduleQueries.observeCurrentItem()
                .pipe(filter(validationResults => !!validationResults))
                .subscribe(validationResults => this._handleValidationResults(validationResults))
        );

        this._disposableSubscriptions.add(
            this.filterFormValuesChangedSubject.pipe(
                delay(0),
                map(() => this._processFilterFormData(this.projectFilterCapture.getFormValue())),
            ).subscribe(value => this.handleFilterValueChange(value))
        );

        this._disposableSubscriptions.add(
            this._filterValuesChangedSubject.pipe(
                map(() => this.projectTaskFilters.criteria.from),
                filter(from => !!from),
                distinctUntilChanged(isEqual),
            ).subscribe(from => this._dispatchCalendarStart(from))
        );

        this._disposableSubscriptions.add(
            combineLatest([
                this._filterValuesChangedSubject,
                this._milestoneQueries.observeMilestoneListByMilestoneFilters(),
                this._projectTaskQueries.observeCalendarTasks(),
            ]).pipe(
                map(([, milestones, tasks]) => this._getFilteredObjectIdentifierPairs(tasks, milestones)),
                delay(0),
            ).subscribe(objectIdentifierPairs => this._dispatchCalendarSelection(objectIdentifierPairs))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}
