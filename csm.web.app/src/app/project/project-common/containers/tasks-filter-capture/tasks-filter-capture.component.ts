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
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges,
    TemplateRef,
    ViewChild
} from '@angular/core';
import {
    FormBuilder,
    FormControl,
} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {
    cloneDeep,
    flatten,
    groupBy,
    isEqual,
    merge,
    omit
} from 'lodash';
import {
    BehaviorSubject,
    combineLatest,
    Subscription
} from 'rxjs';
import {
    distinctUntilChanged,
    filter,
    map,
    startWith,
    take
} from 'rxjs/operators';

import {CollapsibleSelectValue} from '../../../../shared/ui/collapsible-select/collapsible-select.component';
import {InputMultipleSelectOption} from '../../../../shared/ui/forms/input-multiple-select/input-multiple-select.component';
import {UserResource} from '../../../../user/api/resources/user.resource';
import {UserQueries} from '../../../../user/store/user/user.queries';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper
} from '../../enums/task-status.enum';
import {TopicCriticalityEnum} from '../../enums/topic-criticality.enum';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {
    ParticipantByCompany,
    ProjectParticipantQueries
} from '../../store/participants/project-participant.queries';
import {ProjectTaskFiltersAssignees} from '../../store/tasks/slice/project-task-filters-criteria';
import {ProjectFiltersCaptureContextEnum} from '../project-filter-capture/project-filter-capture.component';

export const TASKS_FILTER_FORM_DEFAULT_VALUE: TasksFilterFormDataParsed = {
    assigneeIds: [],
    hasTopics: false,
    allDaysInDateRange: false,
    topicCriticality: {
        [TopicCriticalityEnum.CRITICAL]: false,
    },
    projectCraftIds: [],
    status: {
        [TaskStatusEnum.CLOSED]: false,
        [TaskStatusEnum.DRAFT]: false,
        [TaskStatusEnum.OPEN]: false,
        [TaskStatusEnum.STARTED]: false,
        [TaskStatusEnum.ACCEPTED]: false,
    },
};

export const TASK_STATUS_DEFAULT_CONTEXT_OPTIONS: TaskStatusOption[] = [
    {
        status: TaskStatusEnum.DRAFT,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.DRAFT),
    },
    {
        status: TaskStatusEnum.OPEN,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN),
    },
    {
        status: TaskStatusEnum.STARTED,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED),
    },
    {
        status: TaskStatusEnum.CLOSED,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.CLOSED),
    },
    {
        status: TaskStatusEnum.ACCEPTED,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.ACCEPTED),
    },
];

export const TASK_STATUS_RESCHEDULE_CONTEXT_OPTIONS: TaskStatusOption[] = [
    {
        status: TaskStatusEnum.DRAFT,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.DRAFT),
    },
    {
        status: TaskStatusEnum.OPEN,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.OPEN),
    },
    {
        status: TaskStatusEnum.STARTED,
        label: TaskStatusEnumHelper.getLabelByValue(TaskStatusEnum.STARTED),
    },
];

export const PARTICIPANTS_MULTIPLE_SELECT_OPTIONS_SORTER = (a: InputMultipleSelectOption, b: InputMultipleSelectOption): number => {
    if (a.groupText && !b.groupText) {
        return -1;
    } else if (!a.groupText && b.groupText) {
        return 1;
    } else {
        return 0;
    }
};

