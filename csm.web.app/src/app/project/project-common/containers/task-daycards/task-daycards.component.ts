/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    CdkDropList,
    DragStartDelay
} from '@angular/cdk/drag-drop';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    Renderer2,
    SimpleChanges,
    ViewChildren
} from '@angular/core';
import {Store} from '@ngrx/store';
import {
    chunk,
    difference,
    first,
    range
} from 'lodash';
import * as moment from 'moment';
import {Subscription} from 'rxjs';
import {
    distinctUntilChanged,
    map,
} from 'rxjs/operators';

import {CursorClassEnum} from '../../../../shared/misc/enums/cursor-class.enum';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {
    KeyboardHelper,
    KeyboardShortcutEnum
} from '../../../../shared/misc/helpers/keyboard.helper';
import {CALENDAR_CONSTANTS} from '../../../../shared/ui/calendar/contants/calendar.contants';
import {COLORS} from '../../../../shared/ui/constants/colors.constant';
import {DateParserStrategy} from '../../../../shared/ui/dates/date-parser.strategy';
import {FlyoutModel} from '../../../../shared/ui/flyout/directive/flyout.directive';
import {FlyoutService} from '../../../../shared/ui/flyout/service/flyout.service';
import {IconModel} from '../../../../shared/ui/icons/icon.component';
import {DayCardDetailComponent} from '../../../project-children/project-tasks/containers/day-card-detail/day-card-detail.component';
import {
    WorkDaysHoliday,
    WorkDaysResource
} from '../../api/work-days/resources/work-days.resource';
import {
    DAY_CARD_STATUS_EMPTY,
    DAY_CARD_STATUS_UNAVAILABLE
} from '../../constants/day-card-indicators-icon.constant';
import {TaskCalendarTaskViewModeEnum} from '../../enums/task-calendar-task-view-mode.enum';
import {CalendarSelectionHelper} from '../../helpers/calendar-selection.helper';
import {DayCardDragHelper} from '../../helpers/day-card-drag.helper';
import {DayCardFocusSelectHelper} from '../../helpers/day-card-focus-helper.service';
import {WorkingDaysHelper} from '../../helpers/working-days.helper';
import {DayCard} from '../../models/day-cards/day-card';
import {CalendarSelectionActions} from '../../store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../store/calendar/calendar-selection/calendar-selection.queries';
import {TaskCardWeekModel} from '../task-card-week/task-card-week.model.helper';

export const NUMBER_OF_DAYS_PER_WEEK = 7;
export const CSS_CLASS_SLOT_OUT_OF_SCOPE = 'ss-task-daycards__daycard--out-of-scope';
export const CSS_CLASS_SLOT_CAN_CREATE = 'ss-task-daycards__daycard--can-create';
export const CSS_CLASS_SLOT_CANT_CREATE = 'ss-task-daycards__daycard--cant-create';
export const CSS_CLASS_SLOT_IS_SELECTED = 'ss-task-daycards__daycard--is-selected';
export const CSS_CLASS_SLOT_IS_NON_WORKING_DAY = 'ss-task-daycards__daycard--is-non-working-day';

const DAYCARD_DRAG_START_DELAY_TOUCH = 100;

export class DayCardMove {
    public item: DayCard;
    public currentDate: moment.Moment;

    constructor(item: DayCard,
                currentDate: moment.Moment,
    ) {
        this.item = item;
        this.currentDate = currentDate;
    }
}

interface Week {
    expanded: boolean;
    slots: DayCardSlot[];
    styles: Object;
}

class DayCardSlot {
    public canCreate: boolean;
    public canDrag: boolean;
    public classes: Object;
    public createButtonIconColor: string;
    public date: moment.Moment;
    public dayCard?: DayCard;
    public flyoutProperties?: Object;
    public holiday: WorkDaysHoliday | undefined;
    public id?: string;
    public isAllowedToWorkOnNonWorkingDays: boolean;
    public isDragging: boolean;
    public isLocked: boolean;
    public isLockedAndEmpty: boolean;
    public isLockedAndHasDayCard: boolean;
    public isNonWorkingDay: boolean;
    public isSelected: boolean;
    public outOfScope: boolean;
    public showCreateButton: boolean;
    public status: string;

