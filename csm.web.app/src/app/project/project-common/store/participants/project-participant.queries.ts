/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {Params} from '@angular/router';
import {
    select,
    Store
} from '@ngrx/store';
import {
    groupBy,
    isEqual,
    uniqBy
} from 'lodash';
import {Observable} from 'rxjs';
import {
    distinctUntilChanged,
    map,
    take
} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {ResourceReference} from '../../../../shared/misc/api/datatypes/resource-reference.datatype';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {BaseQueries} from '../../../../shared/misc/store/base.queries';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {ProjectParticipantListLinks} from '../../api/participants/resources/project-participant-list.resource';
import {ParticipantStatusEnum} from '../../enums/participant-status.enum';
import {ProjectSliceService} from '../projects/project-slice.service';
import {ProjectParticipantSlice} from './project-participant.slice';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

@Injectable({
    providedIn: 'root',
})
export class ProjectParticipantQueries extends BaseQueries<ProjectParticipantResource, ProjectParticipantSlice,
    ProjectParticipantListLinks> {

    public moduleName = 'projectModule';

    public sliceName = 'projectParticipantSlice';

    constructor(private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
        super();
    }

    /**
     * @description Retrieves selector function for participant name
     * @param {Params} params
     * @returns {Function}
     */
    public static getParticipantName(params: Params): Function {
        return (state: State) => {
            const index = state.projectModule.projectParticipantSlice.items
                .findIndex((participant: ProjectParticipantResource) => participant.id === params.participantId);
            return index !== -1 ? state.projectModule.projectParticipantSlice.items[index].user.displayName : null;
        };
    }

    /**
     * @description Retrieves participants of a given project (this list might not contain all the project participants
     * but only the loaded ones)
     * @param {string} projectId identifier
     * @returns {ProjectParticipantResource[]}
     */
    public getParticipantsOfProject(projectId: string): (state: State) => ProjectParticipantResource[] {
        return (state: State) => this._getSlice(state).items
            .filter((item: ProjectParticipantResource) => !!item && item.project.id === projectId);
    }

    /**
     * @description Retrieves all participants of a given project
     * @param {string} projectId identifier
     * @returns {ProjectParticipantResource[]}
     */
    public getAllParticipantsOfProject(projectId: string): (state: State) => ProjectParticipantResource[] {
        return (state: State) => {
            const slice = this._getSlice(state);
            return slice.fullList.ids
                .map(participantId => slice.items.find(participant => participant.id === participantId))
                .filter((participant: ProjectParticipantResource) => !!participant && participant.project.id === projectId);
        };
    }

    /**
     * @description Retrieves Project Participants List Filters
     * @returns {ProjectParticipantFilters}
     */
    public getParticipantListFilters(): (state: State) => ProjectParticipantFilters {
        return (state: State) => this._getSlice(state).list.filters;
    }

    /**
     * @description Retrieves whether the user has permission to invite participants to a project
     * @returns {Observable<boolean>}
     */
    public hasInviteProjectParticipantPermission(): boolean {
        let permission = false;
        this.observeInviteProjectParticipantPermission()
            .pipe(
                take(1))
            .subscribe(perm => permission = perm)
            .unsubscribe();
        return permission;
    }

    /**
     * @description Retrieves whether the participant exists for a given ID
     * @param {string} id
     * @returns {boolean}
     */
    public hasParticipantById(id: string): boolean {
        let result: boolean;

        this.observeProjectParticipantById(id)
            .pipe(
                map((participant: ProjectParticipantResource) => !!participant),
                take(1))
            .subscribe(hasParticipantById => result = hasParticipantById)
            .unsubscribe();
        return result;
    }

    /**
     * @description Retrieves Observable of invite participant permission
     * @returns {Observable<boolean>}
     */
    public observeInviteProjectParticipantPermission(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getListLinks()),
                map((links: ProjectParticipantListLinks) => links.hasOwnProperty('assign')),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current participant
     * @returns {Observable<ProjectParticipantResource>}
     */
    public observeCurrentProjectParticipant(): Observable<ProjectParticipantResource> {
        return this._store
            .pipe(
                select(this.getCurrentItem()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current page initialized state
     * @returns {Observable<boolean>}
     */
    public observeCurrentParticipantPageInitialized(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getCurrentPageInitialized()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current participant id
     * @returns {Observable<ProjectParticipantResource>}
     */
    public observeCurrentProjectParticipantId(): Observable<string> {
        return this._store
            .pipe(
                select(this.getCurrentItemId()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of current participant request status
     * @returns {Observable<ProjectParticipantResource>}
     */
    public observeCurrentProjectParticipantRequestStatus(): Observable<RequestStatusEnum> {
        return this._store
            .pipe(
                select(this.getCurrentItemRequestStatus()),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of participant for given id
     * @param {string} id
     * @returns {Observable<ProjectParticipantResource>}
     */
    public observeProjectParticipantById(id: string): Observable<ProjectParticipantResource> {
        return this._store
            .pipe(
                select(this.getItemById(id)),
                distinctUntilChanged());
    }

    /**
     * @description Retrieves Observable of participants for given role
     * @param {string} role
     * @returns {Observable<ProjectParticipantResource>}
     */
    public observeActiveParticipantsByRole(role: string): Observable<ProjectParticipantResource[]> {
        return this._store
            .pipe(
                select(this.getParticipantsOfProject(this._projectSliceService.getCurrentProjectId())),
                map(participants => participants.filter(participant => participant.projectRole === role &&
                    participant.status === ParticipantStatusEnum.ACTIVE))
            );
    }

    /**
     * @description Retrieves Observable of participants sorted by company
     * @returns {Observable<ParticipantByCompany[]>}
     */
    public observeActiveParticipantsByCompanies(): Observable<ParticipantByCompany[]> {
        return this._store
            .pipe(
                select(this.getAllParticipantsOfProject(this._projectSliceService.getCurrentProjectId())),
                distinctUntilChanged(isEqual),
                map((participants: ProjectParticipantResource[]) => {
                    const activeParticipants = participants.filter(participant => participant.status === ParticipantStatusEnum.ACTIVE);
                    const groupedParticipants = groupBy(activeParticipants, (participant) => participant.company.id);
                    const companyList = uniqBy(activeParticipants.map(item => item.company), (company) => company.id);

                    return companyList.map(company => ({...company, participants: groupedParticipants[company.id]}));
                }),
            );
    }

    /**
     * @description Retrieves Observable of participants list filters pending status active state
     * @returns {Observable<boolean>}
     */
    public observeCurrentParticipantListFiltersPendingStatusActive(): Observable<boolean> {
        return this._store
            .pipe(
                select(this.getParticipantListFilters()),
                distinctUntilChanged(),
                map(filters =>
                        !ProjectParticipantFilters.getParticipantPendingStatus().some(status => !filters.status?.includes(status))));
    }
}

export class ParticipantByCompany extends ResourceReference {
    participants: ProjectParticipantResource[];
}