@Component({
    selector: 'ss-tasks-filter-capture',
    templateUrl: './tasks-filter-capture.component.html',
    styleUrls: ['./tasks-filter-capture.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksFilterCaptureComponent implements OnInit, OnDestroy, OnChanges {

    @ViewChild('assigneeUserPicture', {static: true})
    public assigneeUserPicture: TemplateRef<any>;

    @ViewChild('craftOptionTemplate', {static: true})
    public craftOptionTemplate: TemplateRef<any>;

    @Input()
    public allDaysInDateRangeDisabled: boolean;

    @Input()
    public context: ProjectFiltersCaptureContextEnum;

    @Input()
    public defaultValues: TasksFilterFormData;

    @Input()
    public emitValueChanged: boolean;

    @Input()
    public useCriteria: boolean;

    @Output()
    public valueChanged = new EventEmitter<void>();

    public collapsibleSelectValue: CollapsibleSelectValue = true;

    public craftList: InputMultipleSelectOption[] = [];

    public isRescheduleContext = false;

    public readonly form = this._formBuilder.group({
        assigneeIds: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.assigneeIds),
        hasTopics: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.hasTopics),
        allDaysInDateRange: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.allDaysInDateRange),
        topicCriticality: this._formBuilder.group({
            [TopicCriticalityEnum.CRITICAL]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.topicCriticality.CRITICAL),
        }),
        projectCraftIds: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.projectCraftIds),
        status: this._formBuilder.group({
            [TaskStatusEnum.CLOSED]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.status[TaskStatusEnum.CLOSED]),
            [TaskStatusEnum.DRAFT]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.status[TaskStatusEnum.DRAFT]),
            [TaskStatusEnum.OPEN]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.status[TaskStatusEnum.OPEN]),
            [TaskStatusEnum.STARTED]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.status[TaskStatusEnum.STARTED]),
            [TaskStatusEnum.ACCEPTED]: new FormControl(TASKS_FILTER_FORM_DEFAULT_VALUE.status[TaskStatusEnum.ACCEPTED]),
        }),
    });

    public participantsByCompanyList: InputMultipleSelectOption[] = [];

    public statusOptions: TaskStatusOption[] = TASK_STATUS_DEFAULT_CONTEXT_OPTIONS;

    private _applyDefaultValues = new BehaviorSubject<void>(null);

    private _onlyCollapsibleSelectValueChanged = new BehaviorSubject<CollapsibleSelectValue>(false);

    private _defaultValues: TasksFilterFormData;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _participantsByCompany: ParticipantByCompany[] = [];

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef,
                private readonly _formBuilder: FormBuilder,
                private readonly _projectCraftQueries: ProjectCraftQueries,
                private readonly _projectParticipantQueries: ProjectParticipantQueries,
                private readonly _translateService: TranslateService,
                private readonly _userQueries: UserQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.allDaysInDateRangeDisabled && this.allDaysInDateRangeDisabled) {
            this.form.controls.allDaysInDateRange.setValue(false, {emitEvent: !!this.collapsibleSelectValue});
        }

        if (changes.context) {
            this._setContext(this.context);
        }

        if (changes.defaultValues && this.defaultValues) {
            this._setDefaultValues(this.defaultValues);
        }

        if (changes.defaultValues ||
            changes.useCriteria) {
            if (this.useCriteria) {
                this._computeCollapsibleSelectValue();
            } else {
                this._setCollapsibleSelectValue(false);
            }
        }
    }

    public handleSelect(selected: boolean): void {
        this.form.patchValue(TASKS_FILTER_FORM_DEFAULT_VALUE, {emitEvent: false});
        this._setCollapsibleSelectValue(selected);
        this._onlyCollapsibleSelectValueChanged.next(selected);
    }

    public getFormValue(): TasksFilterFormData {
        return this._parseTasksFilterFormData(this.form.value as TasksFilterFormDataParsed);
    }

    public getUseCriteria(): boolean {
        return !!this.collapsibleSelectValue;
    }

    private _computeCollapsibleSelectValue(): void {
        const {status, hasTopics, topicCriticality, projectCraftIds, assigneeIds, allDaysInDateRange} = this.form.value;
        const allParticipantsList = flatten(this._participantsByCompany.map(participantsByCompany => participantsByCompany.participants));
        const allAssigneesSelected = assigneeIds.length === allParticipantsList.length;
        const allTaskStatusSelected = !Object.keys(status).some(key => !status[key]);
        const allCraftsSelected = this.craftList.length === projectCraftIds.length;
        const topicCriticalityCritical = topicCriticality[TopicCriticalityEnum.CRITICAL];
        const canShowAllSelected = !allDaysInDateRange && !hasTopics && !topicCriticalityCritical;
        const allSelected = allTaskStatusSelected && allCraftsSelected && allAssigneesSelected && canShowAllSelected;
        const mergedFormValue = merge(cloneDeep(TASKS_FILTER_FORM_DEFAULT_VALUE), this.form.value);
        const defaultFormValue = isEqual(mergedFormValue, TASKS_FILTER_FORM_DEFAULT_VALUE);

        if (allSelected || defaultFormValue) {
            this._setCollapsibleSelectValue(true);
        } else {
            this._setCollapsibleSelectValue('indeterminate');
        }
    }

    private _getCompanyIdByParticipantId(participantId: string): string {
        const company = this._participantsByCompany.find(({participants}) => participants.find(({id}) => id === participantId));

        return company?.id;
    }

    private _getParsedAssigneeIds({participantIds, companyIds}: ProjectTaskFiltersAssignees): string[] {
        const companyParticipantIds = flatten(companyIds.map(companyId => this._getParticipantsByCompanyId(companyId).map(({id}) => id)));
        const filteredParticipantIds = participantIds.filter(participantId => !!this._getCompanyIdByParticipantId(participantId));

        return [...filteredParticipantIds, ...companyParticipantIds];
    }

    private _getParticipantsByCompanyId(companyId: string): ProjectParticipantResource[] {
        const company = this._participantsByCompany.find(({id}) => id === companyId);

        return company?.participants || [];
    }

    private _setCollapsibleSelectValue(value: CollapsibleSelectValue): void {
        this.collapsibleSelectValue = value;
    }

    private _setContext(context: ProjectFiltersCaptureContextEnum): void {
        if (context === ProjectFiltersCaptureContextEnum.Reschedule) {
            this.isRescheduleContext = true;
            this.statusOptions = TASK_STATUS_RESCHEDULE_CONTEXT_OPTIONS;
            this.form.controls.status.controls[TaskStatusEnum.CLOSED].disable();
            this.form.controls.status.controls[TaskStatusEnum.ACCEPTED].disable();
        }
    }

    private _setDefaultValues(tasksFilterFormData: TasksFilterFormData): void {
        const hasTopics = tasksFilterFormData.hasTopics || false;
        const assigneeIds = this._getParsedAssigneeIds(tasksFilterFormData.assignees);
        const filteredTaskFilterFormData = omit({...tasksFilterFormData}, 'assignees');
        const newTaskFilterFormData: TasksFilterFormDataParsed = {
            ...filteredTaskFilterFormData,
            assigneeIds,
            hasTopics,
        };

        this._defaultValues = tasksFilterFormData;
        this.form.patchValue(newTaskFilterFormData);
    }

    private _setParticipantsByCompany(participantsByCompany: ParticipantByCompany[]): void {
        this._participantsByCompany = participantsByCompany;
    }

    private _parseCrafts(crafts: ProjectCraftResource[]): void {
        this.craftList = crafts.map((craft: ProjectCraftResource) => {
            const {id, name, color} = craft;
            return {
                text: name,
                id,
                customVisualContent: {
                    data: {craftColor: color},
                    template: this.craftOptionTemplate,
                },
            };
        });
    }

    private _parseParticipants(participantsList: ParticipantByCompany[], currentUser: UserResource): void {
        this.participantsByCompanyList = participantsList
            .map(company => ({
                id: company.id,
                text: company.displayName,
                groupText: company.participants.some(participant => participant.user.id === currentUser.id)
                    ? this._translateService.instant('Generic_MyCompanyLabel')
                    : null,
                children: company.participants.map(participant => ({
                    id: participant.id,
                    text: participant.user.displayName,
                    customVisualContent: {
                        data: participant.user.picture,
                        template: this.assigneeUserPicture,
                    },
                })),
            }))
            .sort(PARTICIPANTS_MULTIPLE_SELECT_OPTIONS_SORTER);
    }

    private _parseTasksFilterFormData(tasksFilterFormData: TasksFilterFormDataParsed): TasksFilterFormData {
        const participantIds = [];
        const companyIds = [];
        const groupedParticipantsByCompany =
            groupBy(tasksFilterFormData.assigneeIds, assigneeId => this._getCompanyIdByParticipantId(assigneeId));
        const hasTopics = tasksFilterFormData.hasTopics || null;

        Object.entries(groupedParticipantsByCompany).forEach(([companyId, selectedParticipants]) => {
            const participants = this._getParticipantsByCompanyId(companyId);

            if (participants.length === selectedParticipants.length) {
                companyIds.push(companyId);
            } else {
                participantIds.push(...selectedParticipants);
            }
        });

        return {
            ...omit(tasksFilterFormData, 'assigneeIds'),
            assignees: {
                participantIds,
                companyIds,
            },
            hasTopics,
        };
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            combineLatest([
                this._projectCraftQueries.observeCraftsSortedByName(),
                this._userQueries.observeCurrentUser(),
                this._projectParticipantQueries.observeActiveParticipantsByCompanies(),
            ]).subscribe(([crafts, currentUser, participantsByCompany]) => {
                this._parseCrafts(crafts);
                this._setParticipantsByCompany(participantsByCompany);
                this._parseParticipants(participantsByCompany, currentUser);
                this._applyDefaultValues.next();
                this._changeDetectorRef.detectChanges();
            }));

        this._disposableSubscriptions.add(
            this._applyDefaultValues.pipe(
                filter(() => this.useCriteria),
                filter(() => {
                    const hasDefaultAssigneesSelected =
                        !!this._defaultValues.assignees.participantIds.length ||
                        !!this._defaultValues.assignees.companyIds.length;

                    return !hasDefaultAssigneesSelected || hasDefaultAssigneesSelected && this._participantsByCompany.length > 0;
                }),
                take(1),
            ).subscribe(() => {
                const assigneeIds = this._getParsedAssigneeIds(this._defaultValues.assignees);

                this.form.controls.assigneeIds.setValue(assigneeIds);

                this._computeCollapsibleSelectValue();
                this._changeDetectorRef.detectChanges();
            }));

        this._disposableSubscriptions.add(
            this.form.valueChanges
                .pipe(
                    distinctUntilChanged(isEqual))
                .subscribe(() => this._computeCollapsibleSelectValue()));

        this._disposableSubscriptions.add(
            this.form.controls.allDaysInDateRange.valueChanges
                .pipe(
                    filter(value => value && this.allDaysInDateRangeDisabled))
                .subscribe(() => this.form.controls.allDaysInDateRange.setValue(false)));

        this._disposableSubscriptions.add(
            combineLatest([
                this._onlyCollapsibleSelectValueChanged,
                this.form.valueChanges.pipe(startWith(null)),
            ]).pipe(
                filter(() => this.emitValueChanged),
                map(() => [this.form.value, this.collapsibleSelectValue]),
                distinctUntilChanged(isEqual),
            ).subscribe(() => this.valueChanged.emit())
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

interface TaskStatusOption {
    label: string;
    status: TaskStatusEnum;
}

export interface TasksFilterFormData {
    assignees: {
        participantIds: string[];
        companyIds: string[];
    };
    projectCraftIds: string[];
    status: TasksFilterFormDataStatus;
    hasTopics: boolean;
    topicCriticality: TasksFilterFormDataTopicCriticality;
    allDaysInDateRange: boolean;
}

export interface TasksFilterFormDataParsed extends Omit<TasksFilterFormData, 'assignees'> {
    assigneeIds: string[];
}

export interface TasksFilterFormDataTopicCriticality {
    [TopicCriticalityEnum.CRITICAL]: boolean;
}

export interface TasksFilterFormDataStatus {
    [TaskStatusEnum.CLOSED]?: boolean;
    [TaskStatusEnum.DRAFT]: boolean;
    [TaskStatusEnum.OPEN]: boolean;
    [TaskStatusEnum.STARTED]: boolean;
    [TaskStatusEnum.ACCEPTED]?: boolean;
}
