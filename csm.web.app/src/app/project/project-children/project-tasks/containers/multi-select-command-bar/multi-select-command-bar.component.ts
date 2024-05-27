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
    OnDestroy,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    Action,
    Store
} from '@ngrx/store';
import * as moment from 'moment';
import {
    combineLatest,
    fromEvent,
    Subscription,
} from 'rxjs';
import {
    filter,
    switchMap
} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {KeyEnum} from '../../../../../shared/misc/enums/key.enum';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {ButtonStyle} from '../../../../../shared/ui/button/button.component';
import {COLORS} from '../../../../../shared/ui/constants/colors.constant';
import {FlyoutOpenTriggerEnum} from '../../../../../shared/ui/flyout/directive/flyout.directive';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {CalendarSelectionActionEnum} from '../../../../project-common/enums/calendar-selection-action.enum';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {CalendarSelectionHelper} from '../../../../project-common/helpers/calendar-selection.helper';
import {DayCard} from '../../../../project-common/models/day-cards/day-card';
import {Task} from '../../../../project-common/models/tasks/task';
import {CalendarScopeQueries} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.queries';
import {CalendarSelectionActions} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../../../../project-common/store/calendar/calendar-selection/calendar-selection.queries';
import {DayCardActions} from '../../../../project-common/store/day-cards/day-card.actions';
import {DayCardQueries} from '../../../../project-common/store/day-cards/day-card.queries';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';

export const MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID = 'delete-daycards';
export const MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID = 'delete-tasks';
export const MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID = 'open-task-status';
export const MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID = 'start-task-status';
export const MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID = 'close-task-status';
export const MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID = 'accept-task-status';
export const MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID = 'reset-task-status';

