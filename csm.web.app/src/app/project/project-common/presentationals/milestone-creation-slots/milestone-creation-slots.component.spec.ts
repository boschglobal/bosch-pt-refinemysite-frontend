/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import * as moment from 'moment';
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {API_DATE_YEAR_MONTH_DAY_FORMAT} from '../../../../shared/rest/constants/date-format.constant';
import {FlyoutDirective} from '../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {SaveMilestoneResource} from '../../api/milestones/resources/save-milestone.resource';
import {MilestoneTypeOption} from '../../containers/milestone-type-options/milestone-type-options.component';
import {MilestoneTypeEnum} from '../../enums/milestone-type.enum';
import {ProjectSliceService} from '../../store/projects/project-slice.service';
import {
    DEFAULT_MILESTONE_MARKER_MODEL,
    MilestoneCreationSlotsComponent,
} from './milestone-creation-slots.component';

describe('MilestoneCreationSlotsComponent', () => {
    let component: MilestoneCreationSlotsComponent;
    let fixture: ComponentFixture<MilestoneCreationSlotsComponent>;
    let flyoutService: FlyoutService;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const projectId = 'foo';
    const rowId = 'bar';
    const week = moment('2020-01-11');
    const header = false;
    const title = 'Milestone 1';
    const slotIndex = 0;
    const milestoneTypeOption: MilestoneTypeOption = {
        marker: {
            type: MilestoneTypeEnum.Craft,
            color: '#000000',
        },
        craftId: 'baz-id'
    };
    const selectedSlotCSSClass = 'ss-milestone-creation-slots__slot--selected';

    const slotSelector = '[data-automation^="milestone-creation-slot-"]';
    const slotMakerSelector = `[data-automation="milestone-creation-slot-marker-${slotIndex}"]`;
    const milestoneTypeFlyoutSelector = '[data-automation="milestone-type-options"]';
    const milestoneTitleFlyoutSelector = '[data-automation="milestone-title-capture"]';

    const clickEvent: Event = new Event('click');

    const selectElements = (selector: string) => fixture.debugElement.queryAll(By.css(selector));
    const selectElement = (selector: string) => fixture.debugElement.query(By.css(selector))?.nativeElement;
    const selectFlyout = (selector: string) => document.querySelector(selector);
    const closeFlyout = (flyoutId: string) => {
        if (flyoutService.isFlyoutOpen(flyoutId)) {
            flyoutService.close(flyoutId);
        }
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA,
            ],
            providers: [
                {
                    provide: ProjectSliceService,
                    useFactory: () => instance(projectSliceServiceMock)
                }
            ],
            declarations: [
                MilestoneCreationSlotsComponent,
                FlyoutDirective,
            ]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneCreationSlotsComponent);
        component = fixture.componentInstance;

        flyoutService = TestBed.inject(FlyoutService);
        when(projectSliceServiceMock.observeCurrentProjectId()).thenReturn(of(projectId));

        component.header = header;
        component.workAreaId = rowId;
        component.week = week;

        fixture.detectChanges();
    });

    afterEach(() => {
        closeFlyout(component.getFlyoutId(slotIndex, 'type'));
        closeFlyout(component.getFlyoutId(slotIndex, 'title'));
    });

    it('should render a slot for each day of the week', () => {
        const expectedValue = 7;

        expect(selectElements(slotSelector).length).toBe(expectedValue);
    });

    it('should open "MilestoneTypeOptionsComponent" flyout when a slot is clicked', () => {
        spyOn(flyoutService, 'open').and.callThrough();
        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);

        fixture.detectChanges();

        expect(selectFlyout(milestoneTypeFlyoutSelector)).toBeTruthy();
        expect(flyoutService.open).toHaveBeenCalledWith(component.getFlyoutId(slotIndex, 'type'));
    });

    it('should reset the previously selected slot when a slot is clicked', () => {
        const previousSlotIndex = 1;

        selectElements(slotSelector)[previousSlotIndex].nativeElement.dispatchEvent(clickEvent);
        component.handleSelectOption(milestoneTypeOption);

        expect(component.marker).toBe(milestoneTypeOption.marker);
        expect(component.selectedDayIndex).toBe(previousSlotIndex);

        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);

        expect(component.marker).toBe(DEFAULT_MILESTONE_MARKER_MODEL);
        expect(component.selectedDayIndex).toBe(slotIndex);
    });

    it('should close the "MilestoneTitleCaptureComponent" flyout when a slot is clicked and was previously selected', () => {
        spyOn(flyoutService, 'close').and.callThrough();

        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);
        component.handleSelectOption(milestoneTypeOption);

        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);

        expect(flyoutService.close).toHaveBeenCalledWith(component.getFlyoutId(slotIndex, 'title'));
    });

    it('should open "MilestoneTitleCaptureComponent" flyout after a milestone type is selected', () => {
        component.handleSelectIndex(slotIndex);
        fixture.detectChanges();

        component.handleSelectOption(milestoneTypeOption);
        fixture.detectChanges();

        expect(selectFlyout(milestoneTitleFlyoutSelector)).toBeTruthy();
    });

    it('should set right marker after milestone type is selected', () => {
        component.handleSelectIndex(slotIndex);
        component.handleSelectOption(milestoneTypeOption);

        fixture.detectChanges();

        expect(component.marker).toEqual(milestoneTypeOption.marker);
        expect(selectElement(slotMakerSelector)).toBeTruthy();
    });

    it('should highlight selected slot', () => {
        component.handleSelectIndex(slotIndex);

        fixture.detectChanges();

        expect(component.marker).toEqual(DEFAULT_MILESTONE_MARKER_MODEL);
        expect(selectElement(slotMakerSelector)).toBeTruthy();
        expect(selectElements(slotSelector)[slotIndex].classes[selectedSlotCSSClass]).toBeTruthy();
    });

    it('should emit addMilestone with right payload and close milestone title flyout', () => {
        spyOn(component.addMilestone, 'emit');
        spyOn(flyoutService, 'close');

        component.handleSelectIndex(slotIndex);
        component.handleSelectOption(milestoneTypeOption);
        component.handleAddMilestone(title);

        const {craftId, marker} = milestoneTypeOption;
        const date = week.clone().add(slotIndex, 'd');
        const expectedValue = new SaveMilestoneResource(
            projectId,
            title,
            marker.type,
            date.format(API_DATE_YEAR_MONTH_DAY_FORMAT),
            header,
            craftId,
            rowId,
        );

        expect(component.addMilestone.emit).toHaveBeenCalledWith(expectedValue);
        expect(flyoutService.close).toHaveBeenCalledWith(component.getFlyoutId(slotIndex, 'title'));
    });

    it('should reset the slots when creation is aborted by dismissing "MilestoneTypeOptionsComponent" without picking an option', () => {
        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);
        fixture.detectChanges();

        closeFlyout(component.getFlyoutId(slotIndex, 'type'));

        expect(component.selectedDayIndex).toBeNull();
        expect(component.marker).toBe(DEFAULT_MILESTONE_MARKER_MODEL);
    });

    it('should not reset the slots when dismissing "MilestoneTypeOptionsComponent" but an option was picked', () => {
        selectElements(slotSelector)[slotIndex].nativeElement.dispatchEvent(clickEvent);
        component.handleSelectOption(milestoneTypeOption);
        fixture.detectChanges();

        closeFlyout(component.getFlyoutId(slotIndex, 'type'));

        expect(component.marker).toBe(milestoneTypeOption.marker);
        expect(component.selectedDayIndex).toBe(slotIndex);
    });

    it('should reset the slots when creation is aborted by dismissing "MilestoneTitleCaptureComponent"', () => {
        component.handleSelectIndex(slotIndex);
        fixture.detectChanges();

        component.handleSelectOption(milestoneTypeOption);
        fixture.detectChanges();

        closeFlyout(component.getFlyoutId(slotIndex, 'title'));

        expect(component.selectedDayIndex).toBeNull();
        expect(component.marker).toBe(DEFAULT_MILESTONE_MARKER_MODEL);
    });
});
