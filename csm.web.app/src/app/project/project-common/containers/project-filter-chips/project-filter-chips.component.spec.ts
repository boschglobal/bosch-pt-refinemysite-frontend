/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA,
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateService} from '@ngx-translate/core';
import {cloneDeep} from 'lodash';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when,
} from 'ts-mockito';

import {
    MOCK_COMPANY_1,
    MOCK_COMPANY_2,
} from '../../../../../test/mocks/companies';
import {MOCK_PROJECT_CRAFT_LIST} from '../../../../../test/mocks/crafts';
import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2,
    MOCK_PARTICIPANT_3,
    MOCK_PARTICIPANT_4,
} from '../../../../../test/mocks/participants';
import {MOCK_WORKAREAS} from '../../../../../test/mocks/workareas';
import {TranslateServiceStub} from '../../../../../test/stubs/translate-service.stub';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {Chip} from '../../../../shared/ui/chips/chip/chip.component';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {MILESTONE_UUID_HEADER} from '../../constants/milestone.constant';
import {WORKAREA_UUID_EMPTY} from '../../constants/workarea.constant';
import {
    MilestoneTypeEnum,
    MilestoneTypeEnumHelper,
} from '../../enums/milestone-type.enum';
import {
    TaskStatusEnum,
    TaskStatusEnumHelper,
} from '../../enums/task-status.enum';
import {
    TopicCriticalityEnum,
    TopicCriticalityEnumHelper,
} from '../../enums/topic-criticality.enum';
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
import {
    ChipId,
    DEFAULT_MILESTONE_FILTERS_CRITERIA,
    DEFAULT_TASK_FILTERS_CRITERIA,
    ProjectFilterChipsComponent,
} from './project-filter-chips.component';

