/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    UserActionEnum,
    UserActions,
    UserPictureActions
} from './user.actions';

describe('User Actions', () => {
    it('should check Request.Current() type', () => {
        expect(new UserActions.Request.Current().type).toBe(UserActionEnum.RequestCurrent);
    });

    it('should check Request.CurrentFulfilled() type', () => {
        expect(new UserActions.Request.CurrentFulfilled(null).type).toBe(UserActionEnum.RequestCurrentFulfilled);
    });

    it('should check Request.CurrentRejected() type', () => {
        expect(new UserActions.Request.CurrentRejected().type).toBe(UserActionEnum.RequestCurrentRejected);
    });

    it('should check Request.PrivacySettings() type', () => {
        expect(new UserActions.Request.PrivacySettings().type).toBe(UserActionEnum.RequestPrivacySettings);
    });

    it('should check Create.One() type', () => {
        expect(new UserActions.Create.One(null, null).type).toBe(UserActionEnum.CreateOne);
    });

    it('should check Create.OneFulfilled() type', () => {
        expect(new UserActions.Create.OneFulfilled(null).type).toBe(UserActionEnum.CreateOneFulfilled);
    });

    it('should check Create.OneRejected() type', () => {
        expect(new UserActions.Create.OneRejected().type).toBe(UserActionEnum.CreateOneRejected);
    });

    it('should check Update.One() type', () => {
        expect(new UserActions.Update.One(null).type).toBe(UserActionEnum.UpdateOne);
    });

    it('should check Update.OneFulfilled() type', () => {
        expect(new UserActions.Update.OneFulfilled(null).type).toBe(UserActionEnum.UpdateOneFulfilled);
    });

    it('should check Update.OneRejected() type', () => {
        expect(new UserActions.Update.OneRejected().type).toBe(UserActionEnum.UpdateOneRejected);
    });

    it('should check Set.PrivacySettings() type', () => {
        expect(new UserActions.Set.PrivacySettings(null).type).toBe(UserActionEnum.SetPrivacySettings);
    });

    it('should check Set.PrivacySettingsFulfilled() type', () => {
        expect(new UserActions.Set.PrivacySettingsFulfilled(null).type).toBe(UserActionEnum.SetPrivacySettingsFulfilled);
    });

    it('should check Set.PrivacySettingsRejected() type', () => {
        expect(new UserActions.Set.PrivacySettingsRejected().type).toBe(UserActionEnum.SetPrivacySettingsRejected);
    });

    it('should check CreateOrUpdate.UserPicture() type', () => {
        expect(new UserPictureActions.CreateOrUpdate.UserPicture(null).type).toBe(UserActionEnum.CreateUserPicture);
    });

    it('should check CreateOrUpdate.UserPicture() type', () => {
        expect(new UserPictureActions.CreateOrUpdate.UserPictureFulfilled(null).type).toBe(UserActionEnum.CreateUserPictureFulfilled);
    });

    it('should check CreateOrUpdate.UserPicture() type', () => {
        expect(new UserPictureActions.CreateOrUpdate.UserPictureRejected().type).toBe(UserActionEnum.CreateUserPictureRejected);
    });

    it('should check Delete.UserPicture() type', () => {
        expect(new UserPictureActions.Delete.UserPicture(null).type).toBe(UserActionEnum.DeleteUserPicture);
    });

    it('should check CreateOrUpdate.UserPicture() type', () => {
        expect(new UserPictureActions.Delete.UserPictureFulfilled(null).type).toBe(UserActionEnum.DeleteUserPictureFulfilled);
    });

    it('should check CreateOrUpdate.UserPicture() type', () => {
        expect(new UserPictureActions.Delete.UserPictureRejected().type).toBe(UserActionEnum.DeleteUserPictureRejected);
    });
});
