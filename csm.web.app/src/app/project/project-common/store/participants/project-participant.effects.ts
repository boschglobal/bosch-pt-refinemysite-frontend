/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {
    Actions,
    createEffect,
    ofType
} from '@ngrx/effects';
import {
    Action,
    select,
    Store
} from '@ngrx/store';
import {flatten} from 'lodash';
import {
    Observable,
    of,
    zip
} from 'rxjs';
import {
    catchError,
    debounceTime,
    map,
    mergeMap,
    switchMap,
    withLatestFrom
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AlertMessageResource} from '../../../../shared/alert/api/resources/alert-message.resource';
import {AlertActions} from '../../../../shared/alert/store/alert.actions';
import {HTTP_GET_REQUEST_DEBOUNCE_TIME} from '../../../../shared/misc/store/constants/effects.constants';
import {SortDirectionEnum} from '../../../../shared/ui/sorter/sort-direction.enum';
import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectParticipantsService} from '../../api/participants/project-participants.service';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectParticipantListResource} from '../../api/participants/resources/project-participant-list.resource';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {ProjectQueries} from '../projects/project.queries';
import {
    ParticipantActionEnum,
    ProjectParticipantActions
} from './project-participant.actions';
import {ProjectParticipantQueries} from './project-participant.queries';
import {ProjectParticipantFiltersResource} from './slice/project-participant-filters-resource';

@Injectable()
export class ProjectParticipantsEffects {

    private _projectQueries: ProjectQueries = new ProjectQueries();

    private readonly TRIGGER_REQUEST_PARTICIPANTS_BY_PAGE_ACTIONS: string[] = [
        ParticipantActionEnum.SetPage,
        ParticipantActionEnum.SetItems,
        ParticipantActionEnum.SetSort,
        ParticipantActionEnum.SetListFilters,
    ];

    constructor(private _actions$: Actions,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _projectParticipantsService: ProjectParticipantsService,
                private _store: Store<State>) {
    }

