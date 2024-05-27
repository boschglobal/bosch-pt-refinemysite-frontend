/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {MOCK_ACTIVITY_LIST} from '../../../../../test/mocks/activities';
import {ActivityService} from '../../api/activities/activity.service';
import {ActivityListResource} from '../../api/activities/resources/activity-list.resource';
import {
    ActivityActions,
    RequestAllActivitiesPayload
} from './activity.actions';
import {ActivityEffects} from './activity.effects';

describe('Activity Effects', () => {
    let activityEffects: ActivityEffects;
    let actions: ReplaySubject<any>;
    let activityService: any;

    const errorResponse: Observable<any> = throwError('error');
    const findAllActivitiesResponse: Observable<ActivityListResource> = of(MOCK_ACTIVITY_LIST);
    const requestAllActivitiesPayload: RequestAllActivitiesPayload = {
        taskId: 'foo',
        lastActivityId: 'bar',
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ActivityEffects,
            provideMockActions(() => actions),
            {
                provide: ActivityService,
                useValue: jasmine.createSpyObj('ActivityService', ['findAll'])
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        activityEffects = TestBed.inject(ActivityEffects);
        activityService = TestBed.inject(ActivityService);
        actions = new ReplaySubject(1);
    });

    it('should trigger a REQUEST_ALL_ACTIVITIES_FULFILLED action after requesting current task activities successfully', () => {
        const expectedResult = new ActivityActions.Request.AllFulfilled(MOCK_ACTIVITY_LIST);

        activityService.findAll.and.returnValue(findAllActivitiesResponse);
        actions.next(new ActivityActions.Request.All(requestAllActivitiesPayload));
        activityEffects.requestActivities$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a REQUEST_ALL_ACTIVITIES_REJECTED action after requesting current task activities has failed', () => {
        const expectedResult = new ActivityActions.Request.AllRejected();

        activityService.findAll.and.returnValue(errorResponse);
        actions.next(new ActivityActions.Request.All(requestAllActivitiesPayload));
        activityEffects.requestActivities$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });
});
