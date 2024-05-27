/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */
import {
    MOCK_RESCHEDULE_JOB_ID_RESOURCE,
    MOCK_RESCHEDULE_RESOURCE,
    MOCK_SAVE_RESCHEDULE_RESOURCE
} from '../../../../../test/mocks/project-reschedule';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RescheduleActions} from './reschedule.actions';
import {RESCHEDULE_SLICE_INITIAL_STATE} from './reschedule.initial-state';
import {rescheduleReducer} from './reschedule.reducer';
import {RescheduleSlice} from './reschedule.slice';

describe('Reschedule Reducer', () => {
    let state: RescheduleSlice;

    beforeEach(() => {
        state = RESCHEDULE_SLICE_INITIAL_STATE;
    });

    it('should handle RescheduleActions.Initialize.All()', () => {
        const action = new RescheduleActions.Initialize.All();

        expect(rescheduleReducer(state, action)).toEqual(state);
    });

    it('should handle RescheduleActions.Reschedule.One()', () => {
        const action = new RescheduleActions.Reschedule.One(MOCK_SAVE_RESCHEDULE_RESOURCE);
        const expectedState = {...state, requestStatus: RequestStatusEnum.progress};

        expect(rescheduleReducer(state, action)).toEqual(expectedState);
    });

    it('should handle RescheduleActions.Reschedule.OneFulfilled()', () => {
        const action = new RescheduleActions.Reschedule.OneFulfilled(MOCK_RESCHEDULE_JOB_ID_RESOURCE.id);
        const expectedState = {...state, requestStatus: RequestStatusEnum.success};

        expect(rescheduleReducer(state, action)).toEqual(expectedState);
    });

    it('should handle RescheduleActions.Reschedule.OneRejected()', () => {
        const action = new RescheduleActions.Reschedule.OneRejected();
        const expectedState = {...state, requestStatus: RequestStatusEnum.error};

        expect(rescheduleReducer(state, action)).toEqual(expectedState);
    });

    it('should handle RescheduleActions.Validate.One() and it should also reset the item to null', () => {
        const action = new RescheduleActions.Validate.One(MOCK_SAVE_RESCHEDULE_RESOURCE);

        const previousState = {...state, item: MOCK_RESCHEDULE_RESOURCE};
        const expectedState = {item: null, requestStatus: RequestStatusEnum.progress};

        expect(rescheduleReducer(previousState, action)).toEqual(expectedState);
    });

    it('should handle RescheduleActions.Validate.OneFulfilled()', () => {
        const action = new RescheduleActions.Validate.OneFulfilled(MOCK_RESCHEDULE_RESOURCE);
        const expectedState = {item: MOCK_RESCHEDULE_RESOURCE, requestStatus: RequestStatusEnum.success};

        expect(rescheduleReducer(state, action)).toEqual(expectedState);
    });

    it('should handle RscheduleActions.Validate.OneRejected()', () => {
        const action = new RescheduleActions.Validate.OneRejected();
        const expectedState = {...state, requestStatus: RequestStatusEnum.error};

        expect(rescheduleReducer(state, action)).toEqual(expectedState);
    });
});
