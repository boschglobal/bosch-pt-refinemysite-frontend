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
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {
    flatten,
    union,
    without,
} from 'lodash';
import {
    combineLatest,
    Subscription,
} from 'rxjs';

import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {Chip} from '../../../../shared/ui/chips/chip/chip.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {MILESTONE_UUID_HEADER} from '../../constants/milestone.constant';
import {WORKAREA_UUID_EMPTY} from '../../constants/workarea.constant';
import {
    MilestoneTypeEnum,
    MilestoneTypeEnumHelper,
} from '../../enums/milestone-type.enum';
import {TaskStatusEnumHelper} from '../../enums/task-status.enum';
import {TopicCriticalityEnumHelper} from '../../enums/topic-criticality.enum';
import {ProjectCraftQueries} from '../../store/crafts/project-craft.queries';
import {
    MilestoneFiltersCriteria,
    MilestoneFiltersCriteriaType,
    MilestoneFiltersCriteriaWorkArea
} from '../../store/milestones/slice/milestone-filters-criteria';
import {
    ParticipantByCompany,
    ProjectParticipantQueries,
} from '../../store/participants/project-participant.queries';
import {
    ProjectTaskFiltersAssignees,
    ProjectTaskFiltersCriteria,
} from '../../store/tasks/slice/project-task-filters-criteria';
import {WorkareaQueries} from '../../store/workareas/workarea.queries';

export const DEFAULT_TASK_FILTERS_CRITERIA = new ProjectTaskFiltersCriteria();
export const DEFAULT_MILESTONE_FILTERS_CRITERIA = new MilestoneFiltersCriteria();