    constructor(canCreate: boolean, outOfScope: boolean, date: moment.Moment, workDays: WorkDaysResource, isDragging = false) {
        const {workingDays, allowWorkOnNonWorkingDays, holidays} = workDays;

        this.canCreate = canCreate;
        this.outOfScope = outOfScope;
        this.date = date.clone();
        this.isAllowedToWorkOnNonWorkingDays = allowWorkOnNonWorkingDays;
        this.isDragging = isDragging;

        this.holiday = WorkingDaysHelper.getHoliday(this.date, holidays);
        this.isNonWorkingDay = !WorkingDaysHelper.isDayAWorkingDay(this.date, workingDays) || !!this.holiday;

        this.createButtonIconColor = this.isNonWorkingDay ? COLORS.dark_grey : COLORS.dark_grey_75;

        this.status = this._getSlotStatus();
        this.classes = this._getSlotClasses();
    }

    public fillWith(dayCard: DayCard, canDrag: boolean, canEdit: boolean): DayCardSlot {
        this.dayCard = dayCard;
        this.id = dayCard ? dayCard.id : null;
        this.status = dayCard ? dayCard.status : this._getSlotStatus();
        this.canDrag = canDrag;
        this.flyoutProperties = {
            dayCard,
            canEditTaskSchedule: canEdit,
        };

        this.isLocked = this._isLocked();
        this.isLockedAndEmpty = this.isLocked && !this.dayCard;
        this.isLockedAndHasDayCard = this.isLocked && !!this.dayCard;
        this.showCreateButton = this._canShowCreateButton();
        this.classes = this._getSlotClasses();

        return this;
    }

    public setSelected(isSelected: boolean): void {
        this.isSelected = isSelected;
        this.classes = this._getSlotClasses();
    }

    private _canShowCreateButton(): boolean {
        return !this.dayCard && !this.outOfScope && !this.isLocked;
    }

    private _isLocked(): boolean {
        return !this.outOfScope && this.isNonWorkingDay && !this.isAllowedToWorkOnNonWorkingDays;
    }

    private _getSlotStatus(): string {
        return this.outOfScope ? DAY_CARD_STATUS_UNAVAILABLE : DAY_CARD_STATUS_EMPTY;
    }

    private _getSlotClasses(): Object {
        return {
            [CSS_CLASS_SLOT_OUT_OF_SCOPE]: this.outOfScope,
            [CSS_CLASS_SLOT_CAN_CREATE]: !this.outOfScope && this.dayCard == null && this.canCreate,
            [CSS_CLASS_SLOT_CANT_CREATE]: !this.outOfScope && this.dayCard == null && !this.canCreate,
            [CSS_CLASS_SLOT_IS_SELECTED]: this.isSelected,
            [CSS_CLASS_SLOT_IS_NON_WORKING_DAY]: this.isNonWorkingDay,
        };
    }
}

@Component({
    selector: 'ss-task-daycards',
    templateUrl: './task-daycards.component.html',
    styleUrls: ['./task-daycards.component.scss'],
})
export class TaskDaycardsComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {

    @Input()
    public isLoading: boolean;

    @Input()
    public showIndicators: boolean;

    @Input()
    public set canCreate(canCreate: boolean) {
        this.isRelevant = canCreate;
        this._setCanMultiSelect();
        this._updateCanCreatePermission();
    }

    @Input()
    public canEdit: boolean;

    @Input()
    public cardTaskModel: TaskCardWeekModel;

    @Input()
    public dayCards: DayCard[];

    @Input()
    public expandedWeeks: moment.Moment[];

    @Input()
    public set focusedDaycardId(focusedDaycardId: string) {
        this._focusedDaycardId = focusedDaycardId;

        if (!this._focusedDaycardId || this._dayCardFlyoutsInitialized[this._focusedDaycardId]) {
            this._handleDayCardFocus();
        }

    }

    @Input()
    public taskViewMode: TaskCalendarTaskViewModeEnum = TaskCalendarTaskViewModeEnum.Week;

    @Input()
    public weekWidth: number;

    @Input()
    public workDays: WorkDaysResource;

    @Output()
    public createDayCard: EventEmitter<moment.Moment> = new EventEmitter<moment.Moment>();

    @Output()
    public copyDayCard: EventEmitter<DayCardMove> = new EventEmitter<DayCardMove>();

    @Output()
    public moveDayCard: EventEmitter<DayCardMove> = new EventEmitter<DayCardMove>();

    public canCreatePermission: boolean;

    public canMultiSelect: boolean;

    public connectedDropLists: string[] = [];

