/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {uniq} from 'lodash';

import {DateRange} from '../../../../shared/ui/forms/datepicker-calendar/datepicker-calendar.component';
import {MilestoneFilters} from '../../store/milestones/slice/milestone-filters';
import {MilestoneFiltersCriteria} from '../../store/milestones/slice/milestone-filters-criteria';
import {ProjectTaskFilters} from '../../store/tasks/slice/project-task-filters';
import {ProjectTaskFiltersCriteria} from '../../store/tasks/slice/project-task-filters-criteria';
import {
    CommonFilterCaptureComponent,
    CommonFilterFormData,
} from '../common-filter-capture/common-filter-capture.component';
import {
    MilestoneFilterCaptureComponent,
    MilestoneFilterFormData
} from '../milestone-filter-capture/milestone-filter-capture.component';
import {
    TASKS_FILTER_FORM_DEFAULT_VALUE,
    TasksFilterCaptureComponent,
    TasksFilterFormData,
    TasksFilterFormDataStatus,
    TasksFilterFormDataTopicCriticality
} from '../tasks-filter-capture/tasks-filter-capture.component';

export enum ProjectFiltersCaptureContextEnum {
    Calendar = 'CALENDAR',
    QuickFilters = 'QUICK_FILTERS',
    Reschedule = 'RESCHEDULE',
    TaskList = 'TASK_LIST',
}

@Component({
    selector: 'ss-project-filter-capture',
    templateUrl: './project-filter-capture.component.html',
    styleUrls: ['./project-filter-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFilterCaptureComponent implements OnChanges {

    @ViewChild('commonFilterCapture', {static: true})
    public commonFilterCapture: CommonFilterCaptureComponent;

    @ViewChild('milestoneFilterCapture')
    public milestoneFilterCapture: MilestoneFilterCaptureComponent;

    @ViewChild('taskFilterCapture', {static: true})
    public taskFilterCapture: TasksFilterCaptureComponent;

    @Input()
    public context: ProjectFiltersCaptureContextEnum;

    @Input()
    public emitValueChanged: boolean;

    @Input()
    public milestoneFilters: MilestoneFilters;

    @Output()
    public formValidity = new EventEmitter<boolean>();

    @Input()
    public taskFilters: ProjectTaskFilters;

    @Input()
    public wholeProjectDuration = false;

    @Output()
    public valueChanged = new EventEmitter<void>();

    public allDaysInDateRangeDisabled = false;

    public commonFiltersDefaultValues: CommonFilterFormData;

    public milestoneFiltersDefaultValues: MilestoneFilterFormData;

    public showMilestoneFilterCapture: boolean;

    public showTopRowWorkAreaOption: boolean;

    public taskFiltersDefaultValues: TasksFilterFormData;

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.context) {
            this._setShowContentsByContext();
        }

        if (changes.taskFilters) {
            this._setTaskFiltersDefaultValues();
        }

        if (changes.milestoneFilters) {
            this._setMilestoneFiltersDefaultValues();
        }

        if (changes.taskFilters ||
            changes.milestoneFilters ||
            changes.wholeProjectDuration) {
            this._setCommonFiltersDefaultValues();
        }
    }

    public getFormValue(): ProjectFilterFormData {
        const commonCriteria = this.commonFilterCapture.getFormValue();
        const milestoneFilterFormData = this.milestoneFilterCapture?.getFormValue();
        const taskFilterFormData = this.taskFilterCapture.getFormValue();
        const milestone = this._getMilestoneFilters(milestoneFilterFormData, commonCriteria);
        const task = this._getTaskFilters(taskFilterFormData, commonCriteria);
        const wholeProjectDuration = commonCriteria.wholeProjectDuration;

        return {
            task,
            wholeProjectDuration,
            ...(milestone && {milestone}),
        };
    }

    public handleFormValidityChange(isCommonFilterFormValid: boolean): void {
        this.formValidity.emit(isCommonFilterFormValid);
    }

    public handleRangeChange(range: DateRange): void {
        this.allDaysInDateRangeDisabled = !range.start || !range.end;
        this._changeDetectorRef.detectChanges();
    }

    private _getMilestoneFilters(milestoneFilterFormData: MilestoneFilterFormData,
                                 commonFilterFormData: CommonFilterFormData): MilestoneFilters | null {
        if (!milestoneFilterFormData) {
            return null;
        }

        const milestoneFiltersCriteria = MilestoneFiltersCriteria.fromFormData(milestoneFilterFormData, commonFilterFormData);

        return new MilestoneFilters(milestoneFiltersCriteria, this.milestoneFilterCapture.getUseCriteria());
    }

    private _getTaskFilters(taskFilterFormData: TasksFilterFormData, commonFilterFormData: CommonFilterFormData): ProjectTaskFilters {
        const taskFiltersCriteria = ProjectTaskFiltersCriteria.fromFormData(taskFilterFormData, commonFilterFormData);

        return new ProjectTaskFilters(taskFiltersCriteria, this.taskFilterCapture.getUseCriteria());
    }

    private _setCommonFiltersDefaultValues(): void {
        const start = this.taskFilters.criteria.from || this.milestoneFilters?.criteria.from;
        const end = this.taskFilters.criteria.to || this.milestoneFilters?.criteria.to;
        const header = !!this.milestoneFilters?.criteria.workAreas.header;
        const wholeProjectDuration = this.wholeProjectDuration;
        const workAreaIds =
            uniq([...this.taskFilters.criteria.workAreaIds, ...(this.milestoneFilters?.criteria.workAreas.workAreaIds || [])]);

        this.commonFiltersDefaultValues = {
            range: {start, end},
            workArea: {workAreaIds, header},
            wholeProjectDuration,
        };
    }

    private _setMilestoneFiltersDefaultValues(): void {
        const {projectCraftIds, types} = this.milestoneFilters.criteria.types;

        this.milestoneFiltersDefaultValues = {projectCraftIds, types};
    }

    private _setTaskFiltersDefaultValues(): void {
        const {assignees, projectCraftIds, status, hasTopics, topicCriticality, allDaysInDateRange} = this.taskFilters.criteria;
        const computedStatus = Object.keys(TASKS_FILTER_FORM_DEFAULT_VALUE.status).reduce((prev, curr) => ({
            ...prev,
            [curr]: status.includes(curr),
        }), {} as TasksFilterFormDataStatus);
        const computedTopicCriticality = Object.keys(TASKS_FILTER_FORM_DEFAULT_VALUE.topicCriticality).reduce((prev, curr) => ({
            ...prev,
            [curr]: topicCriticality.includes(curr),
        }), {} as TasksFilterFormDataTopicCriticality);

        this.taskFiltersDefaultValues = {
            assignees,
            projectCraftIds,
            hasTopics,
            allDaysInDateRange,
            status: computedStatus,
            topicCriticality: computedTopicCriticality,
        };
    }

    private _setShowContentsByContext(): void {
        this.showMilestoneFilterCapture = this.showTopRowWorkAreaOption =
            !!this.context && this.context !== ProjectFiltersCaptureContextEnum.TaskList;
    }
}

export interface ProjectFilterFormData {
    milestone?: MilestoneFilters;
    task: ProjectTaskFilters;
    wholeProjectDuration?: boolean;
}
