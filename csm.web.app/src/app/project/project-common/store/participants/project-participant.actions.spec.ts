/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ParticipantActionEnum,
    ProjectParticipantActions
} from '../../../../../app/project/project-common/store/participants/project-participant.actions';

describe('Project Participants Actions', () => {
    it('should check ProjectParticipantActions.Initialize.All() type', () => {
        expect(new ProjectParticipantActions.Initialize.All().type)
            .toBe(ParticipantActionEnum.InitializeAll);
    });

    it('should check ProjectParticipantActions.Initialize.Current() type', () => {
        expect(new ProjectParticipantActions.Initialize.Current().type)
            .toBe(ParticipantActionEnum.InitializeCurrent);
    });

    it('should check ProjectParticipantActions.Create.One() type', () => {
        expect(new ProjectParticipantActions.Create.One(null).type)
            .toBe(ParticipantActionEnum.CreateOne);
    });

    it('should check ProjectParticipantActions.Create.OneFulfilled() type', () => {
        expect(new ProjectParticipantActions.Create.OneFulfilled(null).type)
            .toBe(ParticipantActionEnum.CreateOneFulfilled);
    });

    it('should check ProjectParticipantActions.Create.OneRejected() type', () => {
        expect(new ProjectParticipantActions.Create.OneRejected().type)
            .toBe(ParticipantActionEnum.CreateOneRejected);
    });

    it('should check ProjectParticipantActions.Create.OneReset() type', () => {
        expect(new ProjectParticipantActions.Create.OneReset().type)
            .toBe(ParticipantActionEnum.CreateOneReset);
    });

    it('should check ProjectParticipantActions.Request.AllActive() type', () => {
        expect(new ProjectParticipantActions.Request.AllActive().type)
            .toBe(ParticipantActionEnum.RequestAllActive);
    });

    it('should check ProjectParticipantActions.Request.AllActiveFulfilled() type', () => {
        expect(new ProjectParticipantActions.Request.AllActiveFulfilled(null).type)
            .toBe(ParticipantActionEnum.RequestAllActiveFulfilled);
    });

    it('should check ProjectParticipantActions.Request.AllActiveRejected() type', () => {
        expect(new ProjectParticipantActions.Request.AllActiveRejected().type)
            .toBe(ParticipantActionEnum.RequestAllActiveRejected);
    });

    it('should check ProjectParticipantActions.Request.Page() type', () => {
        expect(new ProjectParticipantActions.Request.Page().type)
            .toBe(ParticipantActionEnum.RequestPage);
    });

    it('should check ProjectParticipantActions.Request.PageFulfilled() type', () => {
        expect(new ProjectParticipantActions.Request.PageFulfilled(null).type)
            .toBe(ParticipantActionEnum.RequestPageFulfilled);
    });

    it('should check ProjectParticipantActions.Request.PageRejected() type', () => {
        expect(new ProjectParticipantActions.Request.PageRejected().type)
            .toBe(ParticipantActionEnum.RequestPageRejected);
    });

    it('should check ProjectParticipantActions.Request.ByRole() type', () => {
        expect(new ProjectParticipantActions.Request.ActiveByRole(null).type)
            .toBe(ParticipantActionEnum.RequestActiveByRole);
    });

    it('should check ProjectParticipantActions.Request.ByRoleFulfilled() type', () => {
        expect(new ProjectParticipantActions.Request.ActiveByRoleFulfilled(null).type)
            .toBe(ParticipantActionEnum.RequestActiveByRoleFulfilled);
    });

    it('should check ProjectParticipantActions.Request.ByRoleRejected() type', () => {
        expect(new ProjectParticipantActions.Request.ActiveByRoleRejected().type)
            .toBe(ParticipantActionEnum.RequestActiveByRoleRejected);
    });

    it('should check ProjectParticipantActions.Set.Current() type', () => {
        expect(new ProjectParticipantActions.Set.Current(null).type)
            .toBe(ParticipantActionEnum.SetCurrent);
    });

    it('should check ProjectParticipantActions.Set.Page() type', () => {
        expect(new ProjectParticipantActions.Set.Page(null).type)
            .toBe(ParticipantActionEnum.SetPage);
    });

    it('should check ProjectParticipantActions.Set.Items() type', () => {
        expect(new ProjectParticipantActions.Set.Items(0).type)
            .toBe(ParticipantActionEnum.SetItems);
    });

    it('should check ProjectParticipantActions.Set.Sort() type', () => {
        expect(new ProjectParticipantActions.Set.Sort(null).type)
            .toBe(ParticipantActionEnum.SetSort);
    });

    it('should check ProjectParticipantActions.Request.One() type', () => {
        expect(new ProjectParticipantActions.Request.One(null).type)
            .toBe(ParticipantActionEnum.RequestOne);
    });

    it('should check ProjectParticipantActions.Request.OneFulfilled() type', () => {
        expect(new ProjectParticipantActions.Request.OneFulfilled(null).type)
            .toBe(ParticipantActionEnum.RequestOneFulfilled);
    });

    it('should check ProjectParticipantActions.Request.OneRejected() type', () => {
        expect(new ProjectParticipantActions.Request.OneRejected().type)
            .toBe(ParticipantActionEnum.RequestOneRejected);
    });

    it('should check ProjectParticipantActions.Request.Current() type', () => {
        expect(new ProjectParticipantActions.Request.Current().type)
            .toBe(ParticipantActionEnum.RequestCurrent);
    });

    it('should check ProjectParticipantActions.Request.CurrentFulfilled() type', () => {
        expect(new ProjectParticipantActions.Request.CurrentFulfilled(null).type)
            .toBe(ParticipantActionEnum.RequestCurrentFulfilled);
    });

    it('should check ProjectParticipantActions.Request.CurrentRejected() type', () => {
        expect(new ProjectParticipantActions.Request.CurrentRejected().type)
            .toBe(ParticipantActionEnum.RequestCurrentRejected);
    });

    it('should check ProjectParticipantActions.Delete.One() type', () => {
        expect(new ProjectParticipantActions.Delete.One(null).type)
            .toBe(ParticipantActionEnum.DeleteOne);
    });

    it('should check ProjectParticipantActions.Delete.OneFulfilled() type', () => {
        expect(new ProjectParticipantActions.Delete.OneFulfilled(null).type)
            .toBe(ParticipantActionEnum.DeleteOneFulfilled);
    });

    it('should check ProjectParticipantActions.Delete.OneRejected() type', () => {
        expect(new ProjectParticipantActions.Delete.OneRejected().type)
            .toBe(ParticipantActionEnum.DeleteOneRejected);
    });

    it('should check ProjectParticipantActions.Delete.OneReset() type', () => {
        expect(new ProjectParticipantActions.Delete.OneReset().type)
            .toBe(ParticipantActionEnum.DeleteOneReset);
    });

    it('should check ProjectParticipantActions.Update.One() type', () => {
        expect(new ProjectParticipantActions.Update.One(null, null, null).type)
            .toBe(ParticipantActionEnum.UpdateOne);
    });

    it('should check ProjectParticipantActions.Update.OneFulfilled() type', () => {
        expect(new ProjectParticipantActions.Update.OneFulfilled(null).type)
            .toBe(ParticipantActionEnum.UpdateOneFulfilled);
    });

    it('should check ProjectParticipantActions.Update.OneRejected() type', () => {
        expect(new ProjectParticipantActions.Update.OneRejected().type)
            .toBe(ParticipantActionEnum.UpdateOneRejected);
    });

    it('should check ProjectParticipantAction.Set.ListFilters() type', () => {
        expect(new ProjectParticipantActions.Set.ListFilters(null).type)
            .toBe(ParticipantActionEnum.SetListFilters);
    });

    it('should check ProjectParticipantAction.Request.ResendInvitation()', () => {
        expect(new ProjectParticipantActions.Request.ResendInvitation('').type)
            .toBe(ParticipantActionEnum.RequestResendInvitation);
    });

    it('should check ProjectParticipantAction.Request.ResendInvitationFulfilled()', () => {
        expect(new ProjectParticipantActions.Request.ResendInvitationFulfilled().type)
            .toBe(ParticipantActionEnum.RequestResendInvitationFulfilled);
    });

    it('should check ProjectParticipantAction.Request.ResendInvitationRejected()', () => {
        expect(new ProjectParticipantActions.Request.ResendInvitationRejected().type)
            .toBe(ParticipantActionEnum.RequestResendInvitationRejected);
    });

    it('should check ProjectParticipantAction.Request.ResendInvitationReset()', () => {
        expect(new ProjectParticipantActions.Request.ResendInvitationReset().type)
            .toBe(ParticipantActionEnum.RequestResendInvitationReset);
    });
});
