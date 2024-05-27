/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TranslateModule} from '@ngx-translate/core';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA,
} from '../../../../../test/mocks/milestones';
import {
    MilestoneMarkerComponent,
    MilestoneMarkerModel,
} from '../milestone-marker/milestone-marker.component';
import {MilestoneTypeLabelComponent} from './milestone-type-label.component';
import {MilestoneTypeLabelTestComponent} from './milestone-type-label.test.component';

describe('Milestone Type Label Component', () => {
    let fixture: ComponentFixture<MilestoneTypeLabelTestComponent>;
    let testHostComp: MilestoneTypeLabelTestComponent;
    let comp: MilestoneTypeLabelComponent;
    let de: DebugElement;

    const hostSelector = 'ss-milestone-type-label';
    const labelSelector = '[data-automation="milestone-type-label-label"]';

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        imports: [TranslateModule.forRoot()],
        declarations: [
            MilestoneTypeLabelComponent,
            MilestoneTypeLabelTestComponent,
            MilestoneMarkerComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneTypeLabelTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(hostSelector));
        comp = de.componentInstance;

        testHostComp.milestone = MOCK_MILESTONE_CRAFT;

        fixture.detectChanges();
    });

    it('should define the milestone marker model with craft color when the provided milestone is of type Craft', () => {
        const {type, craft: {color}} = MOCK_MILESTONE_CRAFT;
        const expectedResult: MilestoneMarkerModel = {type, color};

        expect(comp.milestoneMarker).toEqual(expectedResult);
    });

    it('should define the milestone marker model without craft color when the provided milestone isn\'t of type Craft', () => {
        const {type} = MOCK_MILESTONE_HEADER;
        const expectedResult: MilestoneMarkerModel = {type, color: undefined};

        testHostComp.milestone = MOCK_MILESTONE_HEADER;
        fixture.detectChanges();

        expect(comp.milestoneMarker).toEqual(expectedResult);
    });

    it('should display the correct milestone label when the milestone is of type Craft', () => {
        const expectedResult = MOCK_MILESTONE_CRAFT.craft.displayName;

        expect(getElement(labelSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should display the correct milestone label when the milestone is of type Investor', () => {
        const expectedResult = 'MilestoneTypeEnum_Investor';

        testHostComp.milestone = MOCK_MILESTONE_HEADER;
        fixture.detectChanges();

        expect(getElement(labelSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should display the correct milestone label when the milestone is of type Project', () => {
        const expectedResult = 'MilestoneTypeEnum_Project';

        testHostComp.milestone = MOCK_MILESTONE_WORKAREA;
        fixture.detectChanges();
        expect(getElement(labelSelector).innerText.trim()).toBe(expectedResult);
    });
});