@Component({
    selector: 'ss-project-filter-chips',
    templateUrl: './project-filter-chips.component.html',
    styleUrls: ['./project-filter-chips.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFilterChipsComponent implements OnInit, OnDestroy, OnChanges {

    @Input()
    public maxChipsToShow = 6;

    @Input()
    public milestoneFiltersCriteria: MilestoneFiltersCriteria;

    @Input()
    public taskFiltersCriteria: ProjectTaskFiltersCriteria;

    @Input()
    public showRemoveAll = true;

    @Input()
    public listLabel = 'Task_Filter_AppliedFilters';

    @Output()
    public clearFilters = new EventEmitter<void>();

    @Output()
    public milestoneFiltersCriteriaChanged = new EventEmitter<MilestoneFiltersCriteria>();

    @Output()
    public taskFiltersCriteriaChanged = new EventEmitter<ProjectTaskFiltersCriteria>();

    @ViewChild('craftOptionsTemplate', {static: true})
    public craftOptionsTemplate: TemplateRef<any>;

    @ViewChild('milestoneMarkerTemplate', {static: true})
    public milestoneMarkerTemplate: TemplateRef<any>;

    public chips: Chip<ChipId>[] = [];

    private _companies: ResourceReference[] = [];

    private _crafts: ProjectCraftResource[] = [];

    private _disposableSubscriptions: Subscription = new Subscription();

    private _participants: ProjectParticipantResource[] = [];

    private _workAreas: WorkareaResource[] = [];

    private readonly _chipOrder: ChipKey[] = [
        'from',
        'to',
        'workAreas',
        'milestoneTypes',
        'milestoneCrafts',
        'taskStatus',
        'taskCrafts',
        'taskCompanies',
        'taskParticipants',
        'taskHasTopics',
        'taskTopicCriticality',
    ];

    private readonly _chipsBuilderByKey: { [key in ChipKey]: () => Chip<ChipId>[] } = {
        from: () => this._buildDateChips('from'),
        to: () => this._buildDateChips('to'),
        workAreas: () => this._buildWorkAreaChips(),
        milestoneTypes: () => this._buildMilestoneTypeChips(),
        milestoneCrafts: () => this._buildMilestoneCraftChips(),
        taskStatus: () => this._buildStatusChips(),
        taskCrafts: () => this._buildCraftChips(),
        taskCompanies: () => this._buildCompanyChips(),
        taskParticipants: () => this._buildParticipantChips(),
        taskHasTopics: () => this._buildHasTopicsChips(),
        taskTopicCriticality: () => this._buildCriticalityChips(),
    };

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _projectCraftQueries: ProjectCraftQueries,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _translateService: TranslateService,
                private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnChanges(): void {
        this._setChips();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleRemoveAllChips(): void {
        this.clearFilters.emit();
    }

    public handleRemoveChip(chip: Chip): void {
        const [key, id] = this._decodeChipId(chip.id as ChipId);

        if (isTaskChipKey(key)) {
            this._handleRemoveTaskChip(key, id);
        } else if (isMilestoneChipKey(key)) {
            this._handleRemoveMilestoneChip(key, id);
        } else {
            this._handleRemoveCommonChip(key, id);
        }
    }

    private _buildCompanyChips(): Chip<ChipId>[] {
        return this._companies.length ? this.taskFiltersCriteria.assignees.companyIds.map(companyId => {
            const {displayName} = this._companies.find(({id}) => id === companyId);

            return {
                id: this._encodeChipId('taskCompanies', companyId),
                text: displayName,
            };
        }) : [];
    }

    private _buildCraftChips(): Chip<ChipId>[] {
        return this._crafts.length ? this.taskFiltersCriteria.projectCraftIds.map(craftId => {
            const {name, color} = this._crafts.find(craft => craft.id === craftId);

            return {
                id: this._encodeChipId('taskCrafts', craftId),
                text: name,
                customVisualContent: {
                    data: {craftColor: color},
                    template: this.craftOptionsTemplate,
                },
            };
        }) : [];
    }

    private _buildCriticalityChips(): Chip<ChipId>[] {
        return this.taskFiltersCriteria.topicCriticality.map(criticality => ({
            id: this._encodeChipId('taskTopicCriticality', criticality),
            text: this._translateService.instant(TopicCriticalityEnumHelper.getLabelByKey(criticality)),
        }));
    }

    private _buildDateChips(attribute: 'from' | 'to'): Chip<ChipId>[] {
        const taskDate = this.taskFiltersCriteria[attribute];
        const milestoneDate = this.milestoneFiltersCriteria[attribute];

        return taskDate || milestoneDate ? [{
            id: this._encodeChipId(attribute, ''),
            text: (taskDate || milestoneDate).clone().locale(this._translateService.defaultLang).format('L'),
        }] : [];
    }

    private _buildHasTopicsChips(): Chip<ChipId>[] {
        return this.taskFiltersCriteria.hasTopics ? [{
            id: this._encodeChipId('taskHasTopics', ''),
            text: this._translateService.instant('Task_Filter_TopicsAvailableLabel'),
        }] : [];
    }

    private _buildMilestoneCraftChips(): Chip<ChipId>[] {
        return this._crafts.length ? this.milestoneFiltersCriteria.types.projectCraftIds.map(craftId => {
            const {name, color} = this._crafts.find(craft => craft.id === craftId);

            return {
                id: this._encodeChipId('milestoneCrafts', craftId),
                text: name,
                customVisualContent: {
                    data: {
                        color,
                        type: MilestoneTypeEnum.Craft,
                    },
                    template: this.milestoneMarkerTemplate,
                },
            };
        }) : [];
    }

    private _buildMilestoneTypeChips(): Chip<ChipId>[] {
        return this.milestoneFiltersCriteria.types.types
            .filter(type => type !== MilestoneTypeEnum.Craft)
            .map(type => ({
                id: this._encodeChipId('milestoneTypes', type),
                text: this._translateService.instant(MilestoneTypeEnumHelper.getLabelByValue(type)),
                customVisualContent: {
                    data: {type},
                    template: this.milestoneMarkerTemplate,
                },
            }));
    }

    private _buildParticipantChips(): Chip<ChipId>[] {
        return this._participants.length ? this.taskFiltersCriteria.assignees.participantIds.map(participantId => {
            const {user: {displayName, picture}} = this._participants.find(({id}) => id === participantId);

            return {
                id: this._encodeChipId('taskParticipants', participantId),
                text: displayName,
                imageUrl: picture,
            };
        }) : [];
    }

    private _buildStatusChips(): Chip<ChipId>[] {
        return this.taskFiltersCriteria.status.map(status => ({
            id: this._encodeChipId('taskStatus', status),
            text: this._translateService.instant(TaskStatusEnumHelper.getLabelByKey(status)),
        }));
    }

    private _buildWorkAreaChips(): Chip<ChipId>[] {
        const taskWorkAreas = this.taskFiltersCriteria.workAreaIds;
        const milestoneWorkAreas = this.milestoneFiltersCriteria.workAreas.workAreaIds;
        const milestoneWorkAreaHeader = this.milestoneFiltersCriteria.workAreas.header ? [{
            id: this._encodeChipId('workAreas', MILESTONE_UUID_HEADER),
            text: this._translateService.instant('Generic_TopRow'),
        }] : [];
        const workAreas = this._workAreas.length ? union(taskWorkAreas, milestoneWorkAreas).map(workAreaId => {
            const name = this._workAreas.find(area => area.id === workAreaId)?.name;
            const position = this._workAreas.find(area => area.id === workAreaId)?.position;

            return {
                id: this._encodeChipId('workAreas', workAreaId),
                text: workAreaId !== WORKAREA_UUID_EMPTY ? `${position}. ${name}` : this._translateService.instant('Generic_WithoutArea'),
            };
        }) : [];

        return [...milestoneWorkAreaHeader, ...workAreas];
    }

    private _decodeChipId(chipId: ChipId): [ChipKey, string] {
        const splitId = chipId.split('_');

        return [
            splitId[0] as ChipKey,
            splitId[1],
        ];
    }

    private _encodeChipId(chipKey: ChipKey, id: string): ChipId {
        return `${chipKey}_${id}`;
    }

    private _handleRemoveCommonChip(key: CommonChipKey, id: string): void {
        const newTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), this.taskFiltersCriteria);
        const newMilestoneCriteria = Object.assign(new MilestoneFiltersCriteria(), this.milestoneFiltersCriteria);
        const {from: defaultFrom, to: defaultTo} = DEFAULT_TASK_FILTERS_CRITERIA;
        const {from: defaultMilestoneFrom, to: defaultMilestoneTo} = DEFAULT_MILESTONE_FILTERS_CRITERIA;

        switch (key) {
            case 'from':
                newTaskCriteria.from = defaultFrom;
                newMilestoneCriteria.from = defaultMilestoneFrom;
                break;
            case 'to':
                newTaskCriteria.to = defaultTo;
                newMilestoneCriteria.to = defaultMilestoneTo;
                break;
            case 'workAreas': {
                const {header, workAreaIds} = newMilestoneCriteria.workAreas;

                newTaskCriteria.workAreaIds = without(newTaskCriteria.workAreaIds, id);
                newMilestoneCriteria.workAreas = Object.assign(new MilestoneFiltersCriteriaWorkArea(), {
                    workAreaIds: without(workAreaIds, id),
                    header: id === MILESTONE_UUID_HEADER ? false : header,
                });

                break;
            }
        }

        this.taskFiltersCriteriaChanged.emit(newTaskCriteria);
        this.milestoneFiltersCriteriaChanged.emit(newMilestoneCriteria);
    }

    private _handleRemoveMilestoneChip(key: MilestoneChipKey, id: string): void {
        const newMilestoneCriteria = Object.assign(new MilestoneFiltersCriteria(), this.milestoneFiltersCriteria);
        const newMilestoneCriteriaType = Object.assign(new MilestoneFiltersCriteriaType(), newMilestoneCriteria.types);
        const {types, projectCraftIds} = this.milestoneFiltersCriteria.types;

        switch (key) {
            case 'milestoneTypes':
                newMilestoneCriteria.types = Object.assign(newMilestoneCriteriaType, {
                    types: without(types, id) as MilestoneTypeEnum[],
                });
                break;
            case 'milestoneCrafts':
                newMilestoneCriteria.types = Object.assign(newMilestoneCriteriaType, {
                    projectCraftIds: without(projectCraftIds, id),
                });

                if (!newMilestoneCriteria.types.projectCraftIds.length) {
                    newMilestoneCriteria.types.types = without<MilestoneTypeEnum>(types, MilestoneTypeEnum.Craft);
                }
                break;
        }

        this.milestoneFiltersCriteriaChanged.emit(newMilestoneCriteria);
    }

    private _handleRemoveTaskChip(key: TaskChipKey, id: string): void {
        const newTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), this.taskFiltersCriteria);
        const {hasTopics: defaultHasTopics, topicCriticality: defaultTopicCriticality} = DEFAULT_TASK_FILTERS_CRITERIA;
        const {projectCraftIds, status, assignees: {participantIds, companyIds}} = this.taskFiltersCriteria;

        switch (key) {
            case 'taskHasTopics':
                newTaskCriteria.hasTopics = defaultHasTopics;
                break;
            case 'taskTopicCriticality':
                newTaskCriteria.topicCriticality = defaultTopicCriticality;
                break;
            case 'taskCrafts':
                newTaskCriteria.projectCraftIds = without(projectCraftIds, id);
                break;
            case 'taskStatus':
                newTaskCriteria.status = without(status, id);
                break;
            case 'taskParticipants':
                newTaskCriteria.assignees = new ProjectTaskFiltersAssignees(without(participantIds, id), companyIds);
                break;
            case 'taskCompanies':
                newTaskCriteria.assignees = new ProjectTaskFiltersAssignees(participantIds, without(companyIds, id));
                break;
        }

        this.taskFiltersCriteriaChanged.emit(newTaskCriteria);
    }

    private _setChips(): void {
        this.chips = flatten(this._chipOrder.map(key => this._chipsBuilderByKey[key]()));
    }

    private _setCompanies(participantsByCompany: ParticipantByCompany[]): void {
        this._companies = participantsByCompany.map(({id, displayName}) => ({id, displayName}));
    }

    private _setParticipants(participantsByCompany: ParticipantByCompany[]): void {
        this._participants = flatten(participantsByCompany.map(({participants}) => participants));
    }

    private _setSubscriptions(): void {

        this._disposableSubscriptions.add(
            combineLatest([
                this._projectCraftQueries.observeCrafts(),
                this._workAreaQueries.observeWorkareas(),
                this._projectParticipantQueries.observeActiveParticipantsByCompanies(),
            ]).subscribe(([crafts, workAreas, participantsByCompany]) => {
                this._crafts = crafts;
                this._workAreas = workAreas;
                this._setCompanies(participantsByCompany);
                this._setParticipants(participantsByCompany);
                this._setChips();
                this._changeDetectorRef.detectChanges();
            }));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export type ChipId = `${ChipKey}_${string}`;

export type ChipKey = TaskChipKey | CommonChipKey | MilestoneChipKey;

export type CommonChipKey = 'from' | 'to' | 'workAreas';

export type MilestoneChipKey = 'milestoneTypes' | 'milestoneCrafts';

export type TaskChipKey = 'taskCrafts' | 'taskStatus' | 'taskHasTopics' | 'taskTopicCriticality' | 'taskCompanies' | 'taskParticipants';

function isMilestoneChipKey(key: ChipKey): key is MilestoneChipKey {
    return key.startsWith('milestone');
}

function isTaskChipKey(key: ChipKey): key is TaskChipKey {
    return key.startsWith('task');
}
