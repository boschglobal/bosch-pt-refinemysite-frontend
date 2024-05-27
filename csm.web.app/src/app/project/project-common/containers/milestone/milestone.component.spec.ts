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
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
} from '../../../../../test/mocks/milestones';
import {MilestoneMarkerComponent} from '../../presentationals/milestone-marker/milestone-marker.component';
import {RelationQueries} from '../../store/relations/relation.queries';
import {
    CSS_CLASS_DIMMED_OUT,
    CSS_CLASS_FOCUSED,
    CSS_CLASS_MOVABLE,
    CSS_CLASS_NOT_SELECTABLE,
    CSS_CLASS_SELECTED,
    MILESTONE_ID_PREFIX,
    MilestoneComponent,
} from './milestone.component';
import {MilestoneTestComponent} from './milestone.test.component';

describe('Milestone Component', () => {
    let testHostComp: MilestoneTestComponent;
    let component: MilestoneComponent;
    let fixture: ComponentFixture<MilestoneTestComponent>;
    let de: DebugElement;

    const clickEvent: Event = new Event('click');
    const craftMilestone = MOCK_MILESTONE_CRAFT;
    const headerMilestone = MOCK_MILESTONE_HEADER;

    const relationQueries: RelationQueries = mock(RelationQueries);

    const milestoneComponentSelector = 'ss-milestone';
    const milestoneSelector = `[data-automation^="milestone-"]`;
    const milestoneTitleSelector = `[data-automation="milestone-title"]`;

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            MilestoneComponent,
            MilestoneMarkerComponent,
            MilestoneTestComponent,
        ],
        providers: [
            {
                provide: RelationQueries,
                useFactory: () => instance(relationQueries),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneTestComponent);
        testHostComp = fixture.componentInstance;

        de = fixture.debugElement.query(By.css(milestoneComponentSelector));
        component = de.componentInstance;

        testHostComp.milestone = headerMilestone;

        when(relationQueries.observeFinishToStartRelationsCriticalityByMilestoneId(headerMilestone.id)).thenReturn(of(false));
        when(relationQueries.observeFinishToStartRelationsCriticalityByMilestoneId(craftMilestone.id)).thenReturn(of(true));

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should set isCritical to false if relation query returns false', () => {
        expect(component.isCritical).toBe(false);
    });

    it('should set isCritical to true if relation query returns true', () => {
        testHostComp.milestone = craftMilestone;
        fixture.detectChanges();

        component.ngOnInit();

        expect(component.isCritical).toBe(true);
    });

    it('should set unique milestone id', () => {
        const expectedId = `#${MILESTONE_ID_PREFIX}${headerMilestone.id}`;

        testHostComp.milestone = headerMilestone;
        fixture.detectChanges();

        expect(getElement(expectedId)).toBeTruthy();
    });

    it('should render Milestone title', () => {
        const milestoneName = testHostComp.milestone.name;

        expect(getElement(milestoneSelector).title.trim()).toBe(milestoneName);
        expect(getElement(milestoneTitleSelector).textContent.trim()).toBe(milestoneName);
    });

    it('should define the marker color when the milestone is of the type Craft', () => {
        testHostComp.milestone = craftMilestone;
        fixture.detectChanges();

        expect(component.milestoneMarker.type).toBe(craftMilestone.type);
        expect(component.milestoneMarker.color).toBe(craftMilestone.craft.color);
    });

    it('should define the marker color as undefined when the milestone isn\'t of the type Craft', () => {
        expect(component.milestoneMarker.type).toBe(headerMilestone.type);
        expect(component.milestoneMarker.color).toBeUndefined();
    });

    it('should trigger selectMilestone event when milestone is clicked', () => {
        spyOn(component.selectMilestone, 'emit');

        getElement(milestoneSelector).dispatchEvent(clickEvent);

        expect(component.selectMilestone.emit).toHaveBeenCalledWith(headerMilestone.id);
    });

    it('should add CSS_CLASS_DIMMED_OUT when isDimmedOut is set to true', () => {
        testHostComp.isDimmedOut = true;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).toContain(CSS_CLASS_DIMMED_OUT);
    });

    it('should not add CSS_CLASS_DIMMED_OUT when isDimmedOut is set to false', () => {
        testHostComp.isDimmedOut = false;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_DIMMED_OUT);
    });

    it('should add CSS_CLASS_FOCUSED when milestone is focused', () => {
        testHostComp.focusedMilestoneId = testHostComp.milestone.id;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).toContain(CSS_CLASS_FOCUSED);
    });

    it('should not add CSS_CLASS_FOCUSED when milestone isn\'t focused', () => {
        testHostComp.focusedMilestoneId = `${testHostComp.milestone.id}-not`;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_FOCUSED);
    });

    it('should add CSS_CLASS_MOVABLE when user has permissions to update the milestone and the milestone can be dragged', () => {
        testHostComp.canDragMilestone = true;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).toContain(CSS_CLASS_MOVABLE);
    });

    it('should not add CSS_CLASS_MOVABLE when user has permissions to update the milestone and the milestone can\'t be dragged', () => {
        testHostComp.milestone = headerMilestone;
        testHostComp.canDragMilestone = false;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_MOVABLE);
    });

    it('should not add CSS_CLASS_MOVABLE when user has no permissions to update the milestone and the milestone can be dragged', () => {
        testHostComp.milestone = {
            ...headerMilestone,
            permissions: {
                ...headerMilestone.permissions,
                canUpdate: false,
            },
        };
        testHostComp.canDragMilestone = true;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_MOVABLE);
    });

    it('should add CSS_CLASS_SELECTED when milestone is selected', () => {
        testHostComp.milestone = headerMilestone;
        testHostComp.selectedMilestoneIds = [headerMilestone.id, 'foo'];
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).toContain(CSS_CLASS_SELECTED);
    });

    it('should not add CSS_CLASS_SELECTED when milestone isn\'t selected', () => {
        testHostComp.milestone = headerMilestone;
        testHostComp.selectedMilestoneIds = [`${headerMilestone}-not`, 'foo'];
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_SELECTED);
    });

    it('should add CSS_CLASS_NOT_SELECTABLE when milestone can\'t be selected', () => {
        testHostComp.milestone = headerMilestone;
        testHostComp.canSelectMilestone = false;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).toContain(CSS_CLASS_NOT_SELECTABLE);
    });

    it('should not add CSS_CLASS_SELECTED when milestone can be selected', () => {
        testHostComp.milestone = headerMilestone;
        testHostComp.canSelectMilestone = true;
        fixture.detectChanges();

        expect(getElement(milestoneSelector).classList).not.toContain(CSS_CLASS_NOT_SELECTABLE);
    });
});
