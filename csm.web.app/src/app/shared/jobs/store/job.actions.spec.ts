/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    JobActionEnum,
    JobActions
} from './job.actions';

describe('Job Actions', () => {
    it('should check JobActions.Request.All() type', () => {
        expect(new JobActions.Request.All().type).toBe(JobActionEnum.RequestAll);
    });

    it('should check JobActions.Request.AllFulfilled() type', () => {
        expect(new JobActions.Request.AllFulfilled(null).type).toBe(JobActionEnum.RequestAllFulfilled);
    });

    it('should check JobActions.Request.AllRejected() type', () => {
        expect(new JobActions.Request.AllRejected().type).toBe(JobActionEnum.RequestAllRejected);
    });

    it('should check JobActions.Set.ListAsSeen() type', () => {
        expect(new JobActions.Set.ListAsSeen(null).type).toBe(JobActionEnum.SetListAsSeen);
    });

    it('should check JobActions.Set.ListAsSeenFulfilled() type', () => {
        expect(new JobActions.Set.ListAsSeenFulfilled(null).type).toBe(JobActionEnum.SetListAsSeenFulfilled);
    });

    it('should check JobActions.Set.ListAsSeenRejected() type', () => {
        expect(new JobActions.Set.ListAsSeenRejected().type).toBe(JobActionEnum.SetListAsSeenRejected);
    });

    it('should check JobActions.Set.JobAsRead() type', () => {
        expect(new JobActions.Set.JobAsRead(null).type).toBe(JobActionEnum.SetJobAsRead);
    });

    it('should check JobActions.Set.JobAsReadFulfilled() type', () => {
        expect(new JobActions.Set.JobAsReadFulfilled(null).type).toBe(JobActionEnum.SetJobAsReadFulfilled);
    });

    it('should check JobActions.Set.JobAsReadRejected() type', () => {
        expect(new JobActions.Set.JobAsReadRejected(null).type).toBe(JobActionEnum.SetJobAsReadRejected);
    });

    it('should check JobActions.Set.JobToWatch() type', () => {
        expect(new JobActions.Set.JobToWatch(null).type).toBe(JobActionEnum.SetJobToWatch);
    });

    it('should check JobActions.Unset.JobToWatch() type', () => {
        expect(new JobActions.Unset.JobToWatch(null).type).toBe(JobActionEnum.UnsetJobToWatch);
    });

    it('should check JobActions.Update.OneFulfilled() type', () => {
        expect(new JobActions.Update.OneFulfilled(null).type).toBe(JobActionEnum.UpdateOneFulfilled);
    });
});
