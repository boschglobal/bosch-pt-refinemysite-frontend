/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_DAY_CARD_RESOURCE_A,
    MOCK_DAY_CARD_RESOURCE_B,
    MOCK_DAY_CARD_WITHOUT_DATE,
    MOCK_SAVE_DAY_CARD_A,
} from '../../../../../test/mocks/day-cards';
import {
    MOCK_TASK_SCHEDULE_RESOURCE_A,
    MOCK_TASK_SCHEDULE_WITHOUT_SLOTS,
    MOCK_TASK_SCHEDULE_WITHOUT_SLOTS2
} from '../../../../../test/mocks/task-schedules';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {DayCardResource} from '../../api/day-cards/resources/day-card.resource';
import {
    CancelDayCardPayload,
    CreateDayCardPayload,
    DayCardActions,
    DeleteDayCardPayload,
    UpdateDayCardPayload
} from './day-card.actions';
import {DAY_CARD_SLICE_INITIAL_STATE} from './day-card.initial-state';
import {DAY_CARD_REDUCER} from './day-card.reducer';
import {DayCardSlice} from './day-card.slice';

describe('Day Card Reducer', () => {
    let initialState: DayCardSlice;
    let midState: DayCardSlice;
    let nextState: DayCardSlice;

    const taskId = 'foo';
    const dayCardId = MOCK_DAY_CARD_RESOURCE_A.id;
    const dayCardVersion = 1;
    const taskScheduleVersion = 1;
    const saveDayCard = MOCK_SAVE_DAY_CARD_A;
    const dayCard = MOCK_DAY_CARD_WITHOUT_DATE;
    const dayCardWithNotes = Object.assign(
        {},
        MOCK_DAY_CARD_WITHOUT_DATE,
        {notes: 'Lorem ipsum'}
    );
    const taskSchedule = MOCK_TASK_SCHEDULE_RESOURCE_A;
    const tasksSchedules = [MOCK_TASK_SCHEDULE_WITHOUT_SLOTS, MOCK_TASK_SCHEDULE_WITHOUT_SLOTS2];
    const createDayCardPayload: CreateDayCardPayload = {
        taskId,
        saveDayCard
    };

    const deleteDayCardPayload: DeleteDayCardPayload = {
        taskId,
        dayCardId
    };

    const updateDayCardPayload: UpdateDayCardPayload = {
        taskId,
        dayCardId,
        dayCardVersion,
        taskScheduleVersion,
        saveDayCard,
    };

    const cancelDayCardPayload: CancelDayCardPayload = {
        dayCardId,
        reason: 'BAD_WEATHER',
    };

    beforeEach(() => {
        initialState = DAY_CARD_SLICE_INITIAL_STATE;
        midState = cloneDeep(DAY_CARD_SLICE_INITIAL_STATE);
        nextState = cloneDeep(DAY_CARD_SLICE_INITIAL_STATE);
    });

    it('should handle InitializeAllDayCards', () => {
        const action = new DayCardActions.Initialize.All();
        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle RequestOneDayCard', () => {
        const action = new DayCardActions.Request.One(taskId);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneDayCard', () => {
        const action = new DayCardActions.Create.One(createDayCardPayload);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteDayCard', () => {
        const action = new DayCardActions.Delete.One(deleteDayCardPayload);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneDayCard', () => {
        const action = new DayCardActions.Update.One(updateDayCardPayload);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ApproveOneDayCard', () => {
        const action = new DayCardActions.Approve.One(taskId);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelOneDayCard', () => {
        const action = new DayCardActions.Cancel.One(cancelDayCardPayload);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteOneDayCard', () => {
        const action = new DayCardActions.Complete.One(taskId);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ResetOneDayCard', () => {
        const action = new DayCardActions.Reset.One(taskId);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneDayCardReset', () => {
        const action = new DayCardActions.Create.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteOneDayCardReset', () => {
        const action = new DayCardActions.Delete.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneDayCardReset', () => {
        const action = new DayCardActions.Update.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ApproveOneDayCardReset', () => {
        const action = new DayCardActions.Approve.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelOneDayCardReset', () => {
        const action = new DayCardActions.Cancel.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteOneDayCardReset', () => {
        const action = new DayCardActions.Complete.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ResetOneDayCardReset', () => {
        const action = new DayCardActions.Reset.OneReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestOneDayCardRejected', () => {
        const action = new DayCardActions.Request.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneDayCardRejected', () => {
        const action = new DayCardActions.Create.OneRejected(null);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteOneDayCardRejected', () => {
        const action = new DayCardActions.Delete.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneDayCardRejected', () => {
        const action = new DayCardActions.Update.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ApproveOneDayCardRejected', () => {
        const action = new DayCardActions.Approve.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelOneDayCardRejected', () => {
        const action = new DayCardActions.Cancel.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteOneDayCardRejected', () => {
        const action = new DayCardActions.Complete.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ResetOneDayCardRejected', () => {
        const action = new DayCardActions.Reset.OneRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDayCardsByTaskFulfilled', () => {
        const action = new DayCardActions.Request.AllByTaskFulfilled(taskSchedule);

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDayCardsFromTasksFulfilled', () => {
        const action = new DayCardActions.Request.AllFromTasksFulfilled([taskSchedule]);

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateSlotsFulfilled', () => {
        const action = new DayCardActions.Update.SlotsFulfilled(taskSchedule);

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneDayCardFulfilled', () => {
        const action = new DayCardActions.Create.OneFulfilled(taskSchedule);

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteOneDayCardFulfilled', () => {
        const action = new DayCardActions.Delete.OneFulfilled(taskSchedule);

        midState.items = [MOCK_DAY_CARD_RESOURCE_A, MOCK_DAY_CARD_RESOURCE_B];
        midState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle OneWithScheduleFulfilled', () => {
        const action = new DayCardActions.Update.OneWithScheduleFulfilled(taskSchedule);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_RESOURCE_A, {title: 'Outdated title'})];
        midState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        nextState.items = [Object.assign(new DayCardResource(), taskSchedule._embedded.dayCards.items[0])];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneDayCardFulfilled', () => {
        const action = new DayCardActions.Update.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), dayCardWithNotes, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneDayCardPartiallyFulfilled', () => {
        const action = new DayCardActions.Update.OnePartiallyFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), dayCardWithNotes, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RequestOneDayCardFulfilled', () => {
        const action = new DayCardActions.Request.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), dayCardWithNotes, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ApproveOneDayCardFulfilled', () => {
        const action = new DayCardActions.Approve.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle CancelOneDayCardFulfilled', () => {
        const action = new DayCardActions.Cancel.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle CompleteOneDayCardFulfilled', () => {
        const action = new DayCardActions.Complete.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ResetOneDayCardFulfilled', () => {
        const action = new DayCardActions.Reset.OneFulfilled(dayCard);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(DAY_CARD_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });

    it('should handle ApproveAllDayCard', () => {
        const action = new DayCardActions.Complete.All([]);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteAllDayCard', () => {
        const action = new DayCardActions.Complete.All([]);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelAllDayCard', () => {
        const action = new DayCardActions.Cancel.All({dayCardIds: [], reason: cancelDayCardPayload.reason});
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteAllDayCard', () => {
        const action = new DayCardActions.Delete.All({dayCardIds: []});
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteAllDayCardFulfilled', () => {
        const action = new DayCardActions.Complete.AllFulfilled([dayCard]);

        nextState.items = [Object.assign(new DayCardResource(), dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelAllDayCardFulfilled', () => {
        const action = new DayCardActions.Cancel.AllFulfilled([dayCard]);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle ApproveAllDayCardFulfilled', () => {
        const action = new DayCardActions.Approve.AllFulfilled([dayCard]);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle DeleteAllDayCardFulfilled', () => {
        const mockDayCardResourceA: DayCardResource = Object.assign(new DayCardResource(), MOCK_DAY_CARD_RESOURCE_A, {
            task: MOCK_TASK_SCHEDULE_WITHOUT_SLOTS.task,
        });

        const mockDayCardResourceB: DayCardResource = Object.assign(new DayCardResource(), MOCK_DAY_CARD_RESOURCE_B, {
            task: MOCK_TASK_SCHEDULE_WITHOUT_SLOTS2.task,
        });

        const action = new DayCardActions.Delete.AllFulfilled(tasksSchedules);

        midState.items = [mockDayCardResourceA, mockDayCardResourceB, MOCK_DAY_CARD_WITHOUT_DATE];
        midState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        nextState.items = [MOCK_DAY_CARD_WITHOUT_DATE];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle CompleteAllDayCardRejected', () => {
        const action = new DayCardActions.Complete.AllRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CompleteAllDayCardReset', () => {
        const action = new DayCardActions.Complete.AllReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelAllDayCardRejected', () => {
        const action = new DayCardActions.Cancel.AllRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CancelAllDayCardReset', () => {
        const action = new DayCardActions.Cancel.AllReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ApproveAllDayCardRejected', () => {
        const action = new DayCardActions.Approve.AllRejected([]);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ApproveAllDayCardReset', () => {
        const action = new DayCardActions.Approve.AllReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteAllDayCardRejected', () => {
        const action = new DayCardActions.Delete.AllRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteAllDayCardReset', () => {
        const action = new DayCardActions.Delete.AllReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDay', () => {
        const action = new DayCardActions.Request.All([]);
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDayCardFulfilled', () => {
        const action = new DayCardActions.Request.AllFulfilled([dayCard]);

        midState.items = [Object.assign(new DayCardResource(), MOCK_DAY_CARD_WITHOUT_DATE, {title: 'Outdated title'})];

        nextState.items = [Object.assign(new DayCardResource(), midState.items[0], dayCard)];
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            id: null
        });

        expect(DAY_CARD_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDayCardRejected', () => {
        const action = new DayCardActions.Request.AllRejected();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestAllDayCardReset', () => {
        const action = new DayCardActions.Request.AllReset();
        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null
        });

        expect(DAY_CARD_REDUCER(initialState, action)).toEqual(nextState);
    });
});