@Component({
    selector: 'ss-multi-select-command-bar',
    templateUrl: './multi-select-command-bar.component.html',
    styleUrls: ['./multi-select-command-bar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectCommandBarComponent implements OnInit, OnDestroy {

    @Input()
    public canDragTask: (taskId: string) => boolean = (): boolean => true;

    @Output()
    public closeToolbar: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('iconTaskStatusTemplate', {static: true})
    public iconTaskStatusTemplate: TemplateRef<HTMLElement>;

    @ViewChild('iconTemplate', {static: true})
    public iconTemplate: TemplateRef<HTMLElement>;

    public actions: CommandBarAction[] = [];

    public dropdownItems: MenuItemsList[] = [];

    public selectionItemsLength: number;

    public selectionItemsType: ObjectTypeEnum | null;

    public readonly dayCardObjectTypeEnum = ObjectTypeEnum.DayCard;

    public readonly flyoutTrigger = FlyoutOpenTriggerEnum.Hover;

    public readonly taskObjectTypeEnum = ObjectTypeEnum.Task;

    private _disposableSubscriptions = new Subscription();

    private _hasExpandedWeeks: boolean;

    private _iconColorDelete = COLORS.red;

    private _iconColorDeleteDisabled = COLORS.light_grey;

    private _iconColorReset = COLORS.black;

    private _selectionItemsIds: string[];

    private readonly _taskStatusActionsMap: { [id: string]: (selectedItems: string[]) => Action } = {
        [MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID]: selectedItems => new ProjectTaskActions.Send.All(selectedItems),
        [MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID]: selectedItems => new ProjectTaskActions.Start.All(selectedItems),
        [MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID]: selectedItems => new ProjectTaskActions.Close.All(selectedItems),
        [MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID]: selectedItems => new ProjectTaskActions.Accept.All(selectedItems),
        [MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID]: selectedItems => new ProjectTaskActions.Reset.All(selectedItems),
    };

    constructor(private _calendarScopeQueries: CalendarScopeQueries,
                private _calendarSelectionHelper: CalendarSelectionHelper,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _changeDetectorRef: ChangeDetectorRef,
                private _dayCardQueries: DayCardQueries,
                private _modalService: ModalService,
                private _projectTaskQueries: ProjectTaskQueries,
                private _store: Store<State>) {
    }

    ngOnInit(): void {
        this._setSubscriptions();
    }

    ngOnDestroy(): void {
        this._unsetSubscriptions();
    }

    public handleClose(): void {
        this.closeToolbar.emit();
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID:
                this._handleDayCardDelete();
                break;
            case MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID:
                this._handleTaskDelete();
                break;
            case MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID:
            case MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID:
            case MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID:
            case MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID:
            case MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID:
                this._store.dispatch(this._taskStatusActionsMap[id](this._selectionItemsIds));
                break;

        }
    }

    private _canCopyTasks(tasks: Task[]): boolean {
        return tasks.every(({id}) => this.canDragTask(id) && !this._hasExpandedWeeks);
    }

    private _canMoveTasks(tasks: Task[]): boolean {
        return tasks.every(({id, permissions: {canUpdate}}) => this.canDragTask(id) && !this._hasExpandedWeeks && canUpdate);
    }

    private _handleDayCardApprove(): void {
        this._store.dispatch(new DayCardActions.Approve.All(this._selectionItemsIds));
    }

    private _handleDayCardComplete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Daycard_UpdateMultiple_ConfirmTitle',
                description: 'Daycard_UpdateMultiple_ConfirmMessage',
                confirmCallback: () => this._store.dispatch(new DayCardActions.Complete.All(this._selectionItemsIds)),
                requestStatusObservable: this._dayCardQueries.observeCurrentDayCardRequestStatus(),
            },
        });
    }

    private _handleDayCardDelete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Daycard_DeleteMultiple_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new DayCardActions.Delete.All({
                    dayCardIds: this._selectionItemsIds,
                })),
                requestStatusObservable: this._dayCardQueries.observeCurrentDayCardRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _handleTaskDelete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Tasks_DeleteMultiple_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new ProjectTaskActions.Delete.All(this._selectionItemsIds)),
                requestStatusObservable: this._projectTaskQueries.observeCalendarRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _handleTaskSelectionOnActionClick(currentAction: CalendarSelectionActionEnum,
                                              clickedAction: CalendarSelectionActionEnum): void {
        const selection = currentAction === clickedAction ? null : clickedAction;

        this._store.dispatch(new CalendarSelectionActions.Set.SelectionAction(selection))
    }

    private _handleDayCardNotDone(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmMultipleDayCardStatusChangeWithReasons,
            data: {
                dayCardIds: this._selectionItemsIds,
            },
        });
    }

    private _handleDayCardSelectionItems(dayCards: DayCard[]): void {
        this._setActionsForDayCardSelection(dayCards);
        this._setDropdownItemsForDayCardSelection(dayCards);
        this._changeDetectorRef.detectChanges();
    }

    private _handleTaskSelectionItems(tasks: Task[]): void {
        this._setDropdownItemsForTaskSelection(tasks);
        this._changeDetectorRef.detectChanges();
    }

    private _handleSelectionItems(items: ObjectIdentifierPair[]): void {
        this.selectionItemsLength = items.length;
        this._selectionItemsIds = items.map(item => item.id);
        this._changeDetectorRef.detectChanges();
    }

    private _setActionsForDayCardSelection(dayCards: DayCard[]): void {
        if (!dayCards.length) {
            this.actions = [];
            return;
        }

        const canApproveOrResetDayCards = dayCards.some(({permissions: {canApprove, canReset}}) => canApprove || canReset);
        const canApproveDayCards = !dayCards.some(({permissions: {canApprove}}) => !canApprove);
        const canCompleteDayCards = !dayCards.some(({permissions: {canComplete}}) => !canComplete);

        const showApproveDayCards = canApproveOrResetDayCards;
        const showCompleteDayCards = !canApproveOrResetDayCards;

        const isApproveDayCardsDisabled = !canApproveDayCards;
        const isCompleteDayCardsDisabled = !canCompleteDayCards;
        const isNotDoneDayCardDisabled = dayCards.some(({permissions: {canCancel}}) => !canCancel);

        this.actions = [
            {
                buttonStyle: 'tertiary-light-green',
                dataAutomation: 'ss-multi-select-command-bar-approve-action',
                disabled: isApproveDayCardsDisabled,
                handleClick: () => this._handleDayCardApprove(),
                iconName: 'day-card-status-approved-filled',
                show: showApproveDayCards,
                tooltip: 'DayCardStatusEnum_Approved',
            },
            {
                buttonStyle: 'tertiary-light-green',
                dataAutomation: 'ss-multi-select-command-bar-complete-action',
                disabled: isCompleteDayCardsDisabled,
                handleClick: () => this._handleDayCardComplete(),
                iconName: 'day-card-status-done-frame',
                show: showCompleteDayCards,
                tooltip: 'DayCardStatusEnum_Done',
            },
            {
                buttonStyle: 'tertiary-red',
                dataAutomation: 'ss-multi-select-command-bar-notdone-action',
                disabled: isNotDoneDayCardDisabled,
                handleClick: () => this._handleDayCardNotDone(),
                iconName: 'day-card-status-notdone-frame',
                show: true,
                tooltip: 'DayCardStatusEnum_NotDone',
            },
        ];
    }

    private _setActionsForTaskSelection(tasks: Task[], action: CalendarSelectionActionEnum): void {
        const canCopyTasks = this._canCopyTasks(tasks);
        const canMoveTasks = this._canMoveTasks(tasks);

        if (!tasks.length) {
            this.actions = [];
            return;
        }

        this.actions = [
            {
                active: action === CalendarSelectionActionEnum.Move && canMoveTasks,
                buttonStyle: 'tertiary-black',
                dataAutomation: 'ss-multi-select-command-bar-move-tasks-action',
                disabled: !canMoveTasks,
                handleClick: () => this._handleTaskSelectionOnActionClick(action, CalendarSelectionActionEnum.Move),
                iconName: 'move-with-content',
                show: true,
                tooltip: 'Tasks_Move_Label',
            },
            {
                active: action === CalendarSelectionActionEnum.Copy && canCopyTasks,
                buttonStyle: 'tertiary-black',
                dataAutomation: 'ss-multi-select-command-bar-copy-tasks-action',
                disabled: !canCopyTasks,
                handleClick: () => this._handleTaskSelectionOnActionClick(action, CalendarSelectionActionEnum.Copy),
                iconName: 'copy-with-content',
                show: true,
                tooltip: 'Tasks_Copy_Label',
            },
        ];

        this._changeDetectorRef.detectChanges();
    }

    private _setDropdownItemsForDayCardSelection(dayCards: DayCard[]): void {
        if (!dayCards.length) {
            this.dropdownItems = [];
            return;
        }

        const hasDayCardsWithoutDeletePermission = dayCards.some(({permissions: {canDelete}}) => !canDelete);
        const deleteOptionGroup: MenuItem[] = [
            {
                id: MULTISELECT_COMMAND_BAR_DELETE_DAYCARDS_ID,
                label: 'Generic_Delete',
                type: 'button',
                customData: {
                    name: 'delete',
                    color: hasDayCardsWithoutDeletePermission ? this._iconColorDeleteDisabled : this._iconColorDelete,
                },
                disabled: hasDayCardsWithoutDeletePermission,
            },
        ];

        this.dropdownItems = [
            {
                items: deleteOptionGroup,
                customFigureTemplate: this.iconTemplate,
            },
        ];
    }

    private _setDropdownItemsForTaskSelection(tasks: Task[]): void {
        if (!tasks.length) {
            this.dropdownItems = [];
            return;
        }

        const hasTasksWithoutDeletePermission = tasks.some(({permissions: {canDelete}}) => !canDelete);
        const deleteOptionGroup: MenuItem[] = [
            {
                id: MULTISELECT_COMMAND_BAR_DELETE_TASKS_ID,
                label: 'Generic_Delete',
                type: 'button',
                customData: {
                    name: 'delete',
                    color: hasTasksWithoutDeletePermission ? this._iconColorDeleteDisabled : this._iconColorDelete,
                },
                disabled: hasTasksWithoutDeletePermission,
            },
        ];

        const updateTaskStatusOptionGroup: MenuItem[] = [];
        const hasTaskWithoutOpenPermission = tasks.some(({permissions: {canSend}}) => !canSend);
        const hasTaskWithoutStartPermission = tasks.some(({permissions: {canStart}}) => !canStart);
        const hasTaskWithoutClosePermission = tasks.some(({permissions: {canClose}}) => !canClose);
        const hasTaskWithoutAcceptPermission = tasks.some(({permissions: {canAccept}}) => !canAccept);
        const hasTaskWithoutResetPermission = tasks.some(({permissions: {canReset}}) => !canReset);

        if (!hasTaskWithoutOpenPermission) {
            updateTaskStatusOptionGroup.push({
                id: MULTISELECT_COMMAND_BAR_OPEN_TASK_STATUS_ID,
                label: 'TaskStatusEnum_OPEN',
                type: 'button',
                customData: TaskStatusEnum.OPEN,
            });
        }

        if (!hasTaskWithoutStartPermission) {
            updateTaskStatusOptionGroup.push({
                id: MULTISELECT_COMMAND_BAR_START_TASK_STATUS_ID,
                label: 'TaskStatusEnum_STARTED',
                type: 'button',
                customData: TaskStatusEnum.STARTED,
            });
        }

        if (!hasTaskWithoutClosePermission) {
            updateTaskStatusOptionGroup.push({
                id: MULTISELECT_COMMAND_BAR_CLOSE_TASK_STATUS_ID,
                label: 'TaskStatusEnum_CLOSED',
                type: 'button',
                customData: TaskStatusEnum.CLOSED,
            });
        }

        if (!hasTaskWithoutAcceptPermission) {
            updateTaskStatusOptionGroup.push({
                id: MULTISELECT_COMMAND_BAR_ACCEPT_TASK_STATUS_ID,
                label: 'TaskStatusEnum_ACCEPTED',
                type: 'button',
                customData: TaskStatusEnum.ACCEPTED,
            });
        }

        this.dropdownItems = !updateTaskStatusOptionGroup.length ? [] :
            [{
                items: updateTaskStatusOptionGroup,
                title: 'Tasks_TaskStatus_Title',
                separator: true,
                customFigureTemplate: this.iconTaskStatusTemplate,
            }];

        if (!hasTaskWithoutResetPermission) {
            const resetTaskStatusOptionGroup: MenuItem[] = [{
                id: MULTISELECT_COMMAND_BAR_RESET_TASK_STATUS_ID,
                label: 'Tasks_ResetStatus_Label',
                type: 'button',
                customData: {name: 'reset', color: this._iconColorReset},
            }];

            this.dropdownItems.push({
                items: resetTaskStatusOptionGroup,
                separator: true,
                customFigureTemplate: this.iconTemplate,
            });
        }

        this.dropdownItems.push({
            items: deleteOptionGroup,
            customFigureTemplate: this.iconTemplate,
        });
    }

    private _setHasExpandedWeeks(expandedWeeks: moment.Moment[]): void {
        this._hasExpandedWeeks = expandedWeeks.length > 0;
    }

    private _setSelectionItemsType(selectionItemsType: ObjectTypeEnum | null): void {
        this.selectionItemsType = selectionItemsType;
        this._changeDetectorRef.detectChanges();
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            fromEvent(window, 'keyup')
                .pipe(filter((event: KeyboardEvent) => event.key === KeyEnum.Escape))
                .subscribe(() => this.handleClose())
        );

        this._disposableSubscriptions.add(
            this._calendarScopeQueries.observeExpandedWeeks()
                .subscribe(expandedWeeks => this._setHasExpandedWeeks(expandedWeeks))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeCalendarSelectionItems()
                .subscribe((selectionItems) => this._handleSelectionItems(selectionItems))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionHelper.observeSelectionItemsType()
                .subscribe((selectionItemsType: ObjectTypeEnum) => this._setSelectionItemsType(selectionItemsType))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionHelper.observeSelectionItemsType()
                .pipe(
                    filter(selectionItemsType => selectionItemsType === ObjectTypeEnum.Task),
                    switchMap(() => combineLatest([
                        this._calendarSelectionQueries.observeTaskCalendarSelectionItems(),
                        this._calendarSelectionQueries.observeCalendarSelectionAction(),
                        this._calendarScopeQueries.observeExpandedWeeks(),
                    ]))
                )
                .subscribe(([tasks, action]) => {
                    this._setActionsForTaskSelection(tasks, action);
                    this._changeDetectorRef.detectChanges();
                })
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeDayCardSelectionItems()
                .subscribe((dayCards: DayCard[]) => this._handleDayCardSelectionItems(dayCards))
        );

        this._disposableSubscriptions.add(
            this._calendarSelectionQueries.observeTaskCalendarSelectionItems()
                .subscribe((tasks: Task[]) => this._handleTaskSelectionItems(tasks))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }
}

export interface CommandBarAction {
    active?: boolean;
    buttonStyle: ButtonStyle;
    dataAutomation: string;
    disabled: boolean;
    handleClick: () => void;
    iconName: string;
    show: boolean;
    tooltip: string;
}
