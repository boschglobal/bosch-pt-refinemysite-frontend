/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    DebugElement,
    NO_ERRORS_SCHEMA
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {ColorHelper} from '../../../../shared/misc/helpers/color.helper';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {
    CSS_CLASS_CRITICAL,
    CSS_CLASS_DIMMED_OUT,
    CSS_CLASS_SELECTED,
    MilestoneMarkerComponent,
} from './milestone-marker.component';
import {MilestoneMarkerTestComponent} from './milestone-marker.test.component';

describe('Milestone Marker Component', () => {
    let testHostComp: MilestoneMarkerTestComponent;
    let fixture: ComponentFixture<MilestoneMarkerTestComponent>;
    let de: DebugElement;
    let component: MilestoneMarkerComponent;

    const markerComponentSelector = '[data-automation="marker-component"]';
    const markerSelector = '[data-automation^="milestone-marker--"]';
    const innerCircleSelector = '[data-automation="milestone-marker-circle"]';
    const innerCheckmarkSelector = '[data-automation="milestone-marker-checkmark"]';
    const innerCriticalSelector = '[data-automation="milestone-marker-critical"]';

    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;
    const getMarkerElementByType = (type: MilestoneTypeEnum): HTMLElement => getElement(`[data-automation^="milestone-marker--${type}"]`);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [NO_ERRORS_SCHEMA],
            declarations: [
                MilestoneMarkerComponent,
                MilestoneMarkerTestComponent,
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneMarkerTestComponent);
        de = fixture.debugElement;
        testHostComp = fixture.componentInstance;
        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Investor};
        fixture.detectChanges();

        component = de.query(By.css(markerComponentSelector)).componentInstance;
    });

    it('should render Milestone marker', () => {
        expect(getElement(markerSelector)).toBeTruthy();
    });

    it('should render Investor Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--investor';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Investor, color: expectedBackgroundColor};
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).not.toEqual(expectedBackgroundColor);
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
    });

    it('should render Project Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--project';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Project, color: expectedBackgroundColor};
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).not.toEqual(expectedBackgroundColor);
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
    });

    it('should render Craft Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--craft';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Craft, color: expectedBackgroundColor};
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).toEqual(expectedBackgroundColor);
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
    });

    it('should render critical Craft Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--craft';
        const expectedClass2 = 'ss-milestone-marker--critical';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Craft, color: expectedBackgroundColor};
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).toEqual(expectedBackgroundColor);
        expect(getElement(innerCriticalSelector)).toBeTruthy();
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
        expect(getElement(markerSelector).classList.contains(expectedClass2)).toBeTruthy();
    });

    it('should render critical Investor Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--investor';
        const expectedClass2 = 'ss-milestone-marker--critical';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Investor, color: expectedBackgroundColor};
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).not.toEqual(expectedBackgroundColor);
        expect(getElement(innerCriticalSelector)).toBeTruthy();
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
        expect(getElement(markerSelector).classList.contains(expectedClass2)).toBeTruthy();
    });

    it('should render critical Project Milestone with the corresponding styles', () => {
        const expectedClass = 'ss-milestone-marker--project';
        const expectedClass2 = 'ss-milestone-marker--critical';
        const expectedBackgroundColor = 'blue';

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Project, color: expectedBackgroundColor};
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(innerCriticalSelector)).toBeTruthy();
        expect(getElement(markerSelector).style.backgroundColor).not.toEqual(expectedBackgroundColor);
        expect(getElement(markerSelector).classList.contains(expectedClass)).toBeTruthy();
        expect(getElement(markerSelector).classList.contains(expectedClass2)).toBeTruthy();
    });

    it('should render the inner circle when Milestone is focused', () => {
        testHostComp.isFocused = true;
        fixture.detectChanges();

        expect(getElement(innerCircleSelector)).toBeTruthy();
    });

    it('should not render the inner circle when Milestone isn\'t focused', () => {
        testHostComp.isFocused = false;
        fixture.detectChanges();

        expect(getElement(innerCircleSelector)).toBeFalsy();
    });

    it('should not render the critical icon when Milestone isn\'t critical', () => {
        testHostComp.isCritical = false;
        fixture.detectChanges();

        expect(getElement(innerCriticalSelector)).toBeFalsy();
    });

    it('should not render the inner circle when Milestone is focused but is also selected', () => {
        testHostComp.isFocused = true;
        testHostComp.isSelected = true;
        fixture.detectChanges();

        expect(getElement(innerCircleSelector)).toBeFalsy();
    });

    it('should not render the critical icon when Milestone is critical and selected', () => {
        testHostComp.isCritical = true;
        testHostComp.isSelected = true;
        fixture.detectChanges();

        expect(getElement(innerCriticalSelector)).toBeFalsy();
    });

    it('should not render the critical icon when Milestone is critical and focused', () => {
        testHostComp.isCritical = true;
        testHostComp.isFocused = true;
        fixture.detectChanges();

        expect(getElement(innerCircleSelector)).toBeTruthy();
        expect(getElement(innerCriticalSelector)).toBeFalsy();
    });

    it('should render the checkmark icon when Milestone is selected', () => {
        testHostComp.isSelected = true;
        fixture.detectChanges();

        expect(getElement(innerCheckmarkSelector)).toBeTruthy();
    });

    it('should not render the checkmark icon when Milestone isn\'t selected', () => {
        testHostComp.isSelected = false;
        fixture.detectChanges();

        expect(getElement(innerCheckmarkSelector)).toBeFalsy();
    });

    it('should add the CSS_CLASS_DIMMED_OUT class when the Milestone is dimmed out', () => {
        testHostComp.isDimmedOut = true;
        fixture.detectChanges();

        expect(getElement(markerSelector).classList).toContain(CSS_CLASS_DIMMED_OUT);
    });

    it('should not add the CSS_CLASS_DIMMED_OUT class when the Milestone is not dimmed out', () => {
        testHostComp.isDimmedOut = false;
        fixture.detectChanges();

        expect(getElement(markerSelector).classList).not.toContain(CSS_CLASS_DIMMED_OUT);
    });

    it('should add the CSS_CLASS_SELECTED class when the Milestone is selected', () => {
        testHostComp.isSelected = true;
        fixture.detectChanges();

        expect(getElement(markerSelector).classList.contains(CSS_CLASS_SELECTED)).toBeTruthy();
    });

    it('should not add the CSS_CLASS_SELECTED class when the Milestone isn\'t selected', () => {
        testHostComp.isSelected = false;
        fixture.detectChanges();

        expect(getElement(markerSelector).classList.contains(CSS_CLASS_SELECTED)).toBeFalsy();
    });

    it('should add the CSS_CLASS_CRITICAL class when the Milestone is critical', () => {
        testHostComp.isCritical = true;
        fixture.detectChanges();

        expect(getElement(markerSelector).classList.contains(CSS_CLASS_CRITICAL)).toBeTruthy();
    });

    it('should not define a marker color when Milestone is of type Craft but is also selected', () => {
        const expectedBackgroundColor = '';

        testHostComp.isSelected = true;
        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Craft, color: 'blue'};
        fixture.detectChanges();

        expect(getElement(markerSelector).style.backgroundColor).toBe(expectedBackgroundColor);
    });

    it('should define the marker selector with the type of the milestone marker', () => {
        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Craft, color: 'blue'};
        fixture.detectChanges();

        expect(getMarkerElementByType(MilestoneTypeEnum.Craft)).toBeTruthy();

        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Project, color: 'blue'};
        fixture.detectChanges();

        expect(getMarkerElementByType(MilestoneTypeEnum.Project)).toBeTruthy();
    });

    it('should use a lighter version of the marker color when the milestone is dimmed out', () => {
        const blendColor = '#aaa';

        spyOn(ColorHelper, 'blendColor').and.returnValue(blendColor);

        testHostComp.isDimmedOut = true;
        testHostComp.milestoneMarker = {type: MilestoneTypeEnum.Craft, color: 'blue'};
        fixture.detectChanges();

        expect(component.markerColor).toEqual(blendColor);
    });
});
