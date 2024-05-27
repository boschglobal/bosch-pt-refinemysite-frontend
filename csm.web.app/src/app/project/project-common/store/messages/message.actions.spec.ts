/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    MessageActionEnum,
    MessageActions,
    MessageAttachmentActionEnum,
    MessageAttachmentActions
} from '../../../../../app/project/project-common/store/messages/message.actions';

describe('Message Actions', () => {
    it('should check MessageActions.Initialize.All() type', () => {
        expect(new MessageActions.Initialize.All().type).toBe(MessageActionEnum.InitializeAll);
    });

    it('should check MessageActions.Initialize.AllByTopic() type', () => {
        expect(new MessageActions.Initialize.AllByTopic(null).type).toBe(MessageActionEnum.InitializeAllByTopic);
    });

    it('should check MessageActions.Request.All() type', () => {
        expect(new MessageActions.Request.All(null).type).toBe(MessageActionEnum.RequestAll);
    });

    it('should check MessageActions.Request.AllFulfilled() type', () => {
        expect(new MessageActions.Request.AllFulfilled(null).type).toBe(MessageActionEnum.RequestAllFulfilled);
    });

    it('should check MessageActions.Request.AllRejected() type', () => {
        expect(new MessageActions.Request.AllRejected(null).type).toBe(MessageActionEnum.RequestAllRejected);
    });

    it('should check MessageActions.Create.One() type', () => {
        expect(new MessageActions.Create.One(null).type).toBe(MessageActionEnum.CreateOne);
    });

    it('should check MessageActions.Create.OneFulfilled() type', () => {
        expect(new MessageActions.Create.OneFulfilled(null).type).toBe(MessageActionEnum.CreateOneFulfilled);
    });

    it('should check MessageActions.Create.OneReset() type', () => {
        expect(new MessageActions.Create.OneReset().type).toBe(MessageActionEnum.CreateOneReset);
    });

    it('should check MessageActions.Create.OneRejected() type', () => {
        expect(new MessageActions.Create.OneRejected(null).type).toBe(MessageActionEnum.CreateOneRejected);
    });

    it('should check MessageActions.Delete.One() type', () => {
        expect(new MessageActions.Delete.One(null).type).toBe(MessageActionEnum.DeleteOne);
    });

    it('should check MessageActions.Delete.OneFulfilled() type', () => {
        expect(new MessageActions.Delete.OneFulfilled(null).type).toBe(MessageActionEnum.DeleteOneFulfilled);
    });

    it('should check MessageActions.Delete.OneRejected() type', () => {
        expect(new MessageActions.Delete.OneRejected(null).type).toBe(MessageActionEnum.DeleteOneRejected);
    });

    it('should check MessageActions.Delete.OneReset() type', () => {
        expect(new MessageActions.Delete.OneReset(null).type).toBe(MessageActionEnum.DeleteOneReset);
    });

    it('should check MessageAttachmentActions.Create.All() type', () => {
        expect(new MessageAttachmentActions.Create.All(null).type).toBe(MessageAttachmentActionEnum.CreateAll);
    });
});
