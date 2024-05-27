/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {
    MOCK_UPDATE_WORK_DAYS_PAYLOAD,
    MOCK_WORK_DAYS
} from '../../../../../test/mocks/workdays';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkDaysActions} from './work-days.actions';
import {WORK_DAYS_INITIAL_STATE} from './work-days.initial-state';
import {WORK_DAYS_REDUCER} from './work-days.reducer';
import {WorkDaysSlice} from './work-days.slice';

describe('Work Days Reducer', () => {
    let initialState: WorkDaysSlice;
    let nextState: WorkDaysSlice;

    beforeEach(() => {
        initialState = WORK_DAYS_INITIAL_STATE;
        nextState = cloneDeep(WORK_DAYS_INITIAL_STATE);
    });

    it('should handle WorkDaysActions.Initialize.All()', () => {
        const action = new WorkDaysActions.Initialize.All();
        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(initialState);
    });

    it('should handle WorkDaysActions.Request.One()', () => {
        const action = new WorkDaysActions.Request.One();

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkDaysActions.Request.OneFulfilled()', () => {
        const action = new WorkDaysActions.Request.OneFulfilled(MOCK_WORK_DAYS);

        nextState = Object.assign({}, initialState, {
            item: MOCK_WORK_DAYS,
            requestStatus: RequestStatusEnum.success,
        });

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkDaysActions.Request.OneRejected()', () => {
        const action = new WorkDaysActions.Request.OneRejected();

        nextState.requestStatus = RequestStatusEnum.error;

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkDaysActions.Update.One()', () => {
        const action = new WorkDaysActions.Update.One(MOCK_UPDATE_WORK_DAYS_PAYLOAD, MOCK_WORK_DAYS.version);

        nextState.requestStatus = RequestStatusEnum.progress;

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkDaysActions.Update.OneFulfilled()', () => {
        const action = new WorkDaysActions.Update.OneFulfilled(MOCK_WORK_DAYS);

        nextState = Object.assign({}, initialState, {
            item: MOCK_WORK_DAYS,
            requestStatus: RequestStatusEnum.success,
        });

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle WorkDaysActions.Update.OneRejected()', () => {
        const action = new WorkDaysActions.Update.OneRejected();

        nextState.requestStatus = RequestStatusEnum.error;

        expect(WORK_DAYS_REDUCER(initialState, action)).toEqual(nextState);
    });
});