describe('Project Filter Chips Component', () => {
    let fixture: ComponentFixture<ProjectFilterChipsComponent>;
    let comp: ProjectFilterChipsComponent;
    let de: DebugElement;

    const defaultMilestoneFiltersCriteria: MilestoneFiltersCriteria = {
        from: moment(),
        to: moment(),
        workAreas: {
            header: true,
            workAreaIds: [MOCK_WORKAREAS[0].id, WORKAREA_UUID_EMPTY],
        },
        types: {
            types: [MilestoneTypeEnum.Project, MilestoneTypeEnum.Craft],
            projectCraftIds: [MOCK_PROJECT_CRAFT_LIST.projectCrafts[1].id],
        },
    };
    const defaultTaskFiltersCriteria: ProjectTaskFiltersCriteria = {
        assignees: new ProjectTaskFiltersAssignees(
            [MOCK_PARTICIPANT.id, MOCK_PARTICIPANT_2.id],
            [MOCK_COMPANY_1.id],
        ),
        allDaysInDateRange: false,
        projectCraftIds: [MOCK_PROJECT_CRAFT_LIST.projectCrafts[0].id],
        workAreaIds: [MOCK_WORKAREAS[0].id, WORKAREA_UUID_EMPTY],
        hasTopics: true,
        topicCriticality: [TopicCriticalityEnum.CRITICAL],
        status: [TaskStatusEnum.DRAFT, TaskStatusEnum.OPEN],
        from: moment(),
        to: moment(),
    };

    const projectParticipantQueriesMock = mock(ProjectParticipantQueries);
    const projectCraftQueriesMock = mock(ProjectCraftQueries);
    const workareaQueriesMock = mock(WorkareaQueries);

    const crafts: ProjectCraftResource[] = MOCK_PROJECT_CRAFT_LIST.projectCrafts;
    const participantByCompany: ParticipantByCompany[] = [
        {
            id: MOCK_COMPANY_2.id,
            displayName: MOCK_COMPANY_2.name,
            participants: [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2, MOCK_PARTICIPANT_3],
        },
        {
            id: MOCK_COMPANY_1.id,
            displayName: MOCK_COMPANY_1.name,
            participants: [MOCK_PARTICIPANT_4],
        },
    ];

    const craftChip: Chip<ChipId> = {id: `taskCrafts_${crafts[0].id}`, text: crafts[0].name};
    const companyChip: Chip<ChipId> = {id: `taskCompanies_${MOCK_COMPANY_1.id}`, text: MOCK_COMPANY_1.name};
    const workareaChip1: Chip<ChipId> = {id: `workAreas_${MILESTONE_UUID_HEADER}`, text: 'Generic_TopRow'};
    const workareaChip2: Chip<ChipId> = {
        id: `workAreas_${MOCK_WORKAREAS[0].id}`,
        text: `${MOCK_WORKAREAS[0].position}. ${MOCK_WORKAREAS[0].name}`,
    };
    const workareaChip3: Chip<ChipId> = {id: `workAreas_${WORKAREA_UUID_EMPTY}`, text: 'Generic_WithoutArea'};
    const fromChip: Chip<ChipId> = {id: 'from_', text: moment().locale('en').format('L')};
    const toChip: Chip<ChipId> = {id: 'to_', text: moment().locale('en').format('L')};
    const hasTopicsChip: Chip<ChipId> = {id: 'taskHasTopics_', text: 'Task_Filter_TopicsAvailableLabel'};
    const statusChip: Chip<ChipId> = {
        id: `taskStatus_${TaskStatusEnum.DRAFT}`,
        text: TaskStatusEnumHelper.getLabelByKey(TaskStatusEnum.DRAFT),
    };
    const statusChip2: Chip<ChipId> = {
        id: `taskStatus_${TaskStatusEnum.OPEN}`,
        text: TaskStatusEnumHelper.getLabelByKey(TaskStatusEnum.OPEN),
    };
    const topicCriticalityChip: Chip<ChipId> = {
        id: `taskTopicCriticality_${TopicCriticalityEnum.CRITICAL}`,
        text: TopicCriticalityEnumHelper.getLabelByKey(TopicCriticalityEnum.CRITICAL),
    };
    const participantChip: Chip<ChipId> = {
        id: `taskParticipants_${MOCK_PARTICIPANT.id}`,
        text: MOCK_PARTICIPANT.user.displayName,
        imageUrl: MOCK_PARTICIPANT.user.picture,
    };
    const participantChip2: Chip<ChipId> = {
        id: `taskParticipants_${MOCK_PARTICIPANT_2.id}`,
        text: MOCK_PARTICIPANT_2.user.displayName,
        imageUrl: MOCK_PARTICIPANT_2.user.picture,
    };
    const milestoneProjectTypeChip: Chip<ChipId> = {
        id: `milestoneTypes_${MilestoneTypeEnum.Project}`,
        text: MilestoneTypeEnumHelper.getLabelByValue(MilestoneTypeEnum.Project),
    };
    const milestoneCraftChip: Chip<ChipId> = {
        id: `milestoneCrafts_${crafts[1].id}`,
        text: crafts[1].name,
    };

    const projectFilterChipsSelector = '[data-automation="ss-project-filter-chips"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [
            TranslationModule.forRoot(),
        ],
        declarations: [ProjectFilterChipsComponent],
        providers: [
            {
                provide: ProjectParticipantQueries,
                useValue: instance(projectParticipantQueriesMock),
            },
            {
                provide: ProjectCraftQueries,
                useValue: instance(projectCraftQueriesMock),
            },
            {
                provide: TranslateService,
                useClass: TranslateServiceStub,
            },
            {
                provide: WorkareaQueries,
                useValue: instance(workareaQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectFilterChipsComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;

        when(projectCraftQueriesMock.observeCrafts()).thenReturn(of(crafts));
        when(workareaQueriesMock.observeWorkareas()).thenReturn(of(MOCK_WORKAREAS));
        when(projectParticipantQueriesMock.observeActiveParticipantsByCompanies()).thenReturn(of(participantByCompany));

        comp.taskFiltersCriteria = cloneDeep(defaultTaskFiltersCriteria);
        comp.milestoneFiltersCriteria = cloneDeep(defaultMilestoneFiltersCriteria);
        comp.ngOnInit();
    });

    it('should not render the chip list when there are no chips to render', () => {
        comp.taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        comp.milestoneFiltersCriteria = new MilestoneFiltersCriteria();
        comp.ngOnChanges();
        fixture.detectChanges();

        expect(getElement(projectFilterChipsSelector)).toBeFalsy();
    });

    it('should render the chip list when there are chips to render', () => {
        comp.taskFiltersCriteria = defaultTaskFiltersCriteria;
        comp.ngOnChanges();
        fixture.detectChanges();

        expect(getElement(projectFilterChipsSelector)).toBeTruthy();
    });

    it('should build the common and task chips when taskFiltersCriteria is provided with criteria', () => {
        const chipsCount = 12;

        comp.taskFiltersCriteria = defaultTaskFiltersCriteria;
        comp.milestoneFiltersCriteria = new MilestoneFiltersCriteria();
        comp.ngOnChanges();

        expect(comp.chips).toContain(statusChip);
        expect(comp.chips).toContain(statusChip2);
        expect(comp.chips).toContain(companyChip);
        expect(comp.chips).toContain(participantChip);
        expect(comp.chips).toContain(participantChip2);
        expect(comp.chips).toContain(workareaChip2);
        expect(comp.chips).toContain(workareaChip3);
        expect(comp.chips).toContain(fromChip);
        expect(comp.chips).toContain(toChip);
        expect(comp.chips).toContain(hasTopicsChip);
        expect(comp.chips).toContain(topicCriticalityChip);
        expect(comp.chips).toContain(jasmine.objectContaining(craftChip));
        expect(comp.chips.length).toBe(chipsCount);
    });

    it('should build the common and milestone chips when milestoneFiltersCriteria is provided with criteria', () => {
        const chipsCount = 7;

        comp.milestoneFiltersCriteria = defaultMilestoneFiltersCriteria;
        comp.taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        comp.ngOnChanges();

        expect(comp.chips).toContain(workareaChip1);
        expect(comp.chips).toContain(workareaChip2);
        expect(comp.chips).toContain(workareaChip3);
        expect(comp.chips).toContain(fromChip);
        expect(comp.chips).toContain(toChip);
        expect(comp.chips).toContain(jasmine.objectContaining(milestoneProjectTypeChip));
        expect(comp.chips).toContain(jasmine.objectContaining(milestoneCraftChip));
        expect(comp.chips.length).toBe(chipsCount);
    });

    it('should build the common chip for work area top row when milestoneFiltersCriteria is provided with header set to true', () => {
        const chipsCount = 1;

        comp.milestoneFiltersCriteria = Object.assign<MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
            new MilestoneFiltersCriteria(),
            {
                workAreas: {
                    header: true,
                    workAreaIds: [],
                },
            });
        comp.taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        comp.ngOnChanges();

        expect(comp.chips).toContain(workareaChip1);
        expect(comp.chips.length).toBe(chipsCount);
    });

    it('should not build the common chip for work area top row when milestoneFiltersCriteria is provided with header set to false', () => {
        const chipsCount = 0;

        comp.milestoneFiltersCriteria = Object.assign<MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
            new MilestoneFiltersCriteria(), {
                workAreas: {
                    header: false,
                    workAreaIds: [],
                },
            });
        comp.taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        comp.ngOnChanges();

        expect(comp.chips.length).toBe(chipsCount);
    });

    it('should build no chips when taskFiltersCriteria and milestoneFiltersCriteria are provided with no criteria', () => {
        comp.taskFiltersCriteria = new ProjectTaskFiltersCriteria();
        comp.milestoneFiltersCriteria = new MilestoneFiltersCriteria();
        comp.ngOnChanges();

        expect(comp.chips.length).toBe(0);
    });

    it('should not build company and participant chips when the participants by company are not yet provided', () => {
        comp.taskFiltersCriteria = Object.assign(new ProjectTaskFiltersCriteria(), {
            assignees: defaultTaskFiltersCriteria.assignees,
        });
        comp.ngOnChanges();

        when(projectParticipantQueriesMock.observeActiveParticipantsByCompanies()).thenReturn(of([]));
        comp.ngOnInit();

        expect(comp.chips).not.toContain(companyChip);
        expect(comp.chips).not.toContain(participantChip);
        expect(comp.chips).not.toContain(participantChip2);
    });

    it('should not build craft chips when the crafts are not yet provided', () => {
        comp.taskFiltersCriteria = Object.assign(new ProjectTaskFiltersCriteria(), {
            projectCraftIds: defaultTaskFiltersCriteria.projectCraftIds,
        });
        comp.ngOnChanges();

        when(projectCraftQueriesMock.observeCrafts()).thenReturn(of([]));
        comp.ngOnInit();

        expect(comp.chips).not.toContain(craftChip);
    });

    it('should not build milestone craft chips when the crafts are not yet provided', () => {
        comp.milestoneFiltersCriteria =
            Object.assign<MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
                new MilestoneFiltersCriteria(), {
                    types: {
                        types: [MilestoneTypeEnum.Craft],
                        projectCraftIds: defaultMilestoneFiltersCriteria.types.projectCraftIds,
                    },
                });
        comp.ngOnChanges();

        when(projectCraftQueriesMock.observeCrafts()).thenReturn(of([]));
        comp.ngOnInit();

        expect(comp.chips).not.toContain(milestoneCraftChip);
    });

    it('should not build milestone type chips from craft milestone type', () => {
        const fakeMilestoneCraftTypeChip: Chip<ChipId> = {
            id: `milestoneTypes_${MilestoneTypeEnum.Craft}`,
            text: MilestoneTypeEnumHelper.getLabelByValue(MilestoneTypeEnum.Craft),
        };

        comp.milestoneFiltersCriteria = Object.assign<MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
            new MilestoneFiltersCriteria(), {
                types: {
                    types: [MilestoneTypeEnum.Craft, MilestoneTypeEnum.Project],
                    projectCraftIds: [],
                },
            });
        comp.ngOnChanges();

        expect(comp.chips).not.toContain(jasmine.objectContaining(fakeMilestoneCraftTypeChip));
        expect(comp.chips).toContain(jasmine.objectContaining(milestoneProjectTypeChip));
    });

    it('should not build workarea chips when the workareas are not yet provided', () => {
        comp.taskFiltersCriteria = Object.assign(new ProjectTaskFiltersCriteria(), {
            workAreaIds: defaultTaskFiltersCriteria.workAreaIds,
        });
        comp.ngOnChanges();

        when(workareaQueriesMock.observeWorkareas()).thenReturn(of([]));
        comp.ngOnInit();

        expect(comp.chips).not.toContain(workareaChip2);
        expect(comp.chips).not.toContain(workareaChip3);
    });

    it('should build the chips in the right order', () => {
        const expectedResult = [
            fromChip.id,
            toChip.id,
            workareaChip1.id,
            workareaChip2.id,
            workareaChip3.id,
            milestoneProjectTypeChip.id,
            milestoneCraftChip.id,
            statusChip.id,
            statusChip2.id,
            craftChip.id,
            companyChip.id,
            participantChip.id,
            participantChip2.id,
            hasTopicsChip.id,
            topicCriticalityChip.id,
        ];

        expect(comp.chips.map(chip => chip.id)).toEqual(expectedResult);
    });

    it('should emit clearFilters when handleRemoveAllChips is called ', () => {
        spyOn(comp.clearFilters, 'emit');

        comp.handleRemoveAllChips();

        expect(comp.clearFilters.emit).toHaveBeenCalled();
    });

    it('should emit taskFiltersCriteriaChanged and milestoneFiltersCriteriaChanged with the filtered criteria ' +
        'when handleRemoveChip is called for the "from" chip', () => {
        const defaultTaskValue = DEFAULT_TASK_FILTERS_CRITERIA.from;
        const defaultMilestoneValue = DEFAULT_MILESTONE_FILTERS_CRITERIA.from;
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            from: defaultTaskValue,
        });
        const expectedMilestoneCriteria = Object.assign(new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria, {
            from: defaultMilestoneValue,
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(fromChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });

    it('should emit taskFiltersCriteriaChanged and milestoneFiltersCriteriaChanged with the filtered criteria ' +
        'when handleRemoveChip is called for the "to" chip', () => {
        const defaultTaskValue = DEFAULT_TASK_FILTERS_CRITERIA.to;
        const defaultMilestoneValue = DEFAULT_MILESTONE_FILTERS_CRITERIA.to;
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            to: defaultTaskValue,
        });
        const expectedMilestoneCriteria = Object.assign(new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria, {
            to: defaultMilestoneValue,
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(toChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });

    it('should emit taskFiltersCriteriaChanged and milestoneFiltersCriteriaChanged with the filtered criteria ' +
        'when handleRemoveChip is called for the "workArea" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            workAreaIds: [WORKAREA_UUID_EMPTY],
        });
        const expectedMilestoneCriteria =
            Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
                new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria,
                {
                    workAreas: Object.assign(new MilestoneFiltersCriteriaWorkArea(), {
                        ...defaultMilestoneFiltersCriteria.workAreas,
                        workAreaIds: [WORKAREA_UUID_EMPTY],
                    }),
                },
            );

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(workareaChip2);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });

    it('should emit taskFiltersCriteriaChanged and milestoneFiltersCriteriaChanged with the filtered criteria ' +
        'when handleRemoveChip is called for the top row "workArea" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria);
        const expectedMilestoneCriteria =
            Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
                new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria,
                {
                    workAreas: Object.assign(new MilestoneFiltersCriteriaWorkArea(), {
                        ...defaultMilestoneFiltersCriteria.workAreas,
                        header: false,
                    }),
                },
            );

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(workareaChip1);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called for the "craft" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            projectCraftIds: [],
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(craftChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called for the "status" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            status: [TaskStatusEnum.OPEN],
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(statusChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "hasTopics" chip', () => {
        const defaultValue = DEFAULT_TASK_FILTERS_CRITERIA.hasTopics;
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            hasTopics: defaultValue,
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(hasTopicsChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "criticality" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            topicCriticality: [],
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(topicCriticalityChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "company" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            assignees: new ProjectTaskFiltersAssignees(
                defaultTaskFiltersCriteria.assignees.participantIds,
                [],
            ),
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(companyChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit taskFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "participant" chip', () => {
        const expectedTaskCriteria = Object.assign(new ProjectTaskFiltersCriteria(), defaultTaskFiltersCriteria, {
            assignees: new ProjectTaskFiltersAssignees(
                [MOCK_PARTICIPANT_2.id],
                defaultTaskFiltersCriteria.assignees.companyIds,
            ),
        });

        spyOn(comp.taskFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(participantChip);

        expect(comp.taskFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedTaskCriteria);
    });

    it('should emit milestoneFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "milestoneTypes" chip', () => {
        const expectedMilestoneCriteria =
            Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
                new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria, {
                    types: Object.assign(new MilestoneFiltersCriteriaType(), defaultMilestoneFiltersCriteria.types, {
                        types: [MilestoneTypeEnum.Craft],
                    }),
                });

        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(milestoneProjectTypeChip);

        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });

    it('should emit milestoneFiltersCriteriaChanged with the filtered criteria when handleRemoveChip is called ' +
        'for the "milestoneCrafts" chip', () => {
        const expectedMilestoneCriteria =
            Object.assign<MilestoneFiltersCriteria, MilestoneFiltersCriteria, Partial<MilestoneFiltersCriteria>>(
                new MilestoneFiltersCriteria(), defaultMilestoneFiltersCriteria, {
                    types: Object.assign(new MilestoneFiltersCriteriaType(), {
                        types: [MilestoneTypeEnum.Project],
                        projectCraftIds: [],
                    }),
                });

        spyOn(comp.milestoneFiltersCriteriaChanged, 'emit');
        comp.handleRemoveChip(milestoneCraftChip);

        expect(comp.milestoneFiltersCriteriaChanged.emit).toHaveBeenCalledWith(expectedMilestoneCriteria);
    });
});
