/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    CdkDrag,
    CdkDragDrop,
    CdkDragEnter,
    CdkDragStart,
    DragDropModule,
} from '@angular/cdk/drag-drop';
import {
    ChangeDetectorRef,
    DebugElement,
    ElementRef
} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {flatten} from 'lodash';
import * as moment from 'moment';

import {DateParserStrategyStub} from '../../../../../test/stubs/date-parser.strategy.stub';
import {MilestoneDragHelper} from '../../../../project/project-common/helpers/milestone-drag.helper';
import {TimeScope} from '../../../misc/api/datatypes/time-scope.datatype';
import {CursorClassEnum} from '../../../misc/enums/cursor-class.enum';
import {DIMENSIONS} from '../../constants/dimensions.constant';
import {DateParserStrategy} from '../../dates/date-parser.strategy';
import {
    CalendarMilestone,
    RowId,
} from '../calendar/calendar.component';
import {CALENDAR_CONSTANTS} from '../contants/calendar.contants';
import {CALENDAR_MILESTONE_CONSTANTS} from '../contants/calendar-milestone.constant';
import {
    DaySlotId,
    MilestoneSlot,
    MilestoneSlotsComponent,
    MoveMilestonePayload,
    NUMBER_OF_DAYS_PER_WEEK,
} from './milestone-slots.component';

