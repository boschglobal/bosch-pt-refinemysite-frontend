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
import {ActivatedRouteSnapshot} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {
    Observable,
    ReplaySubject
} from 'rxjs';

import {MOCK_PARTICIPANT} from '../../../../test/mocks/participants';
import {MockStore} from '../../../../test/mocks/store';
import {ActivatedRouteStub} from '../../../../test/stubs/activated-route.stub';
import {ProjectParticipantActions} from '../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../project-common/store/participants/project-participant.queries';
import {ParticipantResolverGuard} from './participant-resolver.guard';

describe('Participant Resolver Guard', () => {
    let guard: ParticipantResolverGuard;
    let projectParticipantQueries: ProjectParticipantQueries;
    let actions: ReplaySubject<any>;
    const activatedRoute: ActivatedRouteStub = new ActivatedRouteStub();
    activatedRoute.testParamMap = {participantId: '123'};
    const activatedRouteSnapshotMock: ActivatedRouteSnapshot = activatedRoute.snapshot as ActivatedRouteSnapshot;

    const moduleDef: TestModuleMetadata = {
        imports: [RouterTestingModule],
        providers: [
            provideMockActions(() => actions),
            {
                provide: Store,
                useValue: new MockStore({})
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        guard = TestBed.inject(ParticipantResolverGuard);
        projectParticipantQueries = TestBed.inject(ProjectParticipantQueries);
        actions = new ReplaySubject(1);
    });

    it('should allow navigation when participant is in cache', () => {
        spyOn(projectParticipantQueries, 'hasParticipantById').and.returnValue(true);
        expect(guard.canActivate(activatedRouteSnapshotMock, null)).toBeTruthy();
    });

    it('should should wait for request of current participant to validate navigation', waitForAsync(() => {
        spyOn(projectParticipantQueries, 'hasParticipantById').and.returnValue(false);
        const canActivate$ = guard.canActivate(activatedRouteSnapshotMock, null) as Observable<boolean>;

        actions.next(new ProjectParticipantActions.Request.CurrentFulfilled(MOCK_PARTICIPANT));

        canActivate$.subscribe((result) => {
            expect(result).toBeTruthy();
        });
    }));
});
