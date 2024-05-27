/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../test/mocks/store';
import {
    TEST_USER_RESOURCE_REGISTERED,
    TEST_USER_SLICE
} from '../../../../test/mocks/user';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {UserQueries} from './user.queries';

describe('User Queries', () => {
    let userQueries: UserQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        userModule: {
                            userSlice: TEST_USER_SLICE,
                        },
                    }
                ),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => userQueries = TestBed.inject(UserQueries));

    it('should get user id', () => {
        expect(userQueries.getCurrentState()).toBe(TEST_USER_RESOURCE_REGISTERED);
    });

    it('should check if user is loaded', () => {
        expect(userQueries.isCurrentUserLoaded()).toBeTruthy();
    });

    it('should observe current user', () => {
        userQueries
            .observeCurrentUser()
            .subscribe(result => {
                expect(result).toEqual(TEST_USER_RESOURCE_REGISTERED);
            });
    });

    it('should observe current user status', () => {
        userQueries
            .observeCurrentUserRequestStatus()
            .subscribe(result => {
                expect(result).toEqual(RequestStatusEnum.success);
            });
    });

    it('should check if user has edit profile permission', () => {
        expect(userQueries.hasEditProfilePermission()).toBeTruthy();
    });

    it('should retrieve current user request status', () => {
        expect(userQueries.getCurrentUserRequestStatus()).toBe(TEST_USER_SLICE.currentItem.requestStatus);
    });

    it('should observe user privacy settings', () => {
        userQueries
            .observeUserPrivacySettings()
            .subscribe(result => {
                expect(result).toEqual(TEST_USER_SLICE.privacySettings);
            });
    });
});
