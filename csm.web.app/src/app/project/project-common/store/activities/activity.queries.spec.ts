/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {
    MOCK_ACTIVITY_1,
    MOCK_ACTIVITY_2
} from '../../../../../test/mocks/activities';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ActivityResource} from '../../api/activities/resources/activity.resource';
import {ActivityQueries} from './activity.queries';

describe('Activity Queries', () => {
    let activityQueries: ActivityQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            ActivityQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            activitySlice: {
                                currentItem: {
                                    requestStatus: RequestStatusEnum.success
                                },
                                list: {
                                    ids: [MOCK_ACTIVITY_1.id, MOCK_ACTIVITY_2.id],
                                    requestStatus: RequestStatusEnum.success,
                                    _links: {
                                        prev: {
                                            href: ''
                                        }
                                    }
                                },
                                items: [MOCK_ACTIVITY_1, MOCK_ACTIVITY_2]
                            },
                        }
                    }
                )
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => activityQueries = TestBed.inject(ActivityQueries));

    it('should observe activities', () => {
        activityQueries
            .observeActivities()
            .subscribe((result: ActivityResource[]) =>
                expect(result).toEqual([MOCK_ACTIVITY_1, MOCK_ACTIVITY_2]));
    });

    it('should observe activities request status', () => {
        activityQueries
            .observeActivitiesRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe activities has more items', () => {
        activityQueries
            .observeActivitiesHasMoreItems()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });
});