    /**
     * @description Set current participant interceptor
     * @type {Observable<Action>}
     */
    public triggerRequestActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.SetCurrent),
            switchMap(() => of(new ProjectParticipantActions.Request.Current()))));

    /**
     * @description Request participant interceptor to request current participant
     * @type {Observable<Action>}
     */
    public requestCurrent$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestCurrent),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectParticipantQueries.getCurrentItemId()))),
            mergeMap(([action, currentParticipantId]) =>
                this._projectParticipantsService.findOne(currentParticipantId)
                    .pipe(
                        map(participant => new ProjectParticipantActions.Request.CurrentFulfilled(participant)),
                        catchError(() => of(new ProjectParticipantActions.Request.CurrentRejected()))))));

    /**
     * @description Invite participant interceptor
     * @type {Observable<Action>}
     */
    public inviteParticipant$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.CreateOne),
            switchMap((action: ProjectParticipantActions.Create.One) =>
                this._projectParticipantsService.invite(action.payload.email, action.payload.role, action.payload.projectId)
                    .pipe(
                        map((participant: ProjectParticipantResource) => new ProjectParticipantActions.Create.OneFulfilled(participant)),
                        catchError(() => of(new ProjectParticipantActions.Create.OneRejected())))
            )));

    /**
     * @description Invite participant success interceptor
     * @type {Observable<Action>}
     */
    public inviteParticipantSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.CreateOneFulfilled),
            map(({payload: {status}}) =>
                status === ParticipantStatusEnum.INVITED
                    ? 'Participant_Create_InvitedSuccessMessage'
                    : 'Participant_Create_ActiveSuccessMessage'
            ),
            switchMap((messageKey) => of(
                new AlertActions.Add.SuccessAlert({
                    message: {
                        key: messageKey,
                    },
                }))
            )));

    /**
     * @description Global interceptor for project participants by page requests
     * @type {Observable<Action>}
     */
    public triggerRequestParticipantsByPageActions$ = createEffect(() => this._actions$
        .pipe(
            ofType(...this.TRIGGER_REQUEST_PARTICIPANTS_BY_PAGE_ACTIONS),
            debounceTime(HTTP_GET_REQUEST_DEBOUNCE_TIME),
            switchMap(() => of(new ProjectParticipantActions.Request.Page()))));

    /**
     * @description Request all active participants interceptor to request all active participants
     * @type {Observable<Action>}
     */
    public requestAllActiveParticipants$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestAllActive),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectParticipantQueries.getSlice()))),
            mergeMap(([[action, projectSlice]]) => {
                const projectId = projectSlice.currentItem.id;
                const page = 0;
                const items = 100;
                const fieldString = 'user';
                const directionString = SortDirectionEnum[SortDirectionEnum.asc];
                const filters = {status: [ParticipantStatusEnum.ACTIVE]};

                return this._projectParticipantsService
                    .findAll(projectId, fieldString, directionString, page, items, filters)
                    .pipe(
                        switchMap((participantList: ProjectParticipantListResource) => {
                            const requests = [of(participantList)];

                            for (let pageNumber = page + 1; pageNumber < participantList.totalPages; pageNumber++) {
                                requests.push(
                                    this._projectParticipantsService
                                        .findAll(projectId, fieldString, directionString, pageNumber, items, filters)
                                );
                            }

                            return zip(...requests);
                        }),
                        map((participantLists: ProjectParticipantListResource[]) => {
                            const participants = participantLists.map(participantList => participantList.items);
                            return Object.assign({}, participantLists[0], {items: flatten(participants)});
                        }),
                        map((projectParticipantResource: ProjectParticipantListResource) =>
                            new ProjectParticipantActions.Request.AllActiveFulfilled(projectParticipantResource)),
                        catchError(() => of(new ProjectParticipantActions.Request.AllActiveRejected())));
            })));

    /**
     * @description Request participants interceptor to requests participants
     * @type {Observable<Action>}
     */
    public requestParticipantsPage$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestPage),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectParticipantQueries.getSlice()))),
            mergeMap(([[action, projectSlice], projectParticipantSlice]) => {
                const projectId = projectSlice.currentItem.id;
                const {page, items} = projectParticipantSlice.list.pagination;
                const {field, direction} = projectParticipantSlice.list.sort;
                const fieldString = SorterData.getFieldString(direction, field);
                const directionString = SorterData.getDirectionString(direction);
                const filters = ProjectParticipantFiltersResource.fromProjectParticipantFilters(projectParticipantSlice.list.filters);

                return this._projectParticipantsService
                    .findAll(projectId, fieldString, directionString, page, items, filters)
                    .pipe(
                        map(projectParticipantResource => new ProjectParticipantActions.Request.PageFulfilled(projectParticipantResource)),
                        catchError(() => of(new ProjectParticipantActions.Request.PageRejected())));
            })));

    /**
     * @description Request active participants interceptor to requests active participants by role
     * @type {Observable<Action>}
     */
    public requestActiveParticipantsByRole$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestActiveByRole),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectQueries.getSlice()))
            ),
            mergeMap(([action, projectSlice]) => {
                const projectId = projectSlice.currentItem.id;
                const requestAction = action as ProjectParticipantActions.Request.ActiveByRole;
                const filters = {roles: requestAction.payload, status: [ParticipantStatusEnum.ACTIVE]};

                return this._projectParticipantsService
                    .findAll(projectId, 'user', 'asc', 0, 50, filters)
                    .pipe(
                        map(projectParticipantResource =>
                            new ProjectParticipantActions.Request.ActiveByRoleFulfilled(projectParticipantResource)),
                        catchError(() => of(new ProjectParticipantActions.Request.ActiveByRoleRejected())));
            })));

    /**
     * @description Request participant interceptor to request participant
     * @type {Observable<Action>}
     */
    public requestParticipant$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestOne),
            mergeMap((action: ProjectParticipantActions.Request.One) => {
                const participantId = action.payload;

                return this._projectParticipantsService
                    .findOne(participantId)
                    .pipe(
                        map(projectParticipantResource => new ProjectParticipantActions.Request.OneFulfilled(projectParticipantResource)),
                        catchError(() => of(new ProjectParticipantActions.Request.OneRejected())));
            })));

    /**
     * @description Delete project participant interceptor
     * @type {Observable<Action>}
     */
    public deleteParticipant$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.DeleteOne),
            switchMap((action: ProjectParticipantActions.Delete.One) => {
                const participantId = action.payload;

                return this._projectParticipantsService
                    .delete(participantId)
                    .pipe(
                        map(() => new ProjectParticipantActions.Delete.OneFulfilled(participantId)),
                        catchError(() => of(new ProjectParticipantActions.Delete.OneRejected())),
                    );
            })));

    /**
     * @description Delete project participant success interceptor
     * @type {Observable<Action>}
     */
    public deleteParticipantSuccess$: Observable<Action> = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.DeleteOneFulfilled),
            withLatestFrom(this._store
                .pipe(
                    select(this._projectParticipantQueries.getSlice()))),
            mergeMap(
                ([action, projectParticipantSlice]) => {
                    const participantId = (action as ProjectParticipantActions.Delete.OneFulfilled).payload;
                    const currentPage = projectParticipantSlice.list.pagination.page;
                    const previousPage = Math.max(0, currentPage - 1);
                    const currentPageItems = projectParticipantSlice.list.pages[currentPage];
                    const isOnlyItemOnPage = currentPageItems && currentPageItems.length === 1 && currentPageItems.includes(participantId);
                    const updatePageAction: Action = isOnlyItemOnPage
                        ? new ProjectParticipantActions.Set.Page(previousPage)
                        : new ProjectParticipantActions.Request.AllActive();

                    return [
                        new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Participant_Delete_PartialSuccessMessage')}),
                        updatePageAction,
                    ];
                })));

    /**
     * @description Update participant success interceptor
     * @type {Observable<Action>}
     */
    public updateParticipant$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.UpdateOne),
            switchMap((action: ProjectParticipantActions.Update.One) =>
                this._projectParticipantsService
                    .update(action.participantId, action.payload, action.version)
                    .pipe(
                        map(projectParticipantResource => new ProjectParticipantActions.Update.OneFulfilled(projectParticipantResource)),
                        catchError(() => of(new ProjectParticipantActions.Update.OneRejected()))))));

    /**
     * @description Update participant interceptor to update participant
     * @type {Observable<Action>}
     */
    public updateParticipantSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.UpdateOneFulfilled),
            switchMap((action: ProjectParticipantActions.Update.OneFulfilled) => {
                const key = `Participant_Update_Role${action.payload.projectRole}SuccessMessage`;
                return [new AlertActions.Add.SuccessAlert({message: new AlertMessageResource(key)})];
            })));

    /**
     * @description Resend participant invite interceptor
     * @type {Observable<Action>}
     */
    public resendParticipantInvitation$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestResendInvitation),
            switchMap((action: ProjectParticipantActions.Request.ResendInvitation) =>
                this._projectParticipantsService
                    .resendInvitation(action.payload)
                    .pipe(
                        map(() => new ProjectParticipantActions.Request.ResendInvitationFulfilled()),
                        catchError(() => of(new ProjectParticipantActions.Request.ResendInvitationRejected())))))
    );

    /**
     * @description Resend participant invite success interceptor
     * @type {Observable<Action>}
     */
    public resendParticipantInviteSuccess$ = createEffect(() => this._actions$
        .pipe(
            ofType(ParticipantActionEnum.RequestResendInvitationFulfilled),
            switchMap((action: ProjectParticipantActions.Request.ResendInvitationFulfilled) =>
                [new AlertActions.Add.SuccessAlert({message: new AlertMessageResource('Participant_ResendInvite_SuccessMessage')})])));
}
