/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {cloneDeep} from 'lodash';

import {TEST_USER_RESOURCE_REGISTERED} from '../../../../test/mocks/user';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {AbstractItemWithPicture} from '../../../shared/misc/store/datatypes/abstract-item-with-picture.datatype';
import {UserPrivacySettings} from '../../../shared/privacy/api/resources/user-privacy-settings.resource';
import {
    UserActionEnum,
    UserActions,
    UserPictureActions
} from './user.actions';
import {USER_SLICE_INITIAL_STATE} from './user.initial-state';
import {USER_REDUCER} from './user.reducer';
import {UserSlice} from './user.slice';

describe('User Reducer', () => {
    let initialState: UserSlice;
    let midState: UserSlice;
    let nextState: UserSlice;

    beforeEach(() => {
        initialState = USER_SLICE_INITIAL_STATE;
        midState = cloneDeep(USER_SLICE_INITIAL_STATE);
        nextState = cloneDeep(USER_SLICE_INITIAL_STATE);
    });

    it('should handle RequestCurrent', () => {
        const action: UserActions = {
            type: UserActionEnum.RequestCurrent,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestCurrentFulfilled', () => {
        const action: UserActions = {
            type: UserActionEnum.RequestCurrentFulfilled,
            payload: TEST_USER_RESOURCE_REGISTERED,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            id: TEST_USER_RESOURCE_REGISTERED.id,
            requestStatus: RequestStatusEnum.success,
        });

        nextState.items = [TEST_USER_RESOURCE_REGISTERED];
        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOne', () => {
        const action: UserActions = {
            type: UserActionEnum.CreateOne,
            payload: null,
            legalDocumentsIds: [],
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            dataRequestStatus: RequestStatusEnum.progress,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOne', () => {
        const action: UserActions = {
            type: UserActionEnum.UpdateOne,
            payload: null,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            dataRequestStatus: RequestStatusEnum.progress,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteUserPicture', () => {
        const action: UserPictureActions = new UserPictureActions.Delete.UserPicture();

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            pictureRequestStatus: RequestStatusEnum.progress,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateUserPicture', () => {
        const action: UserPictureActions = {
            type: UserActionEnum.CreateUserPicture,
            payload: null,
            isUserEdited: false,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
            pictureRequestStatus: RequestStatusEnum.progress,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle RequestCurrentRejected', () => {
        const action: UserActions = {
            type: UserActionEnum.RequestCurrentRejected,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), initialState.currentItem);

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneRejected', () => {
        const action: UserActions = {
            type: UserActionEnum.CreateOneRejected,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            dataRequestStatus: RequestStatusEnum.error,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneRejected', () => {
        const action: UserActions = {
            type: UserActionEnum.UpdateOneRejected,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            dataRequestStatus: RequestStatusEnum.error,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle DeleteUserPictureRejected', () => {
        const action: UserPictureActions = {
            type: UserActionEnum.DeleteUserPictureRejected,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            pictureRequestStatus: RequestStatusEnum.error,
        });

        nextState.currentItem.requestStatus = RequestStatusEnum.error;
        nextState.currentItem.pictureRequestStatus = RequestStatusEnum.error;
        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateUserPictureRejected', () => {
        const action: UserPictureActions = {
            type: UserActionEnum.CreateUserPictureRejected,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
            pictureRequestStatus: RequestStatusEnum.error,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateOneFulfilled', () => {
        const action: UserActions = {
            type: UserActionEnum.CreateOneFulfilled,
            payload: TEST_USER_RESOURCE_REGISTERED,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            dataRequestStatus: RequestStatusEnum.success,
            id: TEST_USER_RESOURCE_REGISTERED.id,
        });

        nextState.items = [TEST_USER_RESOURCE_REGISTERED];
        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle UpdateOneFulfilled', () => {
        const action: UserActions = {
            type: UserActionEnum.UpdateOneFulfilled,
            payload: TEST_USER_RESOURCE_REGISTERED,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            dataRequestStatus: RequestStatusEnum.success,
            id: TEST_USER_RESOURCE_REGISTERED.id,
        });

        nextState.items = [TEST_USER_RESOURCE_REGISTERED];
        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle CreateUserPictureFulfilled', () => {
        const action: UserPictureActions = {
            type: UserActionEnum.CreateUserPictureFulfilled,
            payload: null,
            isUserEdited: false,
        };

        nextState.currentItem = Object.assign(new AbstractItemWithPicture(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
            pictureRequestStatus: RequestStatusEnum.success,
        });

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetPrivacySettingsFulfilled', () => {
        const privacySettings = new UserPrivacySettings();
        const action: UserActions = new UserActions.Set.PrivacySettingsFulfilled(privacySettings);

        nextState.privacySettings = privacySettings;

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle SetPrivacySettingsRejected', () => {
        const action: UserActions = new UserActions.Set.PrivacySettingsRejected();

        midState.privacySettings = new UserPrivacySettings();

        nextState.privacySettings = null;

        expect(USER_REDUCER(midState, action)).toEqual(nextState);
    });

    it('should handle default', () => {
        const action: UserActions = {
            type: null,
        };

        expect(USER_REDUCER(initialState, action)).toEqual(nextState);
    });
});