    public createButtonIconSettings: IconModel = {
        name: 'more-tiny',
        dimension: 'small',
    };

    public dayCardFlyout: FlyoutModel = {
        component: DayCardDetailComponent,
        properties: {},
        id: null,
        position: 'below',
        alignment: 'start',
        mobileDrawer: true,
        trigger: [],
    };

    public dayCardDragStartDelay: DragStartDelay = {mouse: 0, touch: DAYCARD_DRAG_START_DELAY_TOUCH};

    public hasSelectedItems = false;

    public isAdjacentSelecting = false;

    public isCherryPicking = false;

    public isCopying = false;

    public isDragging = false;

    public isRelevant: boolean;

    public isMultiSelecting = false;

    public isValidDrag = true;

    public weeks: Week[] = [];

    private _canSelectItemType: boolean;

    private _dayCardFlyoutsInitialized: { [key: string]: boolean } = {};

    private _disposableSubscriptions: Subscription = new Subscription();

    @ViewChildren(CdkDropList)
    private _dropListElements: QueryList<CdkDropList> = new QueryList<CdkDropList>();

    private _focusedDaycardId: string;

    private _openedDaycardId: string;

    private _localConnectedLists: string[] = [];

    private _previousSlots: DayCardSlot[] = [];

    private _selectedSlots: number[] = [];

    private _selectedDayCardIds: string[] = [];

    private _slots: DayCardSlot[] = [];

    private _slotDragTarget: { weekIndex: number; slotIndex: number };

