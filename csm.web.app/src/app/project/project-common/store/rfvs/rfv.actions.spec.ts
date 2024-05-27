/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    RfvActions,
    RfvActionsEnum
} from './rfv.actions';

describe('RFV Actions', () => {
    it('should check RfvActions.Initialize.All() type', () => {
        expect(new RfvActions.Initialize.All().type)
            .toBe(RfvActionsEnum.InitializeAll);
    });

    it('should check RfvActions.Request.All() type', () => {
        expect(new RfvActions.Request.All().type)
            .toBe(RfvActionsEnum.RequestAll);
    });

    it('should check RfvActions.Request.RequestAllFulfilled() type', () => {
        expect(new RfvActions.Request.AllFulfilled(null).type)
            .toBe(RfvActionsEnum.RequestAllFulfilled);
    });

    it('should check RfvActions.Request.RequestAllRejected() type', () => {
        expect(new RfvActions.Request.AllRejected().type)
            .toBe(RfvActionsEnum.RequestAllRejected);
    });

    it('should check RfvActions.Update.One() type', () => {
        expect(new RfvActions.Update.One(null, null).type)
            .toBe(RfvActionsEnum.UpdateOne);
    });

    it('should check RfvActions.Update.OneFulfilled() type', () => {
        expect(new RfvActions.Update.OneFulfilled(null).type)
            .toBe(RfvActionsEnum.UpdateOneFulfilled);
    });

    it('should check RfvActions.Update.OneRejected() type', () => {
        expect(new RfvActions.Update.OneRejected(null).type)
            .toBe(RfvActionsEnum.UpdateOneRejected);
    });

    it('should check RfvActions.Update.OneReset() type', () => {
        expect(new RfvActions.Update.OneReset(null).type)
            .toBe(RfvActionsEnum.UpdateOneReset);
    });

    it('should check RfvActions.Activate.One() type', () => {
        expect(new RfvActions.Activate.One(null, null).type)
            .toBe(RfvActionsEnum.ActivateOne);
    });

    it('should check RfvActions.Activate.OneFulfilled() type', () => {
        expect(new RfvActions.Activate.OneFulfilled(null).type)
            .toBe(RfvActionsEnum.ActivateOneFulfilled);
    });

    it('should check RfvActions.Activate.OneRejected() type', () => {
        expect(new RfvActions.Activate.OneRejected(null).type)
            .toBe(RfvActionsEnum.ActivateOneRejected);
    });

    it('should check RfvActions.Activate.OneReset() type', () => {
        expect(new RfvActions.Activate.OneReset(null).type)
            .toBe(RfvActionsEnum.ActivateOneReset);
    });

    it('should check RfvActions.Deactivate.One() type', () => {
        expect(new RfvActions.Deactivate.One(null, null).type)
            .toBe(RfvActionsEnum.DeactivateOne);
    });

    it('should check RfvActions.Deactivate.OneFulfilled() type', () => {
        expect(new RfvActions.Deactivate.OneFulfilled(null).type)
            .toBe(RfvActionsEnum.DeactivateOneFulfilled);
    });

    it('should check RfvActions.Deactivate.OneRejected() type', () => {
        expect(new RfvActions.Deactivate.OneRejected(null).type)
            .toBe(RfvActionsEnum.DeactivateOneRejected);
    });

    it('should check RfvActions.Deactivate.OneReset() type', () => {
        expect(new RfvActions.Deactivate.OneReset(null).type)
            .toBe(RfvActionsEnum.DeactivateOneReset);
    });
});
