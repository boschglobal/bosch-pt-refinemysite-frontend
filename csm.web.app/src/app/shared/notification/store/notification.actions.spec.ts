/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    NotificationActionEnum,
    NotificationActions
} from './notification.actions';

describe('Notification Actions', () => {
    it('should check NotificationActions.Request.All() type', () => {
        expect(new NotificationActions.Request.All().type).toBe(NotificationActionEnum.RequestAll);
    });

    it('should check NotificationActions.Request.AllFulfilled() type', () => {
        expect(new NotificationActions.Request.AllFulfilled(null).type).toBe(NotificationActionEnum.RequestAllFulfilled);
    });

    it('should check NotificationActions.Request.AllRejected() type', () => {
        expect(new NotificationActions.Request.AllRejected().type).toBe(NotificationActionEnum.RequestAllRejected);
    });

    it('should check NotificationActions.Request.AllAfter() type', () => {
        expect(new NotificationActions.Request.AllAfter(null).type).toBe(NotificationActionEnum.RequestAllAfter);
    });

    it('should check NotificationActions.Request.AllAfterFulfilled() type', () => {
        expect(new NotificationActions.Request.AllAfterFulfilled(null).type).toBe(NotificationActionEnum.RequestAllAfterFulfilled);
    });

    it('should check NotificationActions.Request.AllAfterRejected() type', () => {
        expect(new NotificationActions.Request.AllAfterRejected().type).toBe(NotificationActionEnum.RequestAllAfterRejected);
    });

    it('should check NotificationActions.Request.AllBefore() type', () => {
        expect(new NotificationActions.Request.AllBefore(null).type).toBe(NotificationActionEnum.RequestAllBefore);
    });

    it('should check NotificationActions.Request.AllBeforeFulfilled() type', () => {
        expect(new NotificationActions.Request.AllBeforeFulfilled(null).type).toBe(NotificationActionEnum.RequestAllBeforeFulfilled);
    });

    it('should check NotificationActions.Request.AllBeforeRejected() type', () => {
        expect(new NotificationActions.Request.AllBeforeRejected().type).toBe(NotificationActionEnum.RequestAllBeforeRejected);
    });

    it('should check NotificationActions.Set.AsSeen() type', () => {
        expect(new NotificationActions.Set.AsSeen(null).type).toBe(NotificationActionEnum.SetAsSeen);
    });

    it('should check NotificationActions.Set.AsSeenFulfilled() type', () => {
        expect(new NotificationActions.Set.AsSeenFulfilled(null).type).toBe(NotificationActionEnum.SetAsSeenFulfilled);
    });

    it('should check NotificationActions.Set.AsSeenRejected() type', () => {
        expect(new NotificationActions.Set.AsSeenRejected(null).type).toBe(NotificationActionEnum.SetAsSeenRejected);
    });

    it('should check NotificationActions.Set.AsRead() type', () => {
        expect(new NotificationActions.Set.AsRead(null).type).toBe(NotificationActionEnum.SetAsRead);
    });

    it('should check NotificationActions.Set.AsReadFulfilled() type', () => {
        expect(new NotificationActions.Set.AsReadFulfilled(null).type).toBe(NotificationActionEnum.SetAsReadFulfilled);
    });

    it('should check NotificationActions.Set.AsReadRejected() type', () => {
        expect(new NotificationActions.Set.AsReadRejected(null).type).toBe(NotificationActionEnum.SetAsReadRejected);
    });

    it('should check NotificationActions.Set.LastAdded() type', () => {
        expect(new NotificationActions.Set.LastAdded(null).type).toBe(NotificationActionEnum.SetLastAdded);
    });
});
