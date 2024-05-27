/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ConstraintActionEnum,
    ConstraintActions
} from './constraint.actions';

describe('Constraint Actions', () => {
    it('should check ConstraintActions.Initialize.All() type', () => {
        expect(new ConstraintActions.Initialize.All().type)
            .toBe(ConstraintActionEnum.InitializeAll);
    });

    it('should check ConstraintActions.Request.All() type', () => {
        expect(new ConstraintActions.Request.All().type)
            .toBe(ConstraintActionEnum.RequestAll);
    });

    it('should check ConstraintActions.Request.RequestAllFulfilled() type', () => {
        expect(new ConstraintActions.Request.AllFulfilled(null).type)
            .toBe(ConstraintActionEnum.RequestAllFulfilled);
    });

    it('should check ConstraintActions.Request.RequestAllRejected() type', () => {
        expect(new ConstraintActions.Request.AllRejected().type)
            .toBe(ConstraintActionEnum.RequestAllRejected);
    });

    it('should check ConstraintActions.Update.One() type', () => {
        expect(new ConstraintActions.Update.One(null).type)
            .toBe(ConstraintActionEnum.UpdateOne);
    });

    it('should check ConstraintActions.Update.OneFulfilled() type', () => {
        expect(new ConstraintActions.Update.OneFulfilled(null).type)
            .toBe(ConstraintActionEnum.UpdateOneFulfilled);
    });

    it('should check ConstraintActions.Update.OneRejected() type', () => {
        expect(new ConstraintActions.Update.OneRejected(null).type)
            .toBe(ConstraintActionEnum.UpdateOneRejected);
    });

    it('should check ConstraintActions.Update.OneReset() type', () => {
        expect(new ConstraintActions.Update.OneReset(null).type)
            .toBe(ConstraintActionEnum.UpdateOneReset);
    });

    it('should check ConstraintActions.Activate.One() type', () => {
        expect(new ConstraintActions.Activate.One(null).type)
            .toBe(ConstraintActionEnum.ActivateOne);
    });

    it('should check ConstraintActions.Activate.OneFulfilled() type', () => {
        expect(new ConstraintActions.Activate.OneFulfilled(null).type)
            .toBe(ConstraintActionEnum.ActivateOneFulfilled);
    });

    it('should check ConstraintActions.Activate.OneRejected() type', () => {
        expect(new ConstraintActions.Activate.OneRejected(null).type)
            .toBe(ConstraintActionEnum.ActivateOneRejected);
    });

    it('should check ConstraintActions.Activate.OneReset() type', () => {
        expect(new ConstraintActions.Activate.OneReset(null).type)
            .toBe(ConstraintActionEnum.ActivateOneReset);
    });

    it('should check ConstraintActions.Deactivate.One() type', () => {
        expect(new ConstraintActions.Deactivate.One(null).type)
            .toBe(ConstraintActionEnum.DeactivateOne);
    });

    it('should check ConstraintActions.Deactivate.OneFulfilled() type', () => {
        expect(new ConstraintActions.Deactivate.OneFulfilled(null).type)
            .toBe(ConstraintActionEnum.DeactivateOneFulfilled);
    });

    it('should check ConstraintActions.Deactivate.OneRejected() type', () => {
        expect(new ConstraintActions.Deactivate.OneRejected(null).type)
            .toBe(ConstraintActionEnum.DeactivateOneRejected);
    });

    it('should check ConstraintActions.Deactivate.OneReset() type', () => {
        expect(new ConstraintActions.Deactivate.OneReset(null).type)
            .toBe(ConstraintActionEnum.DeactivateOneReset);
    });
});
