/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {Action} from '@ngrx/store';
import {
    chunk,
    flatten,
    groupBy,
    uniq
} from 'lodash';
import * as moment from 'moment';
import {
    combineLatest,
    Observable,
    of,
    zip
} from 'rxjs';
import {
    buffer,
    catchError,
    debounceTime,
    filter,
    first,
    map,
    mergeMap,
    switchMap,
    take,
    withLatestFrom
} from 'rxjs/operators';

import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {ObjectIdentifierPair} from '../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {AbstractIdsSaveResource} from '../../../../shared/misc/api/resources/abstract-ids-save.resource';
import {AbstractItemSaveResource} from '../../../../shared/misc/api/resources/abstract-item-save.resource';
import {AbstractItemsResource} from '../../../../shared/misc/api/resources/abstract-items.resource';
import {ObjectTypeEnum} from '../../../../shared/misc/enums/object-type.enum';
import {RealtimeService} from '../../../../shared/realtime/api/realtime.service';
import {RealtimeEventUpdateDataResource} from '../../../../shared/realtime/api/resources/realtime-event-update-data.resource';
import {EventTypeEnum} from '../../../../shared/realtime/enums/event-type.enum';
import {RealtimeQueries} from '../../../../shared/realtime/store/realtime.queries';
import {DayCardService} from '../../api/day-cards/day-card.service';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {SaveDeleteDayCardResource} from '../../api/day-cards/resources/save-delete-day-card.resource';
import {TaskScheduleService} from '../../api/task-schedueles/task-schedule.service';
import {SaveTaskScheduleResource} from '../../api/tasks/resources/save-task-schedule.resource';
import {SaveTaskScheduleSlotResource} from '../../api/tasks/resources/save-task-schedule-slot.resource';
import {
    TaskScheduleResource,
    TaskScheduleSlotResource
} from '../../api/tasks/resources/task-schedule.resource';
import {WorkDaysResource} from '../../api/work-days/resources/work-days.resource';
import {WorkingDaysHelper} from '../../helpers/working-days.helper';
import {DayCard} from '../../models/day-cards/day-card';
import {TaskSchedule} from '../../models/task-schedules/task-schedule';
import {CalendarSelectionActions} from '../calendar/calendar-selection/calendar-selection.actions';
import {CalendarSelectionQueries} from '../calendar/calendar-selection/calendar-selection.queries';
import {ProjectSliceService} from '../projects/project-slice.service';
import {WorkDaysQueries} from '../work-days/work-days.queries';
import {
    DayCardActionEnum,
    DayCardActions
} from './day-card.actions';
import {DayCardQueries} from './day-card.queries';

export const DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME = 1000;

const DAY_CARD_UPDATE_EVENTS: EventTypeEnum[] = [
    EventTypeEnum.Approved,
    EventTypeEnum.Cancelled,
    EventTypeEnum.Completed,
    EventTypeEnum.Reset,
    EventTypeEnum.Updated,
];

export const DAY_CARD_RESET_CALENDAR_SELECTION_ACTIONS: DayCardActionEnum[] = [
    DayCardActionEnum.ApproveAllDayCardFulfilled,
    DayCardActionEnum.CompleteAllDayCardFulfilled,
    DayCardActionEnum.CancelAllDayCardFulfilled,
    DayCardActionEnum.DeleteAllDayCardFulfilled,
];

@Injectable()
export class DayCardEffects {
    /**
     * @description Stream of events filtered for the current context
     * @description Since the backend does not offer a subscription mechanism, we receive all the events and we have to filter them
     */
    private _updateEventsForCurrentContext$: Observable<RealtimeEventUpdateDataResource> = this._realtimeService.getUpdateEvents()
        .pipe(
            withLatestFrom(this._realtimeQueries.observeContext()),
            filter(([data, context]) => context && data.root.isSame(context)),
            map(([data]) => data),
        );

