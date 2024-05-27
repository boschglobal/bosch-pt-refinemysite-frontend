/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    fakeAsync,
    TestBed,
    TestModuleMetadata,
    tick,
    waitForAsync
} from '@angular/core/testing';
import {provideMockActions} from '@ngrx/effects/testing';
import {Store} from '@ngrx/store';
import {cloneDeep} from 'lodash';
import {
    Observable,
    of,
    ReplaySubject,
    throwError
} from 'rxjs';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANT_2,
    MOCK_PARTICIPANT_4,
    MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE,
    MOCK_PARTICIPANTS_LIST_ONE_OF_TWO_PAGE,
    MOCK_PARTICIPANTS_LIST_TWO_OF_TWO_PAGE,
    MOCK_POST_PARTICIPANT_ACTIVE_SUCCESS_ALERT_PAYLOAD,
    MOCK_POST_PARTICIPANT_INVITED_SUCCESS_ALERT_PAYLOAD,
    MOCK_POST_PARTICIPANT_PAYLOAD,
    MOCK_PUT_PARTICIPANT_PAYLOAD,
} from '../../../../../test/mocks/participants';
import {MOCK_PROJECT_1} from '../../../../../test/mocks/projects';
import {MockStore} from '../../../../../test/mocks/store';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertTypeEnum} from '../../../../shared/alert/enums/alert-type.enum';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {ProjectParticipantsService} from '../../api/participants/project-participants.service';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectParticipantListResource} from '../../api/participants/resources/project-participant-list.resource';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {ProjectParticipantActions} from './project-participant.actions';
import {ProjectParticipantsEffects} from './project-participant.effects';
import {PROJECT_PARTICIPANT_SLICE_INITIAL_STATE} from './project-participant.initial-state';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