    constructor(private _calendarSelectionQueries: CalendarSelectionQueries,
                private _calendarSelectionHelper: CalendarSelectionHelper,
                private _changeDetectorRef: ChangeDetectorRef,
                private _dateParser: DateParserStrategy,
                private _dayCardDragHelper: DayCardDragHelper,
                private _dayCardFocusSelectHelper: DayCardFocusSelectHelper,
                private _flyoutService: FlyoutService,
                private _keyboardHelper: KeyboardHelper,
                private _renderer: Renderer2,
                private _store: Store) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.cardTaskModel || changes.dayCards || changes.workDays) {
            this._createSlots();
        }

        if (changes.expandedWeeks || changes.weekWidth) {
            this._renderWeeks();
        }
    }

    ngAfterViewInit() {
        this._setConnectedDropLists();
    }

    ngOnDestroy() {
        this._unsetConnectedDropLists();
        this._unsetSubscriptions();
    }

    public trackBySlot(index: number, item: DayCardSlot): string {
        return item.date.toISOString();
    }

    public trackByWeek(index: number, item: Week): string {
        return item.slots[0].date.toISOString();
    }

    public handleCreateDayCard(event: Event, cardSlotDate: moment.Moment): void {
        this.createDayCard.emit(cardSlotDate.clone());
    }

    public enterSlotPredicateFn(weekIndex: number, slotIndex: number): () => boolean {
        const slot = this._getSlotFromIndexes(weekIndex, slotIndex);
        const isValidDragTarget = this._isValidDragTarget();
        return () => !slot?.outOfScope && isValidDragTarget;
    }

    public flyoutInitialized(flyoutId: string): void {
        this._dayCardFlyoutsInitialized[flyoutId] = true;

        if (this._focusedDaycardId === flyoutId) {
            this._handleDayCardFocus();
        }
    }

    public handleDayCardClick(slot: DayCardSlot): void {
        if (this.isAdjacentSelecting) {
            if (this._openedDaycardId) {
                this._closeDaycardFlyout();
            }
            this._handleAdjacentSelectDayCard(slot);
        } else if (this.isCherryPicking) {
            if (this._openedDaycardId) {
                this._closeDaycardFlyout();
            }
            this._handleCherryPickDayCard(slot);
        } else {
            this._focusedDaycardId = slot.dayCard.id;
            this._handleDayCardFocus();
        }
    }

    public handleDragStart(weekIndex: number, slotIndex: number): void {
        const slot = this._getSlotFromIndexes(weekIndex, slotIndex);
        slot.isDragging = true;

        this._dayCardDragHelper.startDrag(slot.dayCard);
        this._dayCardFocusSelectHelper.closeFocusedDayCard();
        this.handleEnter(weekIndex, slotIndex);
        this._setCursorStyle();
    }

    public handleEnter(weekIndex: number, slotIndex: number): void {
        this._restoreSlotsState();

        this._slotDragTarget = {weekIndex, slotIndex};

        const index = (weekIndex * NUMBER_OF_DAYS_PER_WEEK) + slotIndex;
        const slot = this._slots[index];
        const sameOriginDayCard = this._isSlotDayCardSameHasDraggingDayCard(slot);
        const copyingToSameOrigin = sameOriginDayCard && this.isCopying;
        const movingToALockedSlot = !sameOriginDayCard && slot.isLocked;
        const movingToValidDayCardSlot = slot.dayCard && !sameOriginDayCard;

        let isValidDrag = true;

        if (copyingToSameOrigin || movingToALockedSlot) {
            isValidDrag = false;
        } else if (movingToValidDayCardSlot) {
            isValidDrag = this._moveDayCardToSlot(index + 1, slot.dayCard);

            if (isValidDrag) {
                slot.fillWith(null, true, this.canEdit);
            }
        }

        this._dayCardDragHelper.setDraggingValidity(isValidDrag);
        this._renderWeeks();
    }

    public handleExit(): void {
        this._restoreSlotsState();
        this._renderWeeks();
        this._slotDragTarget = null;
    }

    public handleDrop(weekIndex: number, slotIndex: number): void {
        const slot = this._getSlotFromIndexes(weekIndex, slotIndex);

        if (!this._dayCardDragHelper.isDragCanceled() && !slot.isDragging && this.isValidDrag) {
            const dayCardBeingDragged = this._dayCardDragHelper.getRecordBeingDragged();
            const movePayload = new DayCardMove(dayCardBeingDragged, slot.date.clone());

            if (this.isCopying) {
                this.copyDayCard.emit(movePayload);
            } else {
                this.moveDayCard.emit(movePayload);
            }
        }

        this._dayCardDragHelper.endDrag();
    }

    private _getSlotFromIndexes(weekIndex: number, slotIndex: number): DayCardSlot {
        const index = (weekIndex * NUMBER_OF_DAYS_PER_WEEK) + slotIndex;
        return this._slots[index];
    }

    private _getSlotFromDayCardId(dayCardId: string): DayCardSlot {
        return this._slots.find(slot => slot.id === dayCardId);
    }

    private _getSlotIndex(slot: DayCardSlot): number {
        return this._slots.indexOf(slot);
    }

    private _moveDayCardToSlot(index: number, daycard: DayCard): boolean {
        const slot = this._slots[index];
        let isValid: boolean;

        if (!this._canBeMoved(daycard) || this._isSlotOutOfScope(slot)) {
            isValid = false;
        } else if (this._isSlotAvailable(slot)) {
            isValid = true;
        } else if (slot?.isLocked) {
            const isValidPreShift = slot.isLockedAndHasDayCard ? this._moveDayCardToSlot(index + 1, slot.dayCard) : true;

            isValid = isValidPreShift && this._moveDayCardToSlot(index + 1, daycard);
        } else {
            isValid = this._moveDayCardToSlot(index + 1, slot.dayCard);
        }

        if (isValid && !slot?.isLocked) {
            slot.fillWith(daycard, true, this.canEdit);
        } else if (isValid && !!slot?.isLockedAndHasDayCard && !this._isSlotDayCardSameHasDraggingDayCard(slot)) {
            slot.fillWith(null, false, false);
        }

        return isValid;
    }

    private _isDayCardSelected(dayCard: DayCard): boolean {
        return dayCard && (dayCard.id === this._openedDaycardId || this._selectedDayCardIds.includes(dayCard.id));
    }

    private _isSlotOutOfScope(slot: DayCardSlot): boolean {
        return slot == null || slot.outOfScope;
    }

    private _isSlotAvailable(slot: DayCardSlot): boolean {
        const hasNoDayCard = !slot.dayCard;
        const isSameSlotAndNotCopying = this._isSlotDayCardSameHasDraggingDayCard(slot) && !this.isCopying;

        return (hasNoDayCard || isSameSlotAndNotCopying) && !slot.isLocked;
    }

    private _isSlotDayCardSameHasDraggingDayCard(slot: DayCardSlot): boolean {
        return this._dayCardDragHelper.getRecordBeingDragged() === slot?.dayCard;
    }

    private _saveCurrentSlotsState(): void {
        this._previousSlots = this._slots.map(slot => this._cloneSlot(slot));
    }

    private _restoreSlotsState(): void {
        this._slots = this._previousSlots.map(slot => this._cloneSlot(slot));
    }

    private _cloneSlot(slot: DayCardSlot) {
        return new DayCardSlot(this.isRelevant, slot.outOfScope, slot.date.clone(), this.workDays, slot.isDragging)
            .fillWith(slot.dayCard, this._canDrag(slot.dayCard), this.canEdit);
    }

    private _createSlots(): void {
        if (this.cardTaskModel == null) {
            this._slots = [];
            this.weeks = [];

            return;
        }

        this._slots = this._getDayCardSlots()
            .map(slot => {
                const dayCard = this._getDayCardOfDate(slot.date);

                slot.setSelected(this._isDayCardSelected(dayCard));
                return slot.fillWith(dayCard, this._canDrag(dayCard), this.canEdit);
            });

        this._renderWeeks();
    }

    private _renderWeeks(): void {
        const {end, cardStart, cardEnd} = this.cardTaskModel;
        const firstSlotDate = moment.max(cardStart, first(this._slots).date);
        const firstWeekSlotsNumber = NUMBER_OF_DAYS_PER_WEEK - firstSlotDate.diff(this._dateParser.startOfWeek(firstSlotDate), 'd');
        const slotsByWeek: DayCardSlot[][] = [
            this._slots.slice(0, firstWeekSlotsNumber),
            ...chunk(this._slots.slice(firstWeekSlotsNumber), NUMBER_OF_DAYS_PER_WEEK),
        ];
        const lastWeekIndex = slotsByWeek.length - this._dateParser.endOfWeek(end).diff(cardEnd, 'w');

        this.weeks = slotsByWeek.slice(0, lastWeekIndex)
            .map((slots, index) => {
                const week = cardStart.clone().add(index, 'w');
                const expanded = this._isWeekExpanded(week);
                const styles = this._getWeekStyle(expanded, slots);

                return {
                    expanded,
                    slots,
                    styles,
                };
            });

        this._changeDetectorRef.detectChanges();
    }

    private _getDayCardOfDate(date: moment.Moment): DayCard {
        return this.dayCards.find(dayCardResource => date.isSame(dayCardResource.date, 'd'));
    }

    private _getWeekStyle(isExpanded: boolean, slots: DayCardSlot[]): Object {
        const {expandedWeekWidth, weekSpacer} = CALENDAR_CONSTANTS;
        const weekWidth = isExpanded ? expandedWeekWidth : this.weekWidth;
        const computedWeekWidth = (weekWidth / NUMBER_OF_DAYS_PER_WEEK) * slots.length;

        return {
            'min-width': `${computedWeekWidth + weekSpacer}px`,
        };
    }

    private _isWeekExpanded(week: moment.Moment): boolean {
        return this.expandedWeeks.some(expandedWeek => this._dateParser.isSame(expandedWeek, week, 'w'));
    }

    private _canDrag(daycard: DayCard): boolean {
        return daycard && (daycard.permissions.canUpdate || (this.isCopying && this.isRelevant));
    }

    private _canBeMoved(daycard: DayCard): boolean {
        return daycard && daycard.permissions.canUpdate;
    }

    private _getDayCardSlots(): DayCardSlot[] {
        const {cardStart, start, end} = this.cardTaskModel;

        const firstDayOfFirstWeek = this.taskViewMode === TaskCalendarTaskViewModeEnum.Week ? cardStart : moment.max(start, cardStart);
        const lastDayOfLastWeek = this.taskViewMode === TaskCalendarTaskViewModeEnum.Week ? this._dateParser.endOfWeek(end) : end;
        const slotSize = lastDayOfLastWeek.diff(firstDayOfFirstWeek, 'days') + 1;

        const firstDayOfTaskIndex = moment.max(firstDayOfFirstWeek, start).diff(firstDayOfFirstWeek, 'd');
        const lastDayOfTaskIndex = end.diff(firstDayOfFirstWeek, 'd');

        return new Array(slotSize)
            .fill(true)
            .fill(false, firstDayOfTaskIndex, lastDayOfTaskIndex + 1)
            .map((outOfScope, index) =>
                new DayCardSlot(this.isRelevant, outOfScope, firstDayOfFirstWeek.clone().add(index, 'd'), this.workDays));

    }

    private _handleDayCardFocus(): void {
        if (!!this._openedDaycardId && this._focusedDaycardId !== this._openedDaycardId) {
            this._dayCardFocusSelectHelper.closeFocusedDayCard();
        }

        if (!!this._focusedDaycardId && this._focusedDaycardId !== this._openedDaycardId) {
            this._openDaycardFlyout();
        }
    }

    private _closeDaycardFlyout(): void {
        const slot = this._getSlotFromDayCardId(this._openedDaycardId);

        if (slot) {
            slot.setSelected(false);
        }
        this._flyoutService.close(this._openedDaycardId);
        this._openedDaycardId = null;
    }

    private _openDaycardFlyout(): void {
        const slot = this._getSlotFromDayCardId(this._focusedDaycardId);

        this._resetCalendarSelection();
        slot.setSelected(true);
        this._dayCardFocusSelectHelper.newCardFocus(this._focusedDaycardId);
        this._flyoutService.open(this._focusedDaycardId);
        this._openedDaycardId = this._focusedDaycardId;
    }

    private _setCanMultiSelect(): void {
        this.canMultiSelect = this.isRelevant && this._canSelectItemType;
    }

    private _setConnectedDropLists(): void {
        this._disposableSubscriptions.add(
            this._dropListElements.changes.subscribe(dropLists => {
                const dropListsIds = Array.from(dropLists).map((dropList: CdkDropList) => dropList.id);
                const disconnectedDropListIds = difference(this._localConnectedLists, dropListsIds);

                this._localConnectedLists = dropListsIds;
                this._dayCardDragHelper.disconnectDropLists(disconnectedDropListIds);
                this._dayCardDragHelper.connectDropLists(dropListsIds);
            })
        );
        this._dropListElements.notifyOnChanges();
    }

    private _setSelectedSlots(): void {
        this._selectedSlots = this._slots.reduce((indexes, {isSelected}, index) => isSelected ? indexes.concat([index]) : indexes, []);
    }

    private _unsetConnectedDropLists(): void {
        this._dayCardDragHelper.disconnectDropLists(this._localConnectedLists);
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._keyboardHelper.getShortcutPressedState(KeyboardShortcutEnum.Copy)
                .subscribe((status) => this._updateCopyingStatus(status))
        );

        this._disposableSubscriptions.add(
            this._keyboardHelper.getShortcutPressedState(KeyboardShortcutEnum.AdjacentSelect)
                .subscribe((status) => this._updateAdjacentSelectingStatus(status))
        );

        this._disposableSubscriptions.add(
            this._dayCardDragHelper.onConnectedDropListsChange()
                .subscribe(connectedDropLists => this._handleConnectedDropListsChange(connectedDropLists))
        );

        this._disposableSubscriptions.add(
            this._dayCardDragHelper.onDragStarted()
                .subscribe(() => this._handleDragStart())
        );

        this._disposableSubscriptions.add(
            this._dayCardDragHelper.onDragEnded()
                .subscribe(() => this._handleDragEnd())
        );

        this._disposableSubscriptions.add(
            this._dayCardDragHelper.onDragValidityChange()
                .subscribe((isValidDrag) => this._handleDragValidityChange(isValidDrag))
        );

        this._disposableSubscriptions.add(this._dayCardFocusSelectHelper.onDayCardFocused()
            .subscribe(dayCardId => {
                if (!!this._openedDaycardId && this._openedDaycardId !== dayCardId) {
                    this._closeDaycardFlyout();
                }
            })
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionSlice()
                .pipe(
                    map(({isMultiSelecting, context}) => isMultiSelecting && context == null)
                )
                .subscribe(isCherryPicking => this._updateCherryPickingStatus(isCherryPicking))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionHelper.observeCanSelectItemType(ObjectTypeEnum.DayCard)
                .subscribe(canSelectItemType => {
                    this._canSelectItemType = canSelectItemType;
                    this._setCanMultiSelect();
                }),
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItems()
                .pipe(
                    map(items => !!items.length),
                    distinctUntilChanged(),
                ).subscribe(hasSelectedItems => this.hasSelectedItems = hasSelectedItems)
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItemsIdsByType(ObjectTypeEnum.DayCard)
                .subscribe(ids => this._handleSelectedDayCardsChange(ids))
        );
    }

    private _handleAdjacentSelectDayCard(slot: DayCardSlot): void {
        if (this.canMultiSelect) {
            if (this._selectedSlots.length > 0) {
                const currentSelected = this._getSlotIndex(slot);
                const lastSelected = this._selectedSlots[this._selectedSlots.length - 1];
                const step = currentSelected > lastSelected ? 1 : -1;

                range(lastSelected, currentSelected + step, step).forEach(slotIndex => {
                    const currentSlot = this._slots[slotIndex];

                    if (currentSlot.dayCard && !currentSlot.isSelected) {
                        this._toggleSelectionItem(currentSlot.id);
                    }
                });
            } else {
                this._toggleSelectionItem(slot.id);
            }
        }
    }

    private _handleCherryPickDayCard(slot: DayCardSlot): void {
        if (this.canMultiSelect) {
            this._toggleSelectionItem(slot.id);
        }
    }

    private _handleConnectedDropListsChange(connectedDropLists: string[]): void {
        this.connectedDropLists = connectedDropLists;
        this._changeDetectorRef.detectChanges();
    }

    private _handleDragStart(): void {
        this.isDragging = true;
        this._saveCurrentSlotsState();
        this._updateCanCreatePermission();
    }

    private _handleDragEnd(): void {
        this._slotDragTarget = null;
        this.isDragging = false;
        this._restoreSlotsState();
        this._updateCanCreatePermission();
        this._resetDraggingSlotStates();
        this._renderWeeks();
        this._unsetCursorStyle();
    }

    private _handleDragValidityChange(isValidDrag: boolean): void {
        this.isValidDrag = isValidDrag;
    }

    private _handleSelectedDayCardsChange(ids: string[]): void {
        this._selectedDayCardIds = ids;

        this._refreshSlots();
        this._setSelectedSlots();
    }

    private _resetDraggingSlotStates(): void {
        this._slots.forEach(slot => slot.isDragging = false);
    }

    private _toggleSelectionItem(id: string): void {
        this._calendarSelectionHelper.toggleSelectionItem(id, ObjectTypeEnum.DayCard);
    }

    private _unsetSubscriptions() {
        this._disposableSubscriptions.unsubscribe();
    }

    private _updateAdjacentSelectingStatus(status: boolean): void {
        this.isAdjacentSelecting = status;
        this._updateIsMultiSelectingStatus();
    }

    private _updateCherryPickingStatus(status: boolean): void {
        this.isCherryPicking = status;
        this._updateIsMultiSelectingStatus();
    }

    private _updateCopyingStatus(status: boolean): void {
        this.isCopying = status;

        if (this.hasSelectedItems) {
            return;
        }

        this._setCursorStyle();

        if (this.isDragging && !!this._slotDragTarget) {
            const dayCardBeingDragged = this._dayCardDragHelper.getRecordBeingDragged();
            const canDrag = this._canDrag(dayCardBeingDragged);

            if (canDrag && this._isValidDragTarget()) {
                this.handleEnter(this._slotDragTarget.weekIndex, this._slotDragTarget.slotIndex);
            } else {
                this._dayCardDragHelper.cancelDrag();
            }
        }

        this._updateCanCreatePermission();
        this._refreshSlots();
    }

    private _updateIsMultiSelectingStatus(): void {
        this.isMultiSelecting = this.isCherryPicking || this.isAdjacentSelecting;
    }

    private _isValidDragTarget(): boolean {
        const originalTaskId = this._dayCardDragHelper.getRecordBeingDragged()?.task?.id || null;

        return this.cardTaskModel.id === originalTaskId || (this.isCopying && this.isRelevant);
    }

    private _refreshSlots(): void {
        this.weeks.forEach(week => {
            week.slots.forEach(slot => {
                slot.canCreate = this.isRelevant;
                slot.setSelected(this._isDayCardSelected(slot.dayCard));
                slot.fillWith(slot.dayCard, this._canDrag(slot.dayCard), this.canEdit);
            });
        });
    }

    private _resetCalendarSelection(): void {
        this._store.dispatch(new CalendarSelectionActions.Initialize.All());
    }

    private _updateCanCreatePermission(): void {
        this.canCreatePermission = (!this.isDragging && this.isRelevant) || (this.isDragging && this._isValidDragTarget());
    }

    private _unsetCursorStyle(): void {
        this._renderer.removeClass(document.body, CursorClassEnum.Grabbing);
        this._renderer.removeClass(document.body, CursorClassEnum.Copy);
    }

    private _setCursorStyle() {
        if (this.isDragging) {
            const cursorClass = this.isCopying ? CursorClassEnum.Copy : CursorClassEnum.Grabbing;
            this._unsetCursorStyle();
            this._renderer.addClass(document.body, cursorClass);
        }
    }
}