    private _filteredDayCardUpdateEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.DayCard),
            filter((data: RealtimeEventUpdateDataResource) => DAY_CARD_UPDATE_EVENTS.includes(data.event)),
            mergeMap((data: RealtimeEventUpdateDataResource) => combineLatest([
                of(data),
                this._dayCardQueries.observeDayCardById(data.object.id),
            ]).pipe(first())),
            filter(([data, dayCard]) => dayCard && data.object.version > dayCard.version),
            map(([data]) => data));

    private _filteredDayCardDeleteEvents$: Observable<RealtimeEventUpdateDataResource> = this._updateEventsForCurrentContext$
        .pipe(
            filter((data: RealtimeEventUpdateDataResource) => data.object.type === ObjectTypeEnum.DayCard),
            filter((data: RealtimeEventUpdateDataResource) => data.event === EventTypeEnum.Deleted));

    constructor(private _actions$: Actions,
                private _calendarSelectionQueries: CalendarSelectionQueries,
                private _dayCardQueries: DayCardQueries,
                private _dayCardService: DayCardService,
                private _projectSliceService: ProjectSliceService,
                private _realtimeQueries: RealtimeQueries,
                private _realtimeService: RealtimeService,
                private _taskScheduleService: TaskScheduleService,
                private _workDaysQueries: WorkDaysQueries) {
    }

    public dayCardUpdateEvents$: Observable<Action> = createEffect(() => this._filteredDayCardUpdateEvents$
        .pipe(
            buffer(
                this._filteredDayCardUpdateEvents$.pipe(debounceTime(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME))
            ),
            map((data: RealtimeEventUpdateDataResource[]) => uniq(data.map(item => item.object.id))),
            switchMap((dayCardIds: string[]) => of(new DayCardActions.Request.All(dayCardIds)))));

    public dayCardDeleteEvents$: Observable<Action> = createEffect(() => this._filteredDayCardDeleteEvents$
        .pipe(
            buffer(this._filteredDayCardDeleteEvents$.pipe(debounceTime(DAY_CARD_UPDATE_EVENTS_DEBOUNCE_TIME))),
            map((data: RealtimeEventUpdateDataResource[]) => uniq(data.map(item => item.object.id))),
            map((deletedIds: string[]) => deletedIds.map(id => new ObjectIdentifierPair(ObjectTypeEnum.DayCard, id))),
            withLatestFrom(this._calendarSelectionQueries.observeCalendarSelectionItems()),
            map(([deletedItems, selectedItems]: [ObjectIdentifierPair[], ObjectIdentifierPair[]]) =>
                [selectedItems, selectedItems.filter(selectedItem => !deletedItems.some(deletedItem => deletedItem.isSame(selectedItem)))]
            ),
            filter(([oldSelectedItems, newSelectedItems]: [ObjectIdentifierPair[], ObjectIdentifierPair[]]) =>
                oldSelectedItems.length !== newSelectedItems.length),
            map(([, selectedItems]: [ObjectIdentifierPair[], ObjectIdentifierPair[]]) =>
                new CalendarSelectionActions.Set.Items(selectedItems)),
        ));

    public requestOneDayCard$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.RequestOneDayCard),
            switchMap((action: DayCardActions.Request.One) => {
                const dayCardId = action.payload;

                return this._dayCardService
                    .findOne(dayCardId)
                    .pipe(
                        map(dayCard => new DayCardActions.Request.OneFulfilled(dayCard)),
                        catchError(() => of(new DayCardActions.Request.OneRejected())));
            })));

    public requestAllDayCard$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.RequestAllDayCard),
            switchMap((action: DayCardActions.Request.All) => {
                const requests = chunk(action.payload, 100)
                    .map(dayCardsSet => new AbstractIdsSaveResource(dayCardsSet))
                    .map(dayCardsSet => this._dayCardService.findAll(dayCardsSet));

                return zip(...requests)
                    .pipe(
                        map((dayCardList: DayCardResource[][]) => flatten(dayCardList)),
                        map((dayCardList: DayCardResource[]) => new DayCardActions.Request.AllFulfilled(dayCardList)),
                        catchError(() => of(new DayCardActions.Request.AllRejected()))
                    );
            })));

    public requestAllDayCardsByTask$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.RequestAllDayCardsByTask),
            mergeMap((action: DayCardActions.Request.AllByTask) => {
                const taskId = action.payload;
                return this._taskScheduleService
                    .findOneByTaskId(taskId)
                    .pipe(
                        map((taskSchedule: TaskScheduleResource) => new DayCardActions.Request.AllByTaskFulfilled(taskSchedule)),
                        catchError(() => of(new DayCardActions.Request.AllByTaskRejected(taskId))));
            })));

    public requestAllDayCardsFromTasks$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.RequestAllDayCardsFromTasks),
            mergeMap((action: DayCardActions.Request.AllFromTasks) => {
                const requests = chunk(action.payload, 500)
                    .map((taskIds: string[]) => this._taskScheduleService.findAllFromTasks(taskIds));

                return zip(...requests)
                    .pipe(
                        map((taskSchedules: TaskScheduleResource[][]) => flatten(taskSchedules)),
                        map((taskSchedules: TaskScheduleResource[]) => new DayCardActions.Request.AllFromTasksFulfilled(taskSchedules)),
                        catchError(() => of(new DayCardActions.Request.AllFromTasksRejected(action.payload))),
                    );
            })));

    public approve$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.ApproveOneDayCard),
            mergeMap((action: DayCardActions.Approve.One) => this._combineDayCard<DayCardActions.Approve.One>(action, action.payload)),
            mergeMap(([action, currentDayCard]) => {
                const dayCardId = action.payload;
                const version = currentDayCard.version;

                return this._dayCardService
                    .approve(dayCardId, version)
                    .pipe(
                        map(dayCardResource => new DayCardActions.Approve.OneFulfilled(dayCardResource)),
                        catchError(() => of(new DayCardActions.Approve.OneRejected())));
            })));

    public approveAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.ApproveAllDayCard),
            mergeMap((action: DayCardActions.Approve.All) =>
                this._combineDayCardsSaveList<DayCardActions.Approve.All>(action, action.payload)),
            mergeMap(([action, dayCards]) => this._dayCardService.approveAll(dayCards)
                .pipe(
                    map((dayCardListResource: DayCardResource[]) => new DayCardActions.Approve.AllFulfilled(dayCardListResource)),
                    catchError(() => of(new DayCardActions.Approve.AllRejected(action.payload)))))));

    public cancel$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CancelOneDayCard),
            mergeMap((action: DayCardActions.Cancel.One) =>
                this._combineDayCard<DayCardActions.Cancel.One>(action, action.payload.dayCardId)),
            mergeMap(([action, currentDayCard]) => {
                const {dayCardId, reason} = action.payload;
                const version = currentDayCard.version;

                return this._dayCardService
                    .cancel(dayCardId, reason, version)
                    .pipe(
                        map(dayCardResource => new DayCardActions.Cancel.OneFulfilled(dayCardResource)),
                        catchError(() => of(new DayCardActions.Cancel.OneRejected())));
            })));

    public cancelAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CancelAllDayCard),
            mergeMap((action: DayCardActions.Cancel.All) =>
                this._combineDayCardsSaveList<DayCardActions.Cancel.All>(action, action.payload.dayCardIds)),
            mergeMap(([action, dayCards]) => {
                const reason = action.payload.reason;

                return this._dayCardService.cancelAll(dayCards, reason)
                    .pipe(
                        map((dayCardListResource: DayCardResource[]) => new DayCardActions.Cancel.AllFulfilled(dayCardListResource)),
                        catchError(() => of(new DayCardActions.Cancel.AllRejected()))
                    );
            })));

    public complete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CompleteOneDayCard),
            mergeMap((action: DayCardActions.Complete.One) => this._combineDayCard(action, action.payload)),
            mergeMap(([action, currentDayCard]) => {
                const dayCardId = action.payload;
                const version = currentDayCard.version;

                return this._dayCardService
                    .complete(dayCardId, version)
                    .pipe(
                        map(dayCardResource => new DayCardActions.Complete.OneFulfilled(dayCardResource)),
                        catchError(() => of(new DayCardActions.Complete.OneRejected())));
            })));

    public completeAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CompleteAllDayCard),
            mergeMap((action: DayCardActions.Complete.All) =>
                this._combineDayCardsSaveList<DayCardActions.Complete.All>(action, action.payload)),
            mergeMap(([, dayCards]) =>
                this._dayCardService.completeAll(dayCards)
                    .pipe(
                        map((dayCardListResource: DayCardResource[]) => new DayCardActions.Complete.AllFulfilled(dayCardListResource)),
                        catchError(() => of(new DayCardActions.Complete.AllRejected()))))));

    public reset$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.ResetOneDayCard),
            mergeMap((action: DayCardActions.Reset.One) => this._combineDayCard(action, action.payload)),
            mergeMap(([action, currentDayCard]) => {
                const dayCardId = action.payload;
                const version = currentDayCard.version;

                return this._dayCardService
                    .reset(dayCardId, version)
                    .pipe(
                        map(dayCard => new DayCardActions.Reset.OneFulfilled(dayCard)),
                        catchError(() => of(new DayCardActions.Reset.OneRejected())));
            })));

    public create$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CreateOneDayCard),
            mergeMap((action: DayCardActions.Create.One) => this._combineTaskSchedule(action, action.payload.taskId)),
            mergeMap(([action, currentTaskSchedule]) => {
                const {taskId, saveDayCard} = action.payload;
                const version = currentTaskSchedule.version;

                return this._dayCardService
                    .create(taskId, saveDayCard, version)
                    .pipe(
                        map((taskSchedule: TaskScheduleResource) => new DayCardActions.Create.OneFulfilled(taskSchedule)),
                        catchError(() => of(new DayCardActions.Create.OneRejected(taskId))));
            })));

    public createSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.CreateOneDayCardFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('DayCard_Create_SuccessMessage')}))));

    public delete$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.DeleteOneDayCard),
            mergeMap((action: DayCardActions.Delete.One) => this._combineTaskSchedule(action, action.payload.taskId)),
            mergeMap(([action, currentTaskSchedule]) => {
                const dayCardId = action.payload.dayCardId;
                const version = currentTaskSchedule.version;

                return this._dayCardService
                    .delete(dayCardId, version)
                    .pipe(
                        map((taskSchedule: TaskScheduleResource) => new DayCardActions.Delete.OneFulfilled(taskSchedule)),
                        catchError(() => of(new DayCardActions.Delete.OneRejected())));
            })));

    public deleteAll$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.DeleteAllDayCard),
            mergeMap((action: DayCardActions.Delete.All) => this._groupDayCardsByTask(action.payload.dayCardIds)),
            mergeMap((dayCardsByTask: Record<string, DayCard[]>) => this._mapDayCardsToSaveDeleteDayCardResource(dayCardsByTask)),
            withLatestFrom(this._projectSliceService.observeCurrentProjectId()),
            mergeMap(([saveDeleteDaycardResources, projectId]) => {
                const items = new AbstractItemsResource(saveDeleteDaycardResources);
                return this._dayCardService.deleteAll(projectId, items).pipe(
                    map(({items: deleteItems}) => new DayCardActions.Delete.AllFulfilled(deleteItems)),
                    catchError(() => of(new DayCardActions.Delete.AllRejected())),
                );
            }),
        ),
    );

    public deleteSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.DeleteOneDayCardFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('DayCard_Delete_SuccessMessage')}))));

    public deleteAllSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.DeleteAllDayCardFulfilled),
            map(() => new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('DayCards_Delete_SuccessMessage')}))));

    public update$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.UpdateOneDayCard),
            mergeMap((action: DayCardActions.Update.One) => {
                const {taskId, dayCardId} = action.payload;

                return combineLatest([
                    of(action),
                    this._dayCardQueries.observeDayCardById(dayCardId),
                    this._dayCardQueries.observeTaskScheduleByTaskId(taskId),
                    this._workDaysQueries.observeWorkDays(),
                ]).pipe(first());
            }),
            switchMap(([action, currentDayCard, currentTaskSchedule, workDays]) => {
                const updateDayCardAction: DayCardActions.Update.One = action;
                const {taskId, dayCardId, saveDayCard, dayCardVersion, taskScheduleVersion} = updateDayCardAction.payload;
                const dayCardDate = moment(currentDayCard.date);
                const updatedDayCardDate = moment(saveDayCard.date);
                const dayCardDateChanged = !updatedDayCardDate.isSame(dayCardDate, 'd');

                return this._dayCardService
                    .update(dayCardId, saveDayCard, dayCardVersion)
                    .pipe(
                        switchMap(dayCard => {
                            if (dayCardDateChanged) {
                                const saveTaskSchedule =
                                    this._getUpdateTaskSchedulePayload(currentTaskSchedule, dayCardId, updatedDayCardDate, workDays);

                                return this._taskScheduleService
                                    .update(taskId, saveTaskSchedule, taskScheduleVersion)
                                    .pipe(
                                        map((taskSchedule: TaskScheduleResource) =>
                                            new DayCardActions.Update.OneWithScheduleFulfilled(taskSchedule)),
                                        catchError(() => of(new DayCardActions.Update.OnePartiallyFulfilled(dayCard)))
                                    );
                            } else {
                                return of(new DayCardActions.Update.OneFulfilled(dayCard));
                            }
                        }),
                        catchError(() => of(new DayCardActions.Update.OneRejected())));
            })));

    public updateSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(
                DayCardActionEnum.UpdateOneDayCardFulfilled,
                DayCardActionEnum.UpdateOneDayCardWithScheduleFulfilled,
                DayCardActionEnum.UpdateOneDayCardPartiallyFulfilled,
                DayCardActionEnum.UpdateSlotsFulfilled,
            ),
            map((action: Action) => action.type === DayCardActionEnum.UpdateOneDayCardPartiallyFulfilled ?
                new AlertActions.Add.WarningAlert({message: new AlertMessageResource('DayCard_Edit_PartialSuccessMessage')}) :
                new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('DayCard_Edit_SuccessMessage')}))));

    public updateSchedule$ = createEffect(() => this._actions$
        .pipe(
            ofType(DayCardActionEnum.UpdateSlots),
            mergeMap((action: DayCardActions.Update.Slots) =>
                combineLatest([
                    of(action),
                    this._dayCardQueries.observeTaskScheduleByTaskId(action.payload.taskId),
                    this._workDaysQueries.observeWorkDays(),
                ]).pipe(first())),
            mergeMap(([action, currentTaskSchedule, workDays]) => {
                const {taskId, dayCardId, currentDate} = action.payload;
                const version = currentTaskSchedule.version;
                const saveTaskSchedule = this._getUpdateTaskSchedulePayload(currentTaskSchedule, dayCardId, currentDate, workDays);

                return this._taskScheduleService
                    .update(taskId, saveTaskSchedule, version)
                    .pipe(
                        map(taskSchedule => new DayCardActions.Update.SlotsFulfilled(taskSchedule)),
                        catchError(() => of(new DayCardActions.Update.SlotsRejected(taskId)))
                    );
            })
        ));

    public resetCalendarSelection$ = createEffect(() => this._actions$
        .pipe(
            ofType(...DAY_CARD_RESET_CALENDAR_SELECTION_ACTIONS),
            map(() => new CalendarSelectionActions.Initialize.All()),
        ));

    private _combineDayCardsSaveList<A>(action: A, dayCardIds: string[]): Observable<[A, AbstractItemSaveResource<DayCard>[]]> {
        return combineLatest([
            of(action),
            zip(...dayCardIds.map(dayCardId =>
                this._dayCardQueries.observeDayCardById(dayCardId)
                    .pipe(
                        map(daycard => new AbstractItemSaveResource(daycard)))))])
            .pipe(first());
    }

    private _updateSlots(slots: TaskScheduleSlotResource[],
                         dayCardId: string,
                         currentDate: moment.Moment,
                         workDays: WorkDaysResource): SaveTaskScheduleSlotResource[] {
        let tempDate: moment.Moment = currentDate.clone();

        return [...slots]
            .map((slot: TaskScheduleSlotResource) => {
                const slotDate: moment.Moment = moment(slot.date);
                const isSlotDateOutDated = slotDate.isSameOrAfter(currentDate, 'd') && slotDate.isSameOrBefore(tempDate, 'd');
                let updatedDate: moment.Moment = slotDate;

                if (slot.dayCard.id === dayCardId) {
                    updatedDate = currentDate;
                } else if (isSlotDateOutDated) {
                    const nextSlotDate = tempDate.clone().add(1, 'd');

                    updatedDate = tempDate = this._getNextAvailableSlot(nextSlotDate, workDays);
                }

                return new SaveTaskScheduleSlotResource(slot.dayCard.id, updatedDate);
            });
    }

    /**
     * @description Used to recalculate the task schedule when the date of the day card changes.
     * @description When we implement do optimistic UI this can be moved to the reducer
     * @param currentTaskSchedule
     * @param dayCardId
     * @param dayCardDate
     * @param workDays
     * @returns {SaveTaskScheduleResource}
     * @private
     */
    private _getUpdateTaskSchedulePayload(currentTaskSchedule: TaskSchedule,
                                          dayCardId: string,
                                          dayCardDate: moment.Moment,
                                          workDays: WorkDaysResource): SaveTaskScheduleResource {
        const {start, end} = currentTaskSchedule;
        const updatedSlots = this._updateSlots(currentTaskSchedule.slots, dayCardId, dayCardDate, workDays);

        return new SaveTaskScheduleResource(
            start,
            end,
            updatedSlots
        );
    }

    private _groupDayCardsByTask(ids: string[]): Observable<Record<string, DayCard[]>> {
        return zip(
            ...ids.map(dayCardId => this._dayCardQueries.observeDayCardById(dayCardId).pipe(take(1))))
            .pipe(
                map(dayCards => groupBy<DayCard>(dayCards, 'task.id')),
            );
    }

    private _getNextAvailableSlot(slotDate: moment.Moment, workDays: WorkDaysResource): moment.Moment {
        return this._isSlotLocked(slotDate, workDays)
            ? this._getNextAvailableSlot(slotDate.clone().add(1, 'd'), workDays)
            : slotDate;
    }

    private _combineDayCard<A>(action: A, dayCardId: string): Observable<[A, DayCard]> {
        return combineLatest([
            of(action),
            this._dayCardQueries.observeDayCardById(dayCardId),
        ]).pipe(first());
    }

    private _combineTaskSchedule<A>(action: A, taskId: string): Observable<[A, TaskSchedule]> {
        return combineLatest([
            of(action),
            this._dayCardQueries.observeTaskScheduleByTaskId(taskId),
        ]).pipe(first());
    }

    private _isSlotLocked(slotDate: moment.Moment, {allowWorkOnNonWorkingDays, workingDays, holidays}: WorkDaysResource): boolean {
        return !allowWorkOnNonWorkingDays &&
            (!WorkingDaysHelper.isDayAWorkingDay(slotDate, workingDays) || WorkingDaysHelper.isDayAHoliday(slotDate, holidays));
    }

    private _mapDayCardsToSaveDeleteDayCardResource(dayCardsByTask: Record<string, DayCard[]>): Observable<SaveDeleteDayCardResource[]> {
        return zip(...Object.keys(dayCardsByTask).map(taskId => {
            const dayCardsIds = dayCardsByTask[taskId].map(daycard => daycard.id);

            return this._dayCardQueries.observeTaskScheduleByTaskId(taskId).pipe(
                take(1),
                map(({version}) => new SaveDeleteDayCardResource(version, dayCardsIds)),
            );
        }));
    }
}
