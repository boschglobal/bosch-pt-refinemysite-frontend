/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
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

import {
    MOCK_RELATION_RESOURCE_2,
    MOCK_RELATION_RESOURCE_4
} from '../../../../../test/mocks/relations';
import {
    MOCK_TASK_CONSTRAINTS_RESOURCE,
    MOCK_TASK_CONSTRAINTS_RESOURCE_NO_ITEMS,
} from '../../../../../test/mocks/task-constraints';
import {TranslationModule} from '../../../../shared/translation/translation.module';
import {TaskStatistics} from '../../api/tasks/resources/task.resource';
import {TaskCardIndicatorsComponent} from './task-card-indicators.component';
import {TaskCardIndicatorsTestComponent} from './task-card-indicators.test.component';

describe('Task Card Indicators Component', () => {
    let testHostComp: TaskCardIndicatorsTestComponent;
    let comp: TaskCardIndicatorsComponent;
    let fixture: ComponentFixture<TaskCardIndicatorsTestComponent>;
    let de: DebugElement;

    const constraintsWithItems = MOCK_TASK_CONSTRAINTS_RESOURCE;
    const constraintsWithoutItems = MOCK_TASK_CONSTRAINTS_RESOURCE_NO_ITEMS;
    const relations = [MOCK_RELATION_RESOURCE_2];
    const criticalRelations = [MOCK_RELATION_RESOURCE_4];
    const statisticsWithoutTopics: TaskStatistics = {
        criticalTopics: 0,
        uncriticalTopics: 0,
    };
    const statisticsWithCriticalAndUncriticalTopics: TaskStatistics = {
        criticalTopics: 1,
        uncriticalTopics: 1,

    };
    const statisticsWithOnlyUncriticalTopics: TaskStatistics = {
        criticalTopics: 0,
        uncriticalTopics: 1,
    };

    const taskCardIndicatorsComponentSelector = 'ss-task-card-indicators';
    const taskCardIndicatorsTopicsSelector = '[data-automation="task-card-indicators-topics"]';
    const taskCardIndicatorsConstraintsSelector = '[data-automation="task-card-indicators-constraints"]';
    const taskCardIndicatorsDependenciesSelector = '[data-automation="task-card-indicators-dependencies"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        imports: [TranslationModule.forRoot()],
        declarations: [
            TaskCardIndicatorsComponent,
            TaskCardIndicatorsTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TaskCardIndicatorsTestComponent);
        testHostComp = fixture.componentInstance;
        fixture.detectChanges();

        de = fixture.debugElement.query(By.css(taskCardIndicatorsComponentSelector));
        comp = de.componentInstance;
    });

    it('should show the topics icon when the task has topics', () => {
        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsTopicsSelector)).toBeTruthy();
    });

    it('should not show the topics icon when the task does not have topics', () => {
        testHostComp.statistics = statisticsWithoutTopics;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsTopicsSelector)).toBeFalsy();
    });

    it('should set the topics icon as "topic-critical-tiny" when task is not selected nor focused nor dimmed out ' +
        'and has critical and uncritical topics', () => {
        const expectedTopicsIcon = 'topic-critical-tiny';

        testHostComp.statistics = statisticsWithCriticalAndUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-critical-tiny" when task is not selected nor focused but is dimmed out ' +
        'and has critical and uncritical topics', () => {
        const expectedTopicsIcon = 'topic-critical-tiny';

        testHostComp.statistics = statisticsWithCriticalAndUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-critical-tiny-focus" when task is not selected but is dimmed out and focused ' +
        'and has critical and uncritical topics', () => {
        const expectedTopicsIcon = 'topic-critical-tiny-focus';

        testHostComp.statistics = statisticsWithCriticalAndUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-critical-tiny-focus" when task is not focused but is dimmed out and selected ' +
        'and has critical and uncritical topics', () => {
        const expectedTopicsIcon = 'topic-critical-tiny-focus';

        testHostComp.statistics = statisticsWithCriticalAndUncriticalTopics;
        testHostComp.isSelected = true;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-tiny" when task is not selected nor focused nor dimmed out ' +
        'and has only uncritical topics', () => {
        const expectedTopicsIcon = 'topic-tiny';

        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-tiny-focus" when task is not selected nor focused but is dimmed out ' +
        'and has only uncritical topics', () => {
        const expectedTopicsIcon = 'topic-tiny-focus';

        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-tiny-focus" when task is not selected nor dimmed out but is focused ' +
        'and has only uncritical topics', () => {
        const expectedTopicsIcon = 'topic-tiny-focus';

        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics icon as "topic-tiny-focus" when task is not focused nor dimmed out but is selected ' +
        'and has only uncritical topics', () => {
        const expectedTopicsIcon = 'topic-tiny-focus';

        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        testHostComp.isSelected = true;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.topicsIcon).toBe(expectedTopicsIcon);
    });

    it('should set the topics indicator title as "Generic_CriticalTopics" when the task has critical topics', () => {
        const expectedTitle = 'Generic_CriticalTopics';

        testHostComp.statistics = statisticsWithCriticalAndUncriticalTopics;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsTopicsSelector).title).toBe(expectedTitle);
    });

    it('should set the topics indicator title as "Generic_Topics" when the task does not have critical topics', () => {
        const expectedTitle = 'Generic_Topics';

        testHostComp.statistics = statisticsWithOnlyUncriticalTopics;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsTopicsSelector).title).toBe(expectedTitle);
    });

    it('should show the constraints icon when the task has constraints', () => {
        testHostComp.constraints = constraintsWithItems;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsConstraintsSelector)).toBeTruthy();
    });

    it('should not show the constraints icon when the task does not have constraints', () => {
        testHostComp.constraints = constraintsWithoutItems;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsConstraintsSelector)).toBeFalsy();
    });

    it('should set the constraint icon as "problem-tiny" when task is not selected nor focused nor dimmed out and has constraints', () => {
        const expectedConstraintIcon = 'problem-tiny';

        testHostComp.constraints = constraintsWithItems;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.constraintsIcon).toBe(expectedConstraintIcon);
    });

    it('should set the constraint icon as "problem-tiny" when task is not selected nor focused but is dimmed out ' +
        'and has constraints', () => {
        const expectedConstraintIcon = 'problem-tiny';

        testHostComp.constraints = constraintsWithItems;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.constraintsIcon).toBe(expectedConstraintIcon);
    });

    it('should set the constraint icon as "problem-tiny-focus" when task is not selected but is dimmed out and focused ' +
        'and has constraints', () => {
        const expectedConstraintIcon = 'problem-tiny-focus';

        testHostComp.constraints = constraintsWithItems;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.constraintsIcon).toBe(expectedConstraintIcon);
    });

    it('should set the constraint icon as "problem-tiny-focus" when task is not focused but is dimmed out and selected ' +
        'and has constraints', () => {
        const expectedConstraintIcon = 'problem-tiny-focus';

        testHostComp.constraints = constraintsWithItems;
        testHostComp.isSelected = true;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.constraintsIcon).toBe(expectedConstraintIcon);
    });

    it('should set the constraints indicator title as the list of constraints separated by a comma', () => {
        const expectedTitle = constraintsWithItems.items.map(action => action.name).join(', ');

        testHostComp.constraints = constraintsWithItems;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsConstraintsSelector).title).toBe(expectedTitle);
    });

    it('should not show the dependencies icon when the task does not have predecessors nor successors', () => {
        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = [];
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector)).toBeFalsy();
    });

    it('should show the dependencies icon when the task have predecessors', () => {
        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = [];
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector)).toBeTruthy();
    });

    it('should show the dependencies icon when the task have successors', () => {
        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = relations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector)).toBeTruthy();
    });

    it('should show the dependencies icon when the task have predecessors and successors', () => {
        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = relations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector)).toBeTruthy();
    });

    it('should set the dependencies icon as dependencies-predecessor-tiny when task is not focused and has predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-tiny';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-predecessor-tiny-focus when task is focused and has predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-tiny-focus';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-predecessor-tiny-focus when task is dimmed out and has predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-tiny-focus';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-predecessor-critical-tiny when task ' +
        'is not focused and has critical predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-critical-tiny';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-predecessor-critical-tiny when task ' +
        'is dimmed out and has critical predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-critical-tiny';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-predecessor-critical-tiny-focus when task ' +
        'is focused and has critical predecessors', () => {
        const expectedDependenciesIcon = 'dependencies-predecessor-critical-tiny-focus';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = [];
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-tiny when task is not focused and has successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-tiny';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-tiny-focus when task is focused and has successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-tiny-focus';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-tiny-focus when task is dimmed out and has successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-tiny-focus';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-critical-tiny when task ' +
        'is not focused and has critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-critical-tiny';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-critical-tiny when task ' +
        'is dimmed out and has critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-critical-tiny';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-successor-critical-tiny-focus when task ' +
        'is focused and has critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-successor-critical-tiny-focus';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-tiny when task is not focused and has predecessors and successors', () => {
        const expectedDependenciesIcon = 'dependencies-tiny';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-tiny-focus when task is focused and has predecessors and successors', () => {
        const expectedDependenciesIcon = 'dependencies-tiny-focus';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-tiny-focus when task is dimmed out and has predecessors and successors', () => {
        const expectedDependenciesIcon = 'dependencies-tiny-focus';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-critical-tiny when task ' +
        'is not focused and has critical predecessors and successors', () => {
        const expectedDependenciesIcon = 'dependencies-critical-tiny';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-critical-tiny when task ' +
        'is dimmed out and has critical predecessors and successors', () => {
        const expectedDependenciesIcon = 'dependencies-critical-tiny';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = relations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = true;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-critical-tiny when task ' +
        'is not focused and has predecessors and critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-critical-tiny';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-critical-tiny when task ' +
        'is not focused and has both critical predecessors and critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-critical-tiny';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = false;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies icon as dependencies-critical-tiny-focus when task ' +
        'is focused and has critical predecessors or critical successors', () => {
        const expectedDependenciesIcon = 'dependencies-critical-tiny-focus';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = criticalRelations;
        testHostComp.isSelected = false;
        testHostComp.isFocused = true;
        testHostComp.isDimmed = false;
        fixture.detectChanges();

        expect(comp.dependenciesIcon).toBe(expectedDependenciesIcon);
    });

    it('should set the dependencies title as "Generic_Predecessor" when the task has predecessors', () => {
        const expectedTitle = 'Generic_Predecessor';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = [];
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_CriticalPredecessor" when the task has critical predecessors', () => {
        const expectedTitle = 'Generic_CriticalPredecessor';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = [];
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_Successor" when the task has successors', () => {
        const expectedTitle = 'Generic_Successor';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = relations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_CriticalSuccessor" when the task has critical successors', () => {
        const expectedTitle = 'Generic_CriticalSuccessor';

        testHostComp.predecessorRelations = [];
        testHostComp.successorRelations = criticalRelations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_PredecessorAndSuccessor" when the task has predecessors and successors', () => {
        const expectedTitle = 'Generic_PredecessorAndSuccessor';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = relations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_CriticalPredecessorAndSuccessor" when the task ' +
        'has critical predecessors and successors', () => {
        const expectedTitle = 'Generic_CriticalPredecessorAndSuccessor';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = relations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_CriticalPredecessorAndSuccessor" when the task ' +
        'has predecessors and critical successors', () => {
        const expectedTitle = 'Generic_CriticalPredecessorAndSuccessor';

        testHostComp.predecessorRelations = relations;
        testHostComp.successorRelations = criticalRelations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });

    it('should set the dependencies title as "Generic_CriticalPredecessorAndSuccessor" when the task ' +
        'has both critical predecessors and critical successors', () => {
        const expectedTitle = 'Generic_CriticalPredecessorAndSuccessor';

        testHostComp.predecessorRelations = criticalRelations;
        testHostComp.successorRelations = criticalRelations;
        fixture.detectChanges();

        expect(getElement(taskCardIndicatorsDependenciesSelector).title).toBe(expectedTitle);
    });
});
