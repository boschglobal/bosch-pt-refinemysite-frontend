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
import {
    select,
    Store
} from '@ngrx/store';
import {provideMockStore} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2,
    MOCK_PARTICIPANT_3,
    MOCK_PARTICIPANT_4
} from '../../../../../test/mocks/participants';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {ProjectSliceService} from '../projects/project-slice.service';
import {
    ParticipantByCompany,
    ProjectParticipantQueries
} from './project-participant.queries';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

describe('Project Participant Queries', () => {
    let projectParticipantQueries: ProjectParticipantQueries;
    let store: any;

    const projectSliceServiceMock: ProjectSliceService = mock(ProjectSliceService);

    const initialState = {
        projectModule: {
            projectSlice: {
                currentItem: {
                    id: MOCK_PARTICIPANT.project.id,
                },
            },
            projectParticipantSlice: {
                currentItem: {
                    id: MOCK_PARTICIPANT.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2, MOCK_PARTICIPANT_3, MOCK_PARTICIPANT_4],
                list: {
                    ids: [MOCK_PARTICIPANT.id],
                    requestStatus: RequestStatusEnum.success,
                    filters: {status: [ParticipantStatusEnum.ACTIVE]},
                    pagination: new PaginatorData(),
                    pages: ['0'],
                    _links: {
                        assign: {
                            href: '',
                        },
                    },
                },
                fullList: {
                    ids: [MOCK_PARTICIPANT_2.id, MOCK_PARTICIPANT_4.id],
                },
            },
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectParticipantQueries,
            {
                provide: ProjectSliceService,
                useFactory: () => instance(projectSliceServiceMock),
            },
            provideMockStore({initialState}),
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectParticipantQueries = TestBed.inject(ProjectParticipantQueries);

        store = TestBed.inject(Store);
        store.setState(initialState);

        when(projectSliceServiceMock.getCurrentProjectId()).thenReturn(MOCK_PARTICIPANT.project.id);
    });

    it('should retrieve participant display name for the given id', () => {
        const participantName = ProjectParticipantQueries.getParticipantName({participantId: MOCK_PARTICIPANT.id}) as any;

        store.pipe(
            select(participantName))
            .subscribe((result) => expect(result).toBe(MOCK_PARTICIPANT.user.displayName));
    });

    it('should retrieve null if the given id don\'t exist in store', () => {
        const fakeId = 'xxx';
        const participantId = ProjectParticipantQueries.getParticipantName({participantId: fakeId}) as any;

        store.pipe(
            select(participantId))
            .subscribe((result) => expect(result).toBe(null));
    });

    it('should retrieve participants from project present on the store', () => {
        const selectParticipants = projectParticipantQueries.getParticipantsOfProject('4');
        store.pipe(
            select(selectParticipants)
        ).subscribe(participants => expect(participants).toEqual([MOCK_PARTICIPANT, MOCK_PARTICIPANT_2,
            MOCK_PARTICIPANT_3, MOCK_PARTICIPANT_4]));
    });

    it('should retrieve all participants from project', () => {
        const selectParticipants = projectParticipantQueries.getAllParticipantsOfProject('4');
        store.pipe(
            select(selectParticipants)
        ).subscribe(participants => expect(participants).toEqual([MOCK_PARTICIPANT_2, MOCK_PARTICIPANT_4]));
    });

    it('should check that user has permission to invite participants', () => {
        expect(projectParticipantQueries.hasInviteProjectParticipantPermission()).toBeTruthy();
    });

    it('should check that a participant with given id exists in the store', () => {
        expect(projectParticipantQueries.hasParticipantById(MOCK_PARTICIPANT.id)).toBeTruthy();
    });

    it('should observe that user has permission to invite participants', () => {
        projectParticipantQueries
            .observeInviteProjectParticipantPermission()
            .subscribe((result) => {
                expect(result).toBeTruthy();
            });
    });

    it('should observe current participant request status', () => {
        projectParticipantQueries
            .observeCurrentProjectParticipantRequestStatus()
            .subscribe((result) => {
                expect(result).toBe(RequestStatusEnum.success);
            });
    });

    it('should observe current participant', () => {
        projectParticipantQueries
            .observeCurrentProjectParticipant()
            .subscribe((result) => {
                expect(result).toEqual(MOCK_PARTICIPANT);
            });
    });

    it('should observe current participant id', () => {
        projectParticipantQueries
            .observeCurrentProjectParticipantId()
            .subscribe((result) => {
                expect(result).toBe(MOCK_PARTICIPANT.id);
            });
    });

    it('should observe participant with given id', () => {
        projectParticipantQueries
            .observeProjectParticipantById(MOCK_PARTICIPANT.id)
            .subscribe((result) => {
                expect(result).toEqual(MOCK_PARTICIPANT);
            });
    });

    it('should observe active participants by role', () => {
        projectParticipantQueries
            .observeActiveParticipantsByRole(MOCK_PARTICIPANT.projectRole)
            .subscribe((result) => {
                expect(result).toEqual([MOCK_PARTICIPANT]);
            });
    });

    it('should observe active participants separated by companies', () => {
        const expectedResult: ParticipantByCompany[] = [{
            id: MOCK_PARTICIPANT.company.id,
            displayName: MOCK_PARTICIPANT.company.displayName,
            participants: [MOCK_PARTICIPANT_2],
        }];
        projectParticipantQueries
            .observeActiveParticipantsByCompanies()
            .subscribe((result) => {
                expect(result).toEqual(expectedResult);
            });
    });

    it('should not find any participants for missing role', () => {
        projectParticipantQueries
            .observeActiveParticipantsByRole('dummyRole')
            .subscribe((result) => {
                expect(result).toEqual([]);
            });
    });

    it('should retrieve participants list filters on the store', () => {
        const selectListFilters = projectParticipantQueries.getParticipantListFilters();
        store.pipe(
            select(selectListFilters)
        ).subscribe(filters => expect(filters).toEqual({status: [ParticipantStatusEnum.ACTIVE]}));
    });

    it('should observe current participant page initialized status', () => {
        projectParticipantQueries
            .observeCurrentParticipantPageInitialized()
            .subscribe((result: boolean) => expect(result).toBeTruthy());
    });

    it('should observe current participant list filters pending status active state and return TRUE if status filters ' +
        'are the valid ones', () => {
        const newState = cloneDeep(initialState);
        newState.projectModule.projectParticipantSlice.list.filters = {
            status: ProjectParticipantFilters.getParticipantPendingStatus(),
        };

        store.setState(newState);

        projectParticipantQueries
            .observeCurrentParticipantListFiltersPendingStatusActive()
            .subscribe((result: boolean) => expect(result).toBeTruthy());
    });

    it('should observe current participant list filters pending status active state and return FALSE if status filters ' +
        'are not the valid ones', () => {
        const newState = cloneDeep(initialState);
        newState.projectModule.projectParticipantSlice.list.filters = {
            status: [ParticipantStatusEnum.ACTIVE],
        };

        store.setState(newState);

        projectParticipantQueries
            .observeCurrentParticipantListFiltersPendingStatusActive()
            .subscribe((result: boolean) => expect(result).toBeFalsy());
    });

    it('should observe current participant list filters pending status active state and return FALSE if status filters ' +
        'are not set', () => {
        const newState = cloneDeep(initialState);
        newState.projectModule.projectParticipantSlice.list.filters = {
            status: null,
        };

        store.setState(newState);

        projectParticipantQueries
            .observeCurrentParticipantListFiltersPendingStatusActive()
            .subscribe((result: boolean) => expect(result).toBeFalsy());
    });
});