describe('MilestoneSlotsComponent', () => {
    let changeDetectorRef: ChangeDetectorRef;
    let component: MilestoneSlotsComponent;
    let fixture: ComponentFixture<MilestoneSlotsComponent>;
    let milestoneDragHelper: MilestoneDragHelper;

    const classIsDragging = 'ss-milestone-slots--dragging';
    const daySlotsSelector = '[data-automation^="milestone-slots-day"]';
    const milestoneSlotsSelector = '[data-automation="ss-milestone-slots"]';

    const weekWidth = 154;
    const milestoneOne: CalendarMilestone = {
        id: 'milestone1',
        date: moment('2020-12-31'),
    };
    const milestoneTwo: CalendarMilestone = {
        id: 'milestone2',
        date: moment('2021-01-15'),
    };
    const milestoneThree: CalendarMilestone = {
        id: 'milestone3',
        date: moment('2021-01-15'),
    };
    const milestoneFour: CalendarMilestone = {
        id: 'milestone4',
        date: moment('2021-01-18'),
    };
    const milestoneFive: CalendarMilestone = {
        id: 'milestone5',
        date: moment('2021-01-20'),
    };
    const milestoneSix: CalendarMilestone = {
        id: 'milestone6',
        date: moment('2021-02-21'),
    };
    const rowId = 'foo';
    const timeScope = new TimeScope('2021-01-10', '2021-02-20');

    const getDaySlotSelector = (slotIndex: number) => `[data-automation="milestone-slots-day-${slotIndex}"`;
    const getMilestoneSelector = (milestoneId: string) => `[data-automation="milestone-slots-milestone-${milestoneId}"`;
    const getElement = (selector: string): HTMLElement => fixture.debugElement.query(By.css(selector))?.nativeElement;
    const getElements = (selector: string): DebugElement[] => fixture.debugElement.queryAll(By.css(selector));
    const getMilestoneSlotsByMilestoneId = (milestoneId: string): MilestoneSlot => {
        const milestoneSlots = flatten(component.daySlots.map(daySlot => daySlot.milestoneSlots));

        return milestoneSlots.find(milestoneSlot => milestoneSlot.milestone?.id === milestoneId);
    };
    const getDaySlotsWithMilestones = (): CalendarMilestone[][] => component.daySlots.map(daySlot => daySlot.milestoneSlots.map(milestoneSlot => milestoneSlot.milestone));
    const getDayWidth = (width: number) => {
        const daySpacer = DIMENSIONS.base_dimension__x025 * (NUMBER_OF_DAYS_PER_WEEK - 1) / NUMBER_OF_DAYS_PER_WEEK;

        return (width / NUMBER_OF_DAYS_PER_WEEK) - daySpacer;
    };
    const getDropContainer = ({date}: CalendarMilestone): ElementRef<HTMLElement> => {
        const shiftAmount = date.clone().diff(timeScope.start, 'd');

        return new ElementRef(getElement(getDaySlotSelector(shiftAmount)).firstElementChild as HTMLElement);
    };

    const extractNumberFromStyle = (width: string): number => Number(width.replace('px', ''));

    const collapsedDayWidth = getDayWidth(weekWidth);
    const expandedDayWidth = getDayWidth(CALENDAR_CONSTANTS.expandedWeekWidth);

    const moduleDef: TestModuleMetadata = {
        declarations: [
            MilestoneSlotsComponent,
        ],
        providers: [
            {
                provide: DateParserStrategy,
                useClass: DateParserStrategyStub,
            },
        ],
        imports: [
            DragDropModule,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MilestoneSlotsComponent);
        component = fixture.componentInstance;
        changeDetectorRef = fixture.componentRef.injector.get(ChangeDetectorRef);
        milestoneDragHelper = TestBed.inject(MilestoneDragHelper);

        component.scope = timeScope;
        component.expandedWeeks = [];
        component.weekWidth = weekWidth;
        component.milestones = [milestoneFour];
        component.rowId = rowId;

        component.ngOnInit();
        changeDetectorRef.detectChanges();
    });

    it('should not process daySlots if scope is not defined', () => {
        const daySlots = component.daySlots;

        component.scope = null;

        expect(component.daySlots).toBe(daySlots);
    });

    it('should not process daySlots if expandedWeeks is not defined', () => {
        const daySlots = component.daySlots;

        component.expandedWeeks = null;

        expect(component.daySlots).toBe(daySlots);
    });

    it('should not process daySlots if weekWidth is not defined', () => {
        const daySlots = component.daySlots;

        component.weekWidth = null;

        expect(component.daySlots).toBe(daySlots);
    });

    it('should create a daySlot for every day in the time scope', () => {
        const expectedValue = 42;

        expect(getElements(daySlotsSelector).length).toBe(expectedValue);
    });

    it('should define the width of a day depending on the provided weekWidth if the week is not expanded', () => {
        const dayIndex = 3;
        const daySlotElement = getElement(getDaySlotSelector(dayIndex));

        expect(extractNumberFromStyle(daySlotElement.style.width)).toBeCloseTo(collapsedDayWidth);
    });

    it('should define the width of a day depending on the default expandedWeekWidth if the week is expanded', () => {
        const dayIndex = 3;
        let daySlotElement: HTMLElement;

        component.expandedWeeks = [timeScope.start];
        changeDetectorRef.detectChanges();

        daySlotElement = getElement(getDaySlotSelector(dayIndex));

        expect(daySlotElement).toBeTruthy();
        expect(extractNumberFromStyle(daySlotElement.style.width)).toBeCloseTo(expandedDayWidth);
    });

    it('should default the milestones input to [] when falsy value is passed', () => {
        component.milestones = undefined;

        expect(flatten(getDaySlotsWithMilestones())).toEqual([]);
    });

    it('should only process milestones inside the time scope', () => {
        const milestones = [milestoneOne, milestoneTwo, milestoneSix];
        const expectedMilestones = [milestoneTwo];
        let processedMilestones: CalendarMilestone[];

        component.milestones = milestones;
        processedMilestones = flatten(getDaySlotsWithMilestones());

        expect(processedMilestones).toEqual(expectedMilestones);
    });

    it('should position milestones in the corresponding day slot', () => {
        const milestones = [milestoneTwo, milestoneFour];
        const milestoneTwoPosition = 5;
        const milestoneFourPosition = 8;
        let daySlots: CalendarMilestone[][];

        component.milestones = milestones;
        daySlots = getDaySlotsWithMilestones();

        expect(daySlots[milestoneTwoPosition]).toContain(milestoneTwo);
        expect(daySlots[milestoneFourPosition]).toContain(milestoneFour);
    });

    it('should center the milestone in the day slot when week is not expanded', () => {
        const expectedPaddingLeft = (collapsedDayWidth / 2) - (CALENDAR_MILESTONE_CONSTANTS.defaultWidth / 2);
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneTwo];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneTwo.id));

        expect(extractNumberFromStyle(milestoneElement.style.paddingLeft)).toBeCloseTo(expectedPaddingLeft);
    });

    it('should center the milestone in the day slot when week is expanded', () => {
        const expectedPaddingLeft = (expandedDayWidth / 2) - (CALENDAR_MILESTONE_CONSTANTS.defaultWidth / 2);
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneTwo];
        component.expandedWeeks = [timeScope.start];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneTwo.id));

        expect(extractNumberFromStyle(milestoneElement.style.paddingLeft)).toBeCloseTo(expectedPaddingLeft);
    });

    it('should allow a milestone to expand until the last available day slot when it the only one available', () => {
        const collapsedDaysWidth = 35 * collapsedDayWidth;
        const expandedDaysWidth = 2 * expandedDayWidth;
        const weekChangesWidth = 5 * CALENDAR_CONSTANTS.weekSpacer;
        const expectedMaxWidth = collapsedDaysWidth + expandedDaysWidth + weekChangesWidth - DIMENSIONS.base_dimension__x05;
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneTwo];
        component.expandedWeeks = [timeScope.start];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneTwo.id));

        expect(extractNumberFromStyle(milestoneElement.style.maxWidth)).toBeCloseTo(expectedMaxWidth);
    });

    it('should allow a milestone to expand until the next milestone slot in the same row', () => {
        const collapsedDaysWidth = 2 * collapsedDayWidth;
        const expandedDaysWidth = expandedDayWidth;
        const weekChangesWidth = CALENDAR_CONSTANTS.weekSpacer;
        const nextMilestoneMargin = (expandedDayWidth / 2) - (CALENDAR_MILESTONE_CONSTANTS.defaultWidth / 2);
        const expectedMaxWidth = collapsedDaysWidth + expandedDaysWidth + weekChangesWidth + nextMilestoneMargin - DIMENSIONS.base_dimension__x05;
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneTwo, milestoneFour];
        component.expandedWeeks = [timeScope.start.clone().add(1, 'w')];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneTwo.id));

        expect(extractNumberFromStyle(milestoneElement.style.maxWidth)).toBeCloseTo(expectedMaxWidth);
    });

    it('should allow a milestone to expand until the last available day slot when it doesn\'t collide with others', () => {
        const collapsedDaysWidth = 37 * collapsedDayWidth;
        const weekChangesWidth = 5 * CALENDAR_CONSTANTS.weekSpacer;
        const expectedMaxWidth = collapsedDaysWidth + weekChangesWidth - DIMENSIONS.base_dimension__x05;
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneTwo, milestoneThree, milestoneFour];
        component.expandedWeeks = [];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneThree.id));

        expect(extractNumberFromStyle(milestoneElement.style.maxWidth)).toBeCloseTo(expectedMaxWidth);
    });

    it('should show only the milestone marker when the calculated width is less than the defined min-width', () => {
        let milestoneElement: HTMLElement;

        component.milestones = [milestoneFour, milestoneFive];
        component.expandedWeeks = [];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneFour.id));

        expect(milestoneElement.style.maxWidth).toBe(`${CALENDAR_MILESTONE_CONSTANTS.defaultWidth}px`);
    });

    it('should show the full milestone when the calculated width is more than the defined min-width', () => {
        const currentWeekWidth = 238;
        const currentCollapsedDayWidth = getDayWidth(currentWeekWidth);
        const collapsedDaysWidth = 2 * currentCollapsedDayWidth;
        const nextMilestoneMargin = (currentCollapsedDayWidth / 2) - (CALENDAR_MILESTONE_CONSTANTS.defaultWidth / 2);
        const expectedMaxWidth = collapsedDaysWidth + nextMilestoneMargin - DIMENSIONS.base_dimension__x05;
        let milestoneElement: HTMLElement;

        component.weekWidth = currentWeekWidth;
        component.milestones = [milestoneFour, milestoneFive];
        component.expandedWeeks = [];
        changeDetectorRef.detectChanges();

        milestoneElement = getElement(getMilestoneSelector(milestoneFour.id));

        expect(extractNumberFromStyle(milestoneElement.style.maxWidth)).toBeCloseTo(expectedMaxWidth);
    });

    it('should mark slot as enable for drag when milestone can be moved', () => {
        let milestoneSlot: MilestoneSlot;

        spyOn(component, 'canMoveMilestone').and.callFake((milestoneId) => true);

        component.milestones = [milestoneFour];
        milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);

        expect(milestoneSlot.dragDisabled).toBeFalsy();
    });

    it('should mark slot as disable for drag when milestone can not be moved', () => {
        let milestoneSlot: MilestoneSlot;

        spyOn(component, 'canMoveMilestone').and.callFake((milestoneId) => false);

        component.milestones = [milestoneFour];
        milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);

        expect(milestoneSlot.dragDisabled).toBeTruthy();
    });

    it('should add ss-milestone-slots--dragging class while dragging milestone', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, 0],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: ['header', 0]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        component.handleDragStart(cdkDragStart);
        changeDetectorRef.detectChanges();

        expect(getElement(milestoneSlotsSelector).classList).toContain(classIsDragging);

        component.handleDrop(cdkDragDrop);
        changeDetectorRef.detectChanges();

        expect(getElement(milestoneSlotsSelector).classList).not.toContain(classIsDragging);
    });

    it('should add class to body to style cursor while dragging milestone', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, 0],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: ['header', 0]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        component.handleDragStart(cdkDragStart);
        changeDetectorRef.detectChanges();

        expect(document.body.classList).toContain(CursorClassEnum.Grabbing);

        component.handleDrop(cdkDragDrop);
        changeDetectorRef.detectChanges();

        expect(document.body.classList).not.toContain(CursorClassEnum.Grabbing);
    });

    it('should not emit moveMilestone when milestone is dropped but the drag was canceled', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, 0],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: ['header', 0]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        spyOn(component.moveMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);
        milestoneDragHelper.cancelDrag();
        component.handleDrop(cdkDragDrop);

        expect(component.moveMilestone.emit).not.toHaveBeenCalled();
    });

    it('should not emit moveMilestone when milestone is dropped in the same container', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const shiftAmount = milestoneFour.date.clone().diff(timeScope.start, 'd');
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, shiftAmount],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [rowId, shiftAmount]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        spyOn(component.moveMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);
        component.handleDrop(cdkDragDrop);

        expect(component.moveMilestone.emit).not.toHaveBeenCalled();
    });

    it('should emit moveMilestone when milestone is dropped in the same day but in a different row', () => {
        const {id, date} = milestoneFour;
        const milestoneSlot = getMilestoneSlotsByMilestoneId(id);
        const shiftAmount = date.clone().diff(timeScope.start, 'd');
        const newDate = timeScope.start.clone().add(shiftAmount, 'd');
        const newRowId: RowId = 'header';
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, shiftAmount],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [newRowId, shiftAmount]},
            previousContainer: {element: containerElement},
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;
        const expectedPayload: MoveMilestonePayload = {
            id,
            date: newDate,
            rowId: newRowId,
            position: 0,
        };

        spyOn(component.moveMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);
        component.handleDrop(cdkDragDrop);

        expect(component.moveMilestone.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit moveMilestone when milestone is dropped in the same row but in a different day', () => {
        const {id, date} = milestoneFour;
        const milestoneSlot = getMilestoneSlotsByMilestoneId(id);
        const shiftAmount = date.clone().diff(timeScope.start, 'd') + 1;
        const newDate = timeScope.start.clone().add(shiftAmount, 'd');
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, shiftAmount - 1],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [rowId, shiftAmount]},
            previousContainer: {element: containerElement},
            previousIndex: 0,
            currentIndex: 0,
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;
        const expectedPayload: MoveMilestonePayload = {
            id,
            date: newDate,
            rowId,
            position: 0,
        };

        spyOn(component.moveMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);
        component.handleDrop(cdkDragDrop);

        expect(component.moveMilestone.emit).toHaveBeenCalledWith(expectedPayload);

    });

    it('should emit moveMilestone when milestone is sorted', () => {
        const {id, date} = milestoneFour;
        const milestoneSlot = getMilestoneSlotsByMilestoneId(id);
        const shiftAmount = date.clone().diff(timeScope.start, 'd');
        const newDate = timeScope.start.clone().add(shiftAmount, 'd');
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, shiftAmount],
                },
            }
        } as CdkDragStart;
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [rowId, shiftAmount]},
            previousContainer: {element: containerElement},
            previousIndex: 0,
            currentIndex: 1,
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;
        const expectedPayload: MoveMilestonePayload = {
            id,
            date: newDate,
            rowId,
            position: 1,
        };

        spyOn(component.moveMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);
        component.handleDrop(cdkDragDrop);

        expect(component.moveMilestone.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should allow a milestone slot to enter a container', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const cdkDrag = {
            data: milestoneSlot,
        } as CdkDrag;

        expect(component.canEnterContainer(cdkDrag)).toBeTruthy();
    });

    it('should not allow a non milestone slot to enter a container', () => {
        const cdkDrag = {
            data: {isNotMilestoneSlot: true},
        } as CdkDrag;

        expect(component.canEnterContainer(cdkDrag)).toBeFalsy();
    });

    it('should emit dragMilestone when milestone drag start', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, 0],
                },
            }
        } as CdkDragStart;

        spyOn(component.draggingMilestone, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);

        expect(component.draggingMilestone.emit).toHaveBeenCalledWith(containerElement);
    });

    it('should emit dragMilestone when milestone drag end', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);

        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [rowId, 0]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        spyOn(component.draggingMilestone, 'emit').and.callThrough();

        component.handleDrop(cdkDragDrop);

        expect(component.draggingMilestone.emit).toHaveBeenCalledWith(containerElement);
    });

    it('should emit draggingDay with the dragging date when milestone enter a container', () => {
        const dayPosition = 3;
        const cdkDragEnter = {
            container: {data: [rowId, dayPosition]},
        } as CdkDragEnter<DaySlotId, MilestoneSlot>;
        const expectedPayload = timeScope.start.clone().add(dayPosition, 'd');

        spyOn(component.draggingDay, 'emit').and.callThrough();

        component.handleEnterContainer(cdkDragEnter);

        expect(component.draggingDay.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should emit draggingDay with null when milestone drag end', () => {
        const milestoneSlot = getMilestoneSlotsByMilestoneId(milestoneFour.id);
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragDrop = {
            item: {data: milestoneSlot},
            container: {data: [rowId, 0]},
            previousContainer: {element: containerElement},
        } as CdkDragDrop<DaySlotId, MilestoneSlot>;

        spyOn(component.draggingDay, 'emit').and.callThrough();

        component.handleDrop(cdkDragDrop);

        expect(component.draggingDay.emit).toHaveBeenCalledWith(null);
    });

    it('should emit draggingDay with the dragging date when milestone drag starts', () => {
        const {id, date} = milestoneFour;
        const milestoneSlot = getMilestoneSlotsByMilestoneId(id);
        const shiftAmount = date.clone().diff(timeScope.start, 'd');
        const containerElement = getDropContainer(milestoneFour);
        const cdkDragStart = {
            source: {
                data: milestoneSlot,
                dropContainer: {
                    element: containerElement,
                    data: [rowId, shiftAmount],
                },
            }
        } as CdkDragStart;
        const expectedPayload = timeScope.start.clone().add(shiftAmount, 'd');

        spyOn(component.draggingDay, 'emit').and.callThrough();

        component.handleDragStart(cdkDragStart);

        expect(component.draggingDay.emit).toHaveBeenCalledWith(expectedPayload);
    });

    it('should force change detection after drag starts to aid CDK to update the drop containers', (done) => {
        spyOn(changeDetectorRef.constructor.prototype, 'detectChanges').and.callThrough();

        milestoneDragHelper.onDragStarted().subscribe(() => {
            expect(changeDetectorRef.detectChanges).toHaveBeenCalled();
            done();
        });

        milestoneDragHelper.startDrag(milestoneOne);
    });

    it('should emit isDraggingMilestone with TRUE on Milestone Drag Helper onDragStarted', ((done) => {
        spyOn(component.isDraggingMilestone, 'emit').and.callThrough();

        milestoneDragHelper.onDragStarted().subscribe(() => {
            expect(component.isDraggingMilestone.emit).toHaveBeenCalledWith(true);
            done();
        });

        milestoneDragHelper.startDrag(milestoneOne);
    }));

    it('should emit isDraggingMilestone with FALSE on Milestone Drag Helper onDragEnded', ((done) => {
        spyOn(component.isDraggingMilestone, 'emit').and.callThrough();

        milestoneDragHelper.onDragEnded().subscribe(() => {
            expect(component.isDraggingMilestone.emit).toHaveBeenCalledWith(false);
            done();
        });

        milestoneDragHelper.endDrag();
    }));
});
