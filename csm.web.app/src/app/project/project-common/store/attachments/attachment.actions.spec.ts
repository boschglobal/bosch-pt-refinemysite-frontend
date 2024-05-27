/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    AttachmentActionEnum,
    AttachmentActions
} from './attachment.actions';

describe('Attachment Actions', () => {
    it('should check AttachmentActions.Initialize.All() type', () => {
        expect(new AttachmentActions.Initialize.All().type).toBe(AttachmentActionEnum.InitializeAll);
    });

    it('should check AttachmentActions.Remove.AllByMessage() type', () => {
        expect(new AttachmentActions.Remove.AllByMessage(null).type).toBe(AttachmentActionEnum.RemoveAllByMessage);
    });

    it('should check AttachmentActions.Remove.AllByTopic() type', () => {
        expect(new AttachmentActions.Remove.AllByTopic(null).type).toBe(AttachmentActionEnum.RemoveAllByTopic);
    });

    it('should check AttachmentActions.Delete.One() type', () => {
        expect(new AttachmentActions.Delete.One(null).type).toBe(AttachmentActionEnum.DeleteOne);
    });

    it('should check AttachmentActions.Delete.OneFulfilled() type', () => {
        expect(new AttachmentActions.Delete.OneFulfilled(null).type).toBe(AttachmentActionEnum.DeleteOneFulfilled);
    });

    it('should check AttachmentActions.Delete.OneRejected() type', () => {
        expect(new AttachmentActions.Delete.OneRejected().type).toBe(AttachmentActionEnum.DeleteOneRejected);
    });

    it('should check AttachmentActions.Delete.OneReset() type', () => {
        expect(new AttachmentActions.Delete.OneReset().type).toBe(AttachmentActionEnum.DeleteOneReset);
    });

    it('should check AttachmentActions.Request.AllByTask() type', () => {
        expect(new AttachmentActions.Request.AllByTask(null).type).toBe(AttachmentActionEnum.RequestAllByTask);
    });

    it('should check AttachmentActions.Request.AllByTaskFulfilled() type', () => {
        expect(new AttachmentActions.Request.AllByTaskFulfilled(null).type).toBe(AttachmentActionEnum.RequestAllByTaskFulfilled);
    });

    it('should check AttachmentActions.Request.AllByTaskRejected() type', () => {
        expect(new AttachmentActions.Request.AllByTaskRejected(null).type).toBe(AttachmentActionEnum.RequestAllByTaskRejected);
    });
});