describe('Project Participants Effects', () => {
    let projectParticipantsEffects: ProjectParticipantsEffects;
    let projectParticipantsService: any;
    let store: any;
    let actions: ReplaySubject<any>;

    const deleteParticipantResponse: Observable<{}> = of({});
    const errorResponse: Observable<any> = throwError('error');
    const inviteParticipantResponse: Observable<ProjectParticipantResource> = of(MOCK_PARTICIPANT);
    const updateParticipantResponse: Observable<ProjectParticipantResource> = of(MOCK_PARTICIPANT);
    const getParticipantsOneOfOnePageResponse: Observable<ProjectParticipantListResource> = of(MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE);
    const getParticipantsOneOfTwoPageResponse: Observable<ProjectParticipantListResource> = of(MOCK_PARTICIPANTS_LIST_ONE_OF_TWO_PAGE);
    const getParticipantsTwoOfTwoPageResponse: Observable<ProjectParticipantListResource> = of(MOCK_PARTICIPANTS_LIST_TWO_OF_TWO_PAGE);
    const findOneResponse: Observable<ProjectParticipantResource> = of(MOCK_PARTICIPANT);

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectParticipantsEffects,
            provideMockActions(() => actions),
            {
                provide: ProjectParticipantsService,
                useValue: jasmine.createSpyObj('ProjectParticipantsService', [
                    'invite',
                    'findAll',
                    'findOne',
                    'delete',
                    'update',
                    'resendInvitation',
                ]),
            },
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            projectSlice: {
                                items: [MOCK_PARTICIPANT, MOCK_PARTICIPANT_2],
                                currentItem: {
                                    id: MOCK_PROJECT_1.id
                                }
                            },
                            projectParticipantSlice: cloneDeep(PROJECT_PARTICIPANT_SLICE_INITIAL_STATE)
                        }
                    }
                )
            }
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectParticipantsEffects = TestBed.inject(ProjectParticipantsEffects);
        projectParticipantsService = TestBed.inject(ProjectParticipantsService);
        store = TestBed.inject(Store);
        actions = new ReplaySubject(1);

        projectParticipantsService.findAll.calls.reset();
    });

    it('should trigger a ProjectParticipantActions.Request.Current action after setting current participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.Current();

        actions.next(new ProjectParticipantActions.Set.Current(null));
        projectParticipantsEffects.triggerRequestActions$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.CurrentFulfilled action after requesting current participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.CurrentFulfilled(MOCK_PARTICIPANT);

        projectParticipantsService.findOne.and.returnValue(findOneResponse);
        actions.next(new ProjectParticipantActions.Request.Current());
        projectParticipantsEffects.requestCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.CurrentRejected action after requesting current participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.CurrentRejected();

        projectParticipantsService.findOne.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.Current());
        projectParticipantsEffects.requestCurrent$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.OneFulfilled action after requesting participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.OneFulfilled(MOCK_PARTICIPANT);

        projectParticipantsService.findOne.and.returnValue(findOneResponse);
        actions.next(new ProjectParticipantActions.Request.One(null));
        projectParticipantsEffects.requestParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.OneRejected action after requesting participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.OneRejected();

        projectParticipantsService.findOne.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.One(null));
        projectParticipantsEffects.requestParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Create.OneFulfilled action after inviting a participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Create.OneFulfilled(MOCK_PARTICIPANT);

        projectParticipantsService.invite.and.returnValue(inviteParticipantResponse);
        actions.next(new ProjectParticipantActions.Create.One(MOCK_POST_PARTICIPANT_PAYLOAD));
        projectParticipantsEffects.inviteParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Create.OneRejected action after the invite of a participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Create.OneRejected();

        projectParticipantsService.invite.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Create.One(MOCK_POST_PARTICIPANT_PAYLOAD));
        projectParticipantsEffects.inviteParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectParticipantActions.Create.OneFulfilled ' +
        'action is triggered for a active participant', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_POST_PARTICIPANT_ACTIVE_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectParticipantActions.Create.OneFulfilled(MOCK_PARTICIPANT));
        projectParticipantsEffects.inviteParticipantSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payloadPart).toEqual(expectedResult.payloadPart);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after a ProjectParticipantActions.Create.OneFulfilled ' +
        'action is triggered for a invited participant', () => {
        const expectedResult = new AlertActions.Add.SuccessAlert(MOCK_POST_PARTICIPANT_INVITED_SUCCESS_ALERT_PAYLOAD);

        actions.next(new ProjectParticipantActions.Create.OneFulfilled(MOCK_PARTICIPANT_4));
        projectParticipantsEffects.inviteParticipantSuccess$.subscribe(result => {
            expect(result.type).toBe(expectedResult.type);
            expect(result.payloadPart).toEqual(expectedResult.payloadPart);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.AllFulfilled action after requesting participants successfully when there\s only one page of participants', () => {
        const expectedResult = new ProjectParticipantActions.Request.AllActiveFulfilled(MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE);

        projectParticipantsService.findAll.and.returnValue(getParticipantsOneOfOnePageResponse);
        actions.next(new ProjectParticipantActions.Request.AllActive());
        projectParticipantsEffects.requestAllActiveParticipants$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(projectParticipantsService.findAll).toHaveBeenCalledTimes(1);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.AllFulfilled action after requesting participants successfully when there are two pages of participants', () => {
        const expectedPayload = Object.assign({}, MOCK_PARTICIPANTS_LIST_ONE_OF_TWO_PAGE, {
            items: [...MOCK_PARTICIPANTS_LIST_ONE_OF_TWO_PAGE.items, ...MOCK_PARTICIPANTS_LIST_TWO_OF_TWO_PAGE.items],
        });
        const expectedResult = new ProjectParticipantActions.Request.AllActiveFulfilled(expectedPayload);

        projectParticipantsService.findAll.and.returnValue(getParticipantsOneOfTwoPageResponse, getParticipantsTwoOfTwoPageResponse);
        actions.next(new ProjectParticipantActions.Request.AllActive());
        projectParticipantsEffects.requestAllActiveParticipants$.subscribe(result => {
            expect(result).toEqual(expectedResult);
            expect(projectParticipantsService.findAll).toHaveBeenCalledTimes(2);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.AllFulfilled action after requesting participants successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.AllActiveFulfilled(MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE);

        projectParticipantsService.findAll.and.returnValue(getParticipantsOneOfOnePageResponse);
        actions.next(new ProjectParticipantActions.Request.AllActive());
        projectParticipantsEffects.requestAllActiveParticipants$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.AllRejected action after requesting participants has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.AllActiveRejected();

        projectParticipantsService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.AllActive());
        projectParticipantsEffects.requestAllActiveParticipants$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.Page action after the pagination page changes', fakeAsync(() => {
        const expectedResult = new ProjectParticipantActions.Request.Page();
        let resultFromEffect = null;

        actions.next(new ProjectParticipantActions.Set.Page(1));
        projectParticipantsEffects.triggerRequestParticipantsByPageActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectParticipantActions.Request.PageFulfilled action after requesting participants successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.PageFulfilled(MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE);

        projectParticipantsService.findAll.and.returnValue(getParticipantsOneOfOnePageResponse);
        actions.next(new ProjectParticipantActions.Request.Page());
        projectParticipantsEffects.requestParticipantsPage$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.PageRejected action after requesting participants has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.PageRejected();

        projectParticipantsService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.Page());
        projectParticipantsEffects.requestParticipantsPage$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Delete.OneFulfilled after deleting a project participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Delete.OneFulfilled(MOCK_PARTICIPANT.id);

        projectParticipantsService.delete.and.returnValue(deleteParticipantResponse);
        actions.next(new ProjectParticipantActions.Delete.One(MOCK_PARTICIPANT.id));
        projectParticipantsEffects.deleteParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Delete.OneRejected action after deleting a project participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Delete.OneRejected();

        projectParticipantsService.delete.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Delete.One(MOCK_PARTICIPANT.id));
        projectParticipantsEffects.deleteParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert and ProjectParticipantActions.Set.Page actions after deleting the last project participant in one page successfully', () => {
        const resultFromEffect = [];
        const key = 'Participant_Delete_PartialSuccessMessage';
        const expectedFirsResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});
        const expectedSecondResult = new ProjectParticipantActions.Set.Page(1);

        const mockList = {
            pages: [
                [MOCK_PARTICIPANT.id],
                [MOCK_PARTICIPANT.id],
                [MOCK_PARTICIPANT.id]
            ],
            pagination: {
                entries: 0,
                items: 10,
                page: 2,
            },
            sort: {
                field: 'user',
                direction: SortDirectionEnum.asc,
            },
            requestStatus: RequestStatusEnum.progress,
        };

        store._value.projectModule.projectParticipantSlice.list = mockList;

        actions.next(new ProjectParticipantActions.Delete.OneFulfilled(MOCK_PARTICIPANT.id));

        projectParticipantsEffects.deleteParticipantSuccess$.subscribe(result => {
            resultFromEffect.push(result);
        });

        expect(resultFromEffect.length).toEqual(2);

        expect(resultFromEffect[0].type).toBe(expectedFirsResult.type);
        expect(resultFromEffect[0].payload.type).toBe(expectedFirsResult.payload.type);
        expect(resultFromEffect[0].payload.message).toEqual(expectedFirsResult.payload.message);

        expect(resultFromEffect[1]).toEqual(expectedSecondResult);
    });

    it('should trigger a AlertActions.Add.SuccessAlert and ProjectParticipantActions.Set.Page actions after deleting the last ' +
        'project participant in the last page successfully', () => {
        const resultFromEffect = [];
        const key = 'Participant_Delete_PartialSuccessMessage';
        const expectedFirstResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});
        const expectedSecondResult = new ProjectParticipantActions.Set.Page(0);

        store._value.projectModule.projectParticipantSlice.list = {
            pages: [
                [MOCK_PARTICIPANT.id],
            ],
            pagination: {
                entries: 0,
                items: 10,
                page: 0,
            },
            sort: {
                field: 'user',
                direction: SortDirectionEnum.asc,
            },
            requestStatus: RequestStatusEnum.progress,
        };

        actions.next(new ProjectParticipantActions.Delete.OneFulfilled(MOCK_PARTICIPANT.id));

        projectParticipantsEffects.deleteParticipantSuccess$.subscribe(result => resultFromEffect.push(result));

        expect(resultFromEffect.length).toEqual(2);

        expect(resultFromEffect[0].type).toBe(expectedFirstResult.type);
        expect(resultFromEffect[0].payload.type).toBe(expectedFirstResult.payload.type);
        expect(resultFromEffect[0].payload.message).toEqual(expectedFirstResult.payload.message);

        expect(resultFromEffect[1]).toEqual(expectedSecondResult);
    });

    it('should trigger a AlertActions.Add.SuccessAlert and ProjectParticipantActions.Request.All actions after deleting a project participant successfully', () => {
        const resultFromEffect = [];
        const key = 'Participant_Delete_PartialSuccessMessage';
        const expectedFirsResult = new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)});
        const expectedSecondResult = new ProjectParticipantActions.Request.AllActive();

        const mockList = {
            pages: [
                [MOCK_PARTICIPANT.id],
                [MOCK_PARTICIPANT.id],
                [MOCK_PARTICIPANT.id, MOCK_PARTICIPANT_2.id]
            ],
            pagination: {
                entries: 0,
                items: 10,
                page: 2,
            },
            sort: {
                field: 'user',
                direction: SortDirectionEnum.asc,
            },
            requestStatus: RequestStatusEnum.progress,
        };

        store._value.projectModule.projectParticipantSlice.list = mockList;

        actions.next(new ProjectParticipantActions.Delete.OneFulfilled(MOCK_PARTICIPANT_2.id));

        projectParticipantsEffects.deleteParticipantSuccess$.subscribe(result => {
            resultFromEffect.push(result);
        });

        expect(resultFromEffect.length).toEqual(2);

        expect(resultFromEffect[0].type).toBe(expectedFirsResult.type);
        expect(resultFromEffect[0].payload.type).toBe(expectedFirsResult.payload.type);
        expect(resultFromEffect[0].payload.message).toEqual(expectedFirsResult.payload.message);

        expect(resultFromEffect[1]).toEqual(expectedSecondResult);
    });

    it('should trigger a ProjectParticipantActions.Request.ByRoleFulfilled action after requesting participants successfully', () => {
        const expectedResult = new ProjectParticipantActions.Request.ActiveByRoleFulfilled(MOCK_PARTICIPANTS_LIST_ONE_OF_ONE_PAGE);

        projectParticipantsService.findAll.and.returnValue(getParticipantsOneOfOnePageResponse);
        actions.next(new ProjectParticipantActions.Request.ActiveByRole(['CSM']));
        projectParticipantsEffects.requestActiveParticipantsByRole$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.ByRoleRejected action after requesting participants has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.ActiveByRoleRejected();

        projectParticipantsService.findAll.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.ActiveByRole(['CSM']));
        projectParticipantsEffects.requestActiveParticipantsByRole$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Update.OneFulfilled action after updating a participant successfully', () => {
        const expectedResult = new ProjectParticipantActions.Update.OneFulfilled(MOCK_PARTICIPANT);

        projectParticipantsService.update.and.returnValue(updateParticipantResponse);
        actions.next(new ProjectParticipantActions.Update.One(MOCK_PARTICIPANT.id, MOCK_PUT_PARTICIPANT_PAYLOAD, MOCK_PARTICIPANT.version));
        projectParticipantsEffects.updateParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Update.OneRejected action after the update of a participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Update.OneRejected();

        projectParticipantsService.update.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Update.One(MOCK_PARTICIPANT.id, MOCK_PUT_PARTICIPANT_PAYLOAD, MOCK_PARTICIPANT.version));
        projectParticipantsEffects.updateParticipant$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a AlertActions.Add.SuccessAlert action after updating a participant successfully', () => {
        const expectedKey = `Participant_Update_Role${MOCK_PARTICIPANT.projectRole}SuccessMessage`;
        const expectedType = AlertTypeEnum.Success;

        actions.next(new ProjectParticipantActions.Update.OneFulfilled(MOCK_PARTICIPANT));
        projectParticipantsEffects.updateParticipantSuccess$.subscribe(result => {
            expect(result.payload.type).toBe(expectedType);
            expect(result.payload.message.key).toBe(expectedKey);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.Page action after new list filters are set', fakeAsync(() => {
        let resultFromEffect = null;
        const setListFiltersPayload = new ProjectParticipantFilters(['CSM'], [ParticipantStatusEnum.ACTIVE]);
        const expectedResult = new ProjectParticipantActions.Request.Page();

        actions.next(new ProjectParticipantActions.Set.ListFilters(setListFiltersPayload));
        projectParticipantsEffects.triggerRequestParticipantsByPageActions$.subscribe(result => resultFromEffect = result);

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME - 1);
        expect(resultFromEffect).toBeNull();

        tick(HTTP_GET_REQUEST_DEBOUNCE_TIME);
        expect(resultFromEffect).toEqual(expectedResult);
    }));

    it('should trigger a ProjectParticipantActions.Request.ResendInvitationRejected action after the resend invitation ' +
        'of a participant has failed', () => {
        const expectedResult = new ProjectParticipantActions.Request.ResendInvitationRejected();

        projectParticipantsService.resendInvitation.and.returnValue(errorResponse);
        actions.next(new ProjectParticipantActions.Request.ResendInvitation(''));
        projectParticipantsEffects.resendParticipantInvitation$.subscribe(result => {
            expect(result).toEqual(expectedResult);
        });
    });

    it('should trigger a ProjectParticipantActions.Request.ResendInvitationFulfilled action after a successful ' +
        'resend invitation of a participant', () => {
        const expectedKey = 'Participant_ResendInvite_SuccessMessage';
        const expectedType = AlertTypeEnum.Success;

        projectParticipantsService.resendInvitation.and.returnValue(of({}));
        actions.next(new ProjectParticipantActions.Request.ResendInvitation(''));
        projectParticipantsEffects.resendParticipantInviteSuccess$.subscribe(result => {
            expect(result.payload.type).toBe(expectedType);
            expect(result.payload.message.key).toBe(expectedKey);
        });
    });
});
