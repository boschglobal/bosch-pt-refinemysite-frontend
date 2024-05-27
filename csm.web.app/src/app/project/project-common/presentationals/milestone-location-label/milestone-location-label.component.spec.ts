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
import {TranslateModule} from '@ngx-translate/core';

import {
    MOCK_MILESTONE_CRAFT,
    MOCK_MILESTONE_HEADER,
    MOCK_MILESTONE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {MOCK_WORKAREA_A} from '../../../../../test/mocks/workareas';
import {MilestoneLocationLabelComponent} from './milestone-location-label.component';
import {MilestoneLocationLabelTestComponent} from './milestone-location-label.test.component';

describe('MilestoneLocationLabelComponent', () => {
    let fixture: ComponentFixture<MilestoneLocationLabelTestComponent>;
    let testHostComp: MilestoneLocationLabelTestComponent;
    let comp: MilestoneLocationLabelComponent;
    let de: DebugElement;

    const clickEvent: Event = new Event('click');
    const hostSelector = 'ss-milestone-location-label';
    const milestoneLocationLabelSelector = `[data-automation="milestone-location-label-location"]`;
    const milestoneLocationButtonSelector = `[data-automation="milestone-location-label-button"]`;

    const getElement = (selector: string): HTMLElement => de.query(By.css(selector))?.nativeElement;

    const moduleDef: TestModuleMetadata = {
        schemas: [
            NO_ERRORS_SCHEMA,
        ],
        imports: [
            TranslateModule.forRoot(),
        ],
        declarations: [
            MilestoneLocationLabelComponent,
            MilestoneLocationLabelTestComponent,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneLocationLabelTestComponent);
        testHostComp = fixture.componentInstance;
        de = fixture.debugElement.query(By.css(hostSelector));
        comp = de.componentInstance;
    });

    it('should display the workArea name when milestone has workArea', () => {
        const expectedResult = `${MOCK_WORKAREA_A.position}. ${MOCK_WORKAREA_A.name}`;

        testHostComp.milestone = MOCK_MILESTONE_WORKAREA;
        testHostComp.workArea = MOCK_WORKAREA_A;

        fixture.detectChanges();

        expect(getElement(milestoneLocationLabelSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should display "Generic_TopRow" when milestone is located in the header', () => {
        const expectedResult = 'Generic_TopRow';

        testHostComp.milestone = MOCK_MILESTONE_HEADER;

        fixture.detectChanges();

        expect(getElement(milestoneLocationLabelSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should display "Add Location" button when milestone has no workArea and isn\'t located in the header', () => {
        const expectedResult = 'Generic_AddLocation';

        testHostComp.milestone = MOCK_MILESTONE_CRAFT;

        fixture.detectChanges();

        expect(getElement(milestoneLocationLabelSelector)).toBeFalsy();
        expect(getElement(milestoneLocationButtonSelector).innerText.trim()).toBe(expectedResult);
    });

    it('should emit addLocation event when add location button is clicked', () => {
        spyOn(comp.addLocation, 'emit');

        testHostComp.milestone = MOCK_MILESTONE_CRAFT;
        fixture.detectChanges();
        getElement(milestoneLocationButtonSelector).dispatchEvent(clickEvent);

        expect(comp.addLocation.emit).toHaveBeenCalledWith(MOCK_MILESTONE_CRAFT);
    });
});
