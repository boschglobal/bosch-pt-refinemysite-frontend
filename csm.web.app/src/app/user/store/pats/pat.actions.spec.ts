/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    PATActionEnum,
    PATActions
} from './pat.actions';

describe('PAT Actions', () => {
    it('should check PATActions.Initialize.All() type', () => {
        expect(new PATActions.Initialize.All().type)
            .toBe(PATActionEnum.InitializeAll);
    });

    it('should check PATActions.Initialize.Current() type', () => {
        expect(new PATActions.Initialize.Current().type)
            .toBe(PATActionEnum.InitializeCurrent);
    });

    it('should check PATActions.Initialize.List() type', () => {
        expect(new PATActions.Initialize.List().type)
            .toBe(PATActionEnum.InitializeList);
    });

    it('should check PATActions.Request.All() type', () => {
        expect(new PATActions.Request.All().type)
            .toBe(PATActionEnum.RequestAll);
    });

    it('should check PATActions.Request.AllFulfilled() type', () => {
        expect(new PATActions.Request.AllFulfilled(null).type)
            .toBe(PATActionEnum.RequestAllFulfilled);
    });

    it('should check PATActions.Request.AllRejected() type', () => {
        expect(new PATActions.Request.AllRejected().type)
            .toBe(PATActionEnum.RequestAllRejected);
    });

    it('should check PATActions.Create.One() type', () => {
        expect(new PATActions.Create.One(null).type)
            .toBe(PATActionEnum.CreateOne);
    });

    it('should check PATActions.Create.OneFulfilled() type', () => {
        expect(new PATActions.Create.OneFulfilled(null).type)
            .toBe(PATActionEnum.CreateOneFulfilled);
    });

    it('should check PATActions.Create.OneRejected() type', () => {
        expect(new PATActions.Create.OneRejected().type)
            .toBe(PATActionEnum.CreateOneRejected);
    });

    it('should check PATActions.Delete.One() type', () => {
        expect(new PATActions.Delete.One(null).type)
            .toBe(PATActionEnum.DeleteOne);
    });

    it('should check PATActions.Delete.OneFulfilled() type', () => {
        expect(new PATActions.Delete.OneFulfilled(null).type)
            .toBe(PATActionEnum.DeleteOneFulfilled);
    });

    it('should check PATActions.Delete.OneRejected() type', () => {
        expect(new PATActions.Delete.OneRejected().type)
            .toBe(PATActionEnum.DeleteOneRejected);
    });

    it('should check PATActions.Update.One() type', () => {
        expect(new PATActions.Update.One(null).type)
            .toBe(PATActionEnum.UpdateOne);
    });

    it('should check PATActions.Update.OneFulfilled() type', () => {
        expect(new PATActions.Update.OneFulfilled(null).type)
            .toBe(PATActionEnum.UpdateOneFulfilled);
    });

    it('should check PATActions.Update.OneRejected() type', () => {
        expect(new PATActions.Update.OneRejected().type)
            .toBe(PATActionEnum.UpdateOneRejected);
    });
});
