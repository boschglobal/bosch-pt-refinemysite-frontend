/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TopicActionEnum,
    TopicActions,
    TopicAttachmentActionEnum,
    TopicAttachmentActions
} from './topic.actions';

describe('Topic Actions', () => {
    it('should check TopicActions.Request.All() type', () => {
        expect(new TopicActions.Request.All().type).toBe(TopicActionEnum.RequestAll);
    });

    it('should check TopicActions.Request.AllFulfilled() type', () => {
        expect(new TopicActions.Request.AllFulfilled(null).type).toBe(TopicActionEnum.RequestAllFulfilled);
    });

    it('should check TopicActions.Request.AllRejected() type', () => {
        expect(new TopicActions.Request.AllRejected().type).toBe(TopicActionEnum.RequestAllRejected);
    });

    it('should check TopicActions.Request.One() type', () => {
        expect(new TopicActions.Request.One(null).type).toBe(TopicActionEnum.RequestOne);
    });

    it('should check TopicActions.Request.OneFulfilled() type', () => {
        expect(new TopicActions.Request.OneFulfilled(null).type).toBe(TopicActionEnum.RequestOneFulfilled);
    });

    it('should check TopicActions.Request.OneRejected() type', () => {
        expect(new TopicActions.Request.OneRejected().type).toBe(TopicActionEnum.RequestOneRejected);
    });

    it('should check TopicActions.Create.Topic() type', () => {
        expect(new TopicActions.Create.One(null).type).toBe(TopicActionEnum.CreateOne);
    });

    it('should check TopicActions.Create.TopicFulfilled() type', () => {
        expect(new TopicActions.Create.OneFulfilled(null).type).toBe(TopicActionEnum.CreateOneFulfilled);
    });

    it('should check TopicActions.Create.TopicRejected() type', () => {
        expect(new TopicActions.Create.OneRejected().type).toBe(TopicActionEnum.CreateOneRejected);
    });

    it('should check TopicActions.Create.OneReset() type', () => {
        expect(new TopicActions.Create.OneReset().type).toBe(TopicActionEnum.CreateOneReset);
    });

    it('should check TopicActions.Update.TopicCriticality() type', () => {
        expect(new TopicActions.Update.Criticality(null).type).toBe(TopicActionEnum.UpdateCriticality);
    });

    it('should check TopicActions.Update.CriticalityFulfilled() type', () => {
        expect(new TopicActions.Update.CriticalityFulfilled(null).type).toBe(TopicActionEnum.UpdateCriticalityFulfilled);
    });

    it('should check TopicActions.Update.List() type', () => {
        expect(new TopicActions.Update.List(null).type).toBe(TopicActionEnum.UpdateList);
    });

    it('should check TopicActions.Delete.One() type', () => {
        expect(new TopicActions.Delete.One(null).type).toBe(TopicActionEnum.DeleteOne);
    });

    it('should check TopicActions.Delete.OneFulfilled() type', () => {
        expect(new TopicActions.Delete.OneFulfilled(null).type).toBe(TopicActionEnum.DeleteOneFulfilled);
    });

    it('should check TopicActions.Delete.OneRejected() type', () => {
        expect(new TopicActions.Delete.OneRejected().type).toBe(TopicActionEnum.DeleteOneRejected);
    });

    it('should check TopicActions.Delete.OneReset() type', () => {
        expect(new TopicActions.Delete.OneReset().type).toBe(TopicActionEnum.DeleteOneReset);
    });

    it('should check TopicAttachmentActions.Create.All() type', () => {
        expect(new TopicAttachmentActions.Create.All(null).type).toBe(TopicAttachmentActionEnum.CreateAll);
    });
});
