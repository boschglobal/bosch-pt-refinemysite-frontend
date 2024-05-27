/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    WorkareaActionEnum,
    WorkareaActions
} from './workarea.actions';

describe('Workarea Actions', () => {
    it('should check WorkareaActions.Initialize.All() type', () => {
        expect(new WorkareaActions.Initialize.All().type)
            .toBe(WorkareaActionEnum.InitializeAll);
    });

    it('should check WorkareaActions.Initialize.Current() type', () => {
        expect(new WorkareaActions.Initialize.Current().type)
            .toBe(WorkareaActionEnum.InitializeCurrent);
    });

    it('should check WorkareaActions.Initialize.List() type', () => {
        expect(new WorkareaActions.Initialize.List().type)
            .toBe(WorkareaActionEnum.InitializeList);
    });

    it('should check WorkareaActions.Request.All() type', () => {
        expect(new WorkareaActions.Request.All().type)
            .toBe(WorkareaActionEnum.RequestAll);
    });

    it('should check WorkareaActions.Request.AllFulfilled() type', () => {
        expect(new WorkareaActions.Request.AllFulfilled(null).type)
            .toBe(WorkareaActionEnum.RequestAllFulfilled);
    });

    it('should check WorkareaActions.Request.AllRejected() type', () => {
        expect(new WorkareaActions.Request.AllRejected().type)
            .toBe(WorkareaActionEnum.RequestAllRejected);
    });

    it('should check WorkareaActions.Create.One() type', () => {
        expect(new WorkareaActions.Create.One(null).type)
            .toBe(WorkareaActionEnum.CreateOne);
    });

    it('should check WorkareaActions.Create.OneFulfilled() type', () => {
        expect(new WorkareaActions.Create.OneFulfilled(null).type)
            .toBe(WorkareaActionEnum.CreateOneFulfilled);
    });

    it('should check WorkareaActions.Create.OneRejected() type', () => {
        expect(new WorkareaActions.Create.OneRejected().type)
            .toBe(WorkareaActionEnum.CreateOneRejected);
    });

    it('should check WorkareaActions.Create.OneReset() type', () => {
        expect(new WorkareaActions.Create.OneReset().type)
            .toBe(WorkareaActionEnum.CreateOneReset);
    });

    it('should check WorkareaActions.Delete.One() type', () => {
        expect(new WorkareaActions.Delete.One(null).type)
            .toBe(WorkareaActionEnum.DeleteOne);
    });

    it('should check WorkareaActions.Delete.OneFulfilled() type', () => {
        expect(new WorkareaActions.Delete.OneFulfilled(null).type)
            .toBe(WorkareaActionEnum.DeleteOneFulfilled);
    });

    it('should check WorkareaActions.Delete.OneRejected() type', () => {
        expect(new WorkareaActions.Delete.OneRejected().type)
            .toBe(WorkareaActionEnum.DeleteOneRejected);
    });

    it('should check WorkareaActions.Delete.OneReset() type', () => {
        expect(new WorkareaActions.Delete.OneReset().type)
            .toBe(WorkareaActionEnum.DeleteOneReset);
    });

    it('should check WorkareaActions.Update.One() type', () => {
        expect(new WorkareaActions.Update.One(null).type)
            .toBe(WorkareaActionEnum.UpdateOne);
    });

    it('should check WorkareaActions.Update.OneFulfilled() type', () => {
        expect(new WorkareaActions.Update.OneFulfilled(null).type)
            .toBe(WorkareaActionEnum.UpdateOneFulfilled);
    });

    it('should check WorkareaActions.Update.OneRejected() type', () => {
        expect(new WorkareaActions.Update.OneRejected().type)
            .toBe(WorkareaActionEnum.UpdateOneRejected);
    });

    it('should check WorkareaActions.Update.OneReset() type', () => {
        expect(new WorkareaActions.Update.OneReset().type)
            .toBe(WorkareaActionEnum.UpdateOneReset);
    });

    it('should check WorkareaActions.Update.List() type', () => {
        expect(new WorkareaActions.Update.List(null).type)
            .toBe(WorkareaActionEnum.UpdateList);
    });

    it('should check WorkareaActions.Update.ListFulfilled() type', () => {
        expect(new WorkareaActions.Update.ListFulfilled(null).type)
            .toBe(WorkareaActionEnum.UpdateListFulfilled);
    });

    it('should check WorkareaActions.Update.ListRejected() type', () => {
        expect(new WorkareaActions.Update.ListRejected().type)
            .toBe(WorkareaActionEnum.UpdateListRejected);
    });
});
