/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';
import {cloneDeep} from 'lodash';

import {
    MOCK_PARTICIPANT,
    MOCK_PARTICIPANTS
} from '../../../../../test/mocks/participants';
import {AbstractList} from '../../../../shared/misc/api/datatypes/abstract-list.datatype';
import {AbstractPageableList} from '../../../../shared/misc/api/datatypes/abstract-pageable-list.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {PaginatorData} from '../../../../shared/ui/paginator/paginator-data.datastructure';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectParticipantListResource} from '../../api/participants/resources/project-participant-list.resource';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {
    ParticipantActionEnum,
    ProjectParticipantActions
} from './project-participant.actions';
import {PROJECT_PARTICIPANT_SLICE_INITIAL_STATE} from './project-participant.initial-state';
import {PROJECT_PARTICIPANT_REDUCER} from './project-participant.reducer';
import {ProjectParticipantSlice} from './project-participant.slice';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

describe('Project Participants Reducer', () => {
    let initialState: ProjectParticipantSlice;
    let nextState: ProjectParticipantSlice;

    beforeEach(() => {
        initialState = PROJECT_PARTICIPANT_SLICE_INITIAL_STATE;
        nextState = cloneDeep(PROJECT_PARTICIPANT_SLICE_INITIAL_STATE);
    });

    it('should handle ProjectParticipantActions.Initialize.All()', () => {
        const initializeProjectParticipantsAction: Action = {type: ParticipantActionEnum.InitializeAll};
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, initializeProjectParticipantsAction)).toEqual(initialState);
    });

    it('should handle ProjectParticipantActions.Initialize.Current()', () => {
        const initializeProjectParticipantsAction: Action = {type: ParticipantActionEnum.InitializeCurrent};
        nextState.currentItem = new AbstractItem();
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, initializeProjectParticipantsAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Create.One()', () => {
        const postParticipantAction: Action = new ProjectParticipantActions.Create.One(new AbstractItem());

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress
        });

        const result: ProjectParticipantSlice = PROJECT_PARTICIPANT_REDUCER(initialState, postParticipantAction);
        expect(result).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Create.OneFulfilled()', () => {
        const postParticipantFulfilledAction: Action = {type: ParticipantActionEnum.CreateOneFulfilled};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, postParticipantFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Create.OneRejected()', () => {
        const postParticipantRejectedAction: Action = {type: ParticipantActionEnum.CreateOneRejected};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, postParticipantRejectedAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Create.OneReset()', () => {
        const postProjectParticipantResetAction: Action = {type: ParticipantActionEnum.CreateOneReset};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty
        });
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, postProjectParticipantResetAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.Page()', () => {
        const requestProjectParticipantAction: Action = {type: ParticipantActionEnum.RequestPage};

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.PageFulfilled()', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 100;

        const resource: ProjectParticipantListResource = {
            items: MOCK_PARTICIPANTS,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 10,
            totalElements: paginatorEntries,
            _links: {
                self: {
                    href: 'http://test.de'
                },
                assign: {
                    href: 'http://test.de'
                }
            }
        };

        const requestParticipantsFulfilledAction: ProjectParticipantActions.Request.PageFulfilled = {
            type: ParticipantActionEnum.RequestPageFulfilled,
            payload: resource
        };

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            pages: Object.assign([], nextState.list.pages, {[paginatorPage]: MOCK_PARTICIPANTS.map((participant: ProjectParticipantResource) => participant.id)}),
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries),
            requestStatus: RequestStatusEnum.success,
            _links: resource._links,
        });

        nextState.currentItem = Object.assign({}, nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null,
        });

        nextState.items = MOCK_PARTICIPANTS;
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestParticipantsFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.PageRejected()', () => {
        const requestParticipantsRejectedAction: Action = {type: ParticipantActionEnum.RequestPageRejected};

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestParticipantsRejectedAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.All()', () => {
        const requestProjectParticipantAction: Action = {type: ParticipantActionEnum.RequestAllActive};

        nextState.fullList = Object.assign(new AbstractList(), nextState.fullList, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.AllFulfilled()', () => {
        const paginatorItems = 10;
        const paginatorPage = 1;
        const paginatorEntries = 100;

        const resource: ProjectParticipantListResource = {
            items: MOCK_PARTICIPANTS,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 10,
            totalElements: paginatorEntries,
            _links: {
                self: {
                    href: 'http://test.de'
                },
                assign: {
                    href: 'http://test.de'
                }
            }
        };

        const requestParticipantsFulfilledAction: ProjectParticipantActions.Request.AllActiveFulfilled = {
            type: ParticipantActionEnum.RequestAllActiveFulfilled,
            payload: resource
        };

        nextState.fullList = Object.assign(new AbstractList(), nextState.fullList, {
            ids: MOCK_PARTICIPANTS.map((participant: ProjectParticipantResource) => participant.id),
            requestStatus: RequestStatusEnum.success,
            _links: resource._links,
        });

        nextState.currentItem = Object.assign({}, nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
            id: null,
        });

        nextState.items = MOCK_PARTICIPANTS;
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestParticipantsFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.AllRejected()', () => {
        const requestParticipantsRejectedAction: Action = {type: ParticipantActionEnum.RequestAllActiveRejected};

        nextState.fullList = Object.assign(new AbstractList(), nextState.fullList, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestParticipantsRejectedAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Set.Current()', () => {
        const participantId = '123';
        const action: ProjectParticipantActions.Set.Current = {
            type: ParticipantActionEnum.SetCurrent,
            payload: participantId
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            id: participantId
        });
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Set.Page()', () => {
        const paginatorItems = 100;
        const paginatorPage = 2;
        const paginatorEntries = 0;
        const setParticipantsPageAction: ProjectParticipantActions.Set.Page = {
            type: ParticipantActionEnum.SetPage,
            payload: paginatorPage
        };
        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries)
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, setParticipantsPageAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Set.Items()', () => {
        const paginatorItems = 100;
        const paginatorPage = 0;
        const paginatorEntries = 0;
        const setParticipantsItemsAction: ProjectParticipantActions.Set.Items = {
            type: ParticipantActionEnum.SetItems,
            payload: paginatorItems
        };

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            pagination: new PaginatorData(paginatorItems, paginatorPage, paginatorEntries)
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, setParticipantsItemsAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Set.Sort()', () => {
        const sorterData: SorterData = new SorterData('name', SortDirectionEnum.desc);
        const setParticipantsSortAction: ProjectParticipantActions.Set.Sort = {
            type: ParticipantActionEnum.SetSort,
            payload: sorterData
        };

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            sort: sorterData
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, setParticipantsSortAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.OneFulfilled()', () => {
        const projectParticipantResource: ProjectParticipantActions.Request.OneFulfilled = {
            type: ParticipantActionEnum.RequestOneFulfilled,
            payload: MOCK_PARTICIPANT
        };

        nextState.items = [MOCK_PARTICIPANT];
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, projectParticipantResource)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.Current()', () => {
        const action: ProjectParticipantActions.Request.Current = {
            type: ParticipantActionEnum.RequestCurrent
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress
        });

        nextState.currentItem.requestStatus = RequestStatusEnum.progress;
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.CurrentFulfilled()', () => {
        const action: ProjectParticipantActions.Request.CurrentFulfilled = {
            type: ParticipantActionEnum.RequestCurrentFulfilled,
            payload: MOCK_PARTICIPANT
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success
        });
        nextState.items = [MOCK_PARTICIPANT];
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.CurrentRejected()', () => {
        const action: ProjectParticipantActions.Request.CurrentRejected = {
            type: ParticipantActionEnum.RequestCurrentRejected
        };

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Delete.One()', () => {
        const action = new ProjectParticipantActions.Delete.One(MOCK_PARTICIPANT.id);

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Delete.DeleteOneFulfilled()', () => {
        const action = new ProjectParticipantActions.Delete.OneFulfilled(MOCK_PARTICIPANT.id);

        const initState = Object.assign({}, initialState, {items: [MOCK_PARTICIPANT]});

        nextState.items = [];
        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.success
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Delete.OneRejected()', () => {
        const action = new ProjectParticipantActions.Delete.OneRejected();

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Delete.OneReset()', () => {
        const action = new ProjectParticipantActions.Delete.OneReset();

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.empty
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, action)).toEqual(nextState);
    });

    it('should handle initial state', () => {
        const defaultAction: Action = {type: 'DEFAULT'};
        expect(PROJECT_PARTICIPANT_REDUCER(undefined, defaultAction)).toEqual(initialState);
    });

    it('should handle ProjectParticipantActions.Request.ByRoleFulfilled()', () => {
        const paginatorItems = 10;
        const paginatorPage = 1;
        const paginatorEntries = 100;

        const resource: ProjectParticipantListResource = {
            items: MOCK_PARTICIPANTS,
            pageNumber: paginatorPage,
            pageSize: paginatorItems,
            totalPages: 10,
            totalElements: paginatorEntries,
            _links: {
                self: {
                    href: 'http://test.de'
                },
                assign: {
                    href: 'http://test.de'
                }
            }
        };

        const requestParticipantsFulfilledAction: ProjectParticipantActions.Request.ActiveByRoleFulfilled = {
            type: ParticipantActionEnum.RequestActiveByRoleFulfilled,
            payload: resource
        };

        nextState.items = MOCK_PARTICIPANTS;
        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestParticipantsFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Update.One()', () => {
        const requestProjectParticipantAction: Action = {type: ParticipantActionEnum.UpdateOne};

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.progress
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Update.OneRejected()', () => {
        const requestProjectParticipantAction: Action = {type: ParticipantActionEnum.UpdateOneRejected};

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.error
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Update.OneFulfilled()', () => {
        const requestProjectParticipantAction: ProjectParticipantActions.Update.OneFulfilled = {
            type: ParticipantActionEnum.UpdateOneFulfilled,
            payload: MOCK_PARTICIPANTS[0]
        };

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            requestStatus: RequestStatusEnum.success
        });

        nextState.items = [MOCK_PARTICIPANTS[0]];

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Set.ListFilters()', () => {
        const setListFiltersProjectParticipantAction: ProjectParticipantActions.Set.ListFilters = {
            type: ParticipantActionEnum.SetListFilters, payload: {status: [ParticipantStatusEnum.ACTIVE]},
        };

        nextState.list = Object.assign(new AbstractPageableList(), nextState.list, {
            filters: Object.assign(new ProjectParticipantFilters(), nextState.list.filters, {status: [ParticipantStatusEnum.ACTIVE]}),
            pagination: Object.assign(new PaginatorData(), nextState.list.pagination, {page: 0}),
            pages: [],
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, setListFiltersProjectParticipantAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.RequestResendInvitation()', () => {
        const requestResendInvitationAction: Action = {type: ParticipantActionEnum.RequestResendInvitation};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.progress,
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestResendInvitationAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.RequestResendInvitationFulfilled()', () => {
        const requestResendInvitationFulfilledAction: Action = {type: ParticipantActionEnum.RequestResendInvitationFulfilled};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.success,
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestResendInvitationFulfilledAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.RequestResendInvitationRejected()', () => {
        const requestResendInvitationRejectedAction: Action = {type: ParticipantActionEnum.RequestResendInvitationRejected};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.error,
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestResendInvitationRejectedAction)).toEqual(nextState);
    });

    it('should handle ProjectParticipantActions.Request.RequestResendInvitationReset()', () => {
        const requestResendInvitationResetAction: Action = {type: ParticipantActionEnum.RequestResendInvitationReset};

        nextState.currentItem = Object.assign(new AbstractItem(), nextState.currentItem, {
            requestStatus: RequestStatusEnum.empty,
        });

        expect(PROJECT_PARTICIPANT_REDUCER(initialState, requestResendInvitationResetAction)).toEqual(nextState);
    });
});
