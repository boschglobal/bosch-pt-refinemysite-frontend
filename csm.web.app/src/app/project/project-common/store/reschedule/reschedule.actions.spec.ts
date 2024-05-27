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
import {
    RescheduleActionEnum,
    RescheduleActions
} from './reschedule.actions';

describe('Reschedule Actions', () => {
    it('should check RescheduleActions.Initialize.All() type', () => {
        expect(new RescheduleActions.Initialize.All().type).toBe(RescheduleActionEnum.InitializeAll);
    });

    it('should check the RescheduleActions.Reschedule.One() type', () => {
        expect(new RescheduleActions.Reschedule.One(MOCK_SAVE_RESCHEDULE_RESOURCE).type).toBe(RescheduleActionEnum.RescheduleOne);
    });

    it('should check the RescheduleActions.Reschedule.OneFulfilled() type', () => {
        expect(new RescheduleActions.Reschedule.OneFulfilled(MOCK_RESCHEDULE_JOB_ID_RESOURCE.id).type)
            .toBe(RescheduleActionEnum.RescheduleOneFulfilled);
    });

    it('should check the RescheduleActions.Reschedule.OneRejected() type', () => {
        expect(new RescheduleActions.Reschedule.OneRejected().type).toBe(RescheduleActionEnum.RescheduleOneRejected);
    });

    it('should check the RescheduleActions.Validate.One() type', () => {
        expect(new RescheduleActions.Validate.One(MOCK_SAVE_RESCHEDULE_RESOURCE).type).toBe(RescheduleActionEnum.ValidateOne);
    });

    it('should check the RescheduleActions.Validate.OneFulfilled() type', () => {
        expect(new RescheduleActions.Validate.OneFulfilled(MOCK_RESCHEDULE_RESOURCE).type)
            .toBe(RescheduleActionEnum.ValidateOneFulfilled);
    });

    it('should check the RescheduleActions.Validate.OneRejected() type', () => {
        expect(new RescheduleActions.Validate.OneRejected().type)
            .toBe(RescheduleActionEnum.ValidateOneRejected);
    });
});
