/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {
    select,
    Store
} from '@ngrx/store';
import {isEqual} from 'lodash';
import {Subscription} from 'rxjs';
import {distinctUntilChanged} from 'rxjs/operators';

import {State} from '../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {SorterData} from '../../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {SaveProjectParticipantResource} from '../../../../project-common/api/participants/resources/save-project-participant.resource';
import {ParticipantRoleEnum} from '../../../../project-common/enums/participant-role.enum';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';
import {ROUTE_PARAM_PROJECT_ID} from '../../../../project-routing/project-route.paths';
import {
    DELETE_PARTICIPANT_ITEM_ID,
    ProjectParticipantsListRowModel,
    RESEND_PARTICIPANT_INVITATION_ITEM_ID,
} from './project-participants-content.model';

@Component({
    selector: 'ss-project-participants-content',
    templateUrl: './project-participants-content.component.html',
    styleUrls: ['./project-participants-content.component.scss']
})
export class ProjectParticipantsContentComponent implements OnInit, OnDestroy {
    /**
     * @description Property injected to table component as records
     * @type {Object[]}
     */
    public participants: ProjectParticipantsListRowModel[] = [];

    /**
     * @description Property injected to table component as current sort
     * @type {SorterData}
     */
    public sort: SorterData;

    /**
     * @description Property injected to loader, table and collapsible list component to handle loadings
     * @type {boolean}
     */
    public isLoading = false;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _isParticipantPendingFilterStatusActive: boolean;

    private _pageInitialized: boolean;

    constructor(private _activatedRoute: ActivatedRoute,
                private _modalService: ModalService,
                private _participantsQueries: ProjectParticipantQueries,
                private _router: Router,
                private _store: Store<State>) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._disposableSubscriptions.unsubscribe();
    }

    public handleDropdownItemClicked({id, value}: MenuItem<ProjectParticipantResource>): void {
        switch (id) {
            case DELETE_PARTICIPANT_ITEM_ID:
                this._triggerDeleteParticipantModal(value.id);
                break;
            case RESEND_PARTICIPANT_INVITATION_ITEM_ID:
                this._triggerResendInvitationModal(value);
                break;
            case ParticipantRoleEnum.CSM:
            case ParticipantRoleEnum.CR:
            case ParticipantRoleEnum.FM:
                this._triggerUpdateRoleParticipantModal(value, id);
        }
    }

    /**
     * @description Event triggered when child component changes sort status
     * @description Dispatch action with sort information
     * @param sorterData
     */
    public onSortTable(sorterData: SorterData): void {
        this._store.dispatch(new ProjectParticipantActions.Set.Sort(sorterData));
    }

    /**
     * @description Event triggered when parent row component is clicked
     * @param {ProjectParticipantsListRowModel} participant
     */
    public onClickRow(participant: ProjectParticipantsListRowModel): void {
        this._navigateToParticipantProfile(participant.id);
    }

    /**
     * @description Event triggered when detail button is clicked
     * @param {ProjectParticipantsListRowModel} participant
     */
    public onClickDetails(participant: ProjectParticipantsListRowModel): void {
        this._navigateToParticipantProfile(participant.id);
    }

    public get hasNoPendingParticipants(): boolean {
        return !this.isLoading && !this.participants.length && this._pageInitialized && this._isParticipantPendingFilterStatusActive;
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._store
                .pipe(
                    select(this._participantsQueries.getCurrentPage()),
                    distinctUntilChanged(isEqual)
                )
                .subscribe(this._parseParticipants.bind(this))
        );

        this._disposableSubscriptions.add(
            this._store
                .pipe(
                    select(this._participantsQueries.getListRequestStatus()))
                .subscribe(this._handleLoading.bind(this))
        );

        this._disposableSubscriptions.add(
            this._store
                .pipe(
                    select(this._participantsQueries.getListSort()))
                .subscribe(this._handleSortStateChange.bind(this))
        );

        this._disposableSubscriptions.add(
            this._participantsQueries.observeCurrentParticipantPageInitialized()
                .subscribe(this._handlePageInitialized.bind(this))
        );

        this._disposableSubscriptions.add(
            this._participantsQueries.observeCurrentParticipantListFiltersPendingStatusActive()
                .subscribe(this._handleParticipantsListFiltersPendingStatusChange.bind(this))
        );
    }

    private _navigateToParticipantProfile(participantId: string): void {
        const projectId: string = this._activatedRoute.root.firstChild.snapshot.children[0].params[ROUTE_PARAM_PROJECT_ID];

        this._router.navigateByUrl(ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, participantId));
    }

    private _handleLoading(requestStatus: RequestStatusEnum): void {
        switch (requestStatus) {
            case RequestStatusEnum.success:
                this.isLoading = false;
                break;
            case RequestStatusEnum.progress:
                this.isLoading = true;
                break;
            case RequestStatusEnum.error:
                this.isLoading = false;
                break;
        }
    }

    private _handlePageInitialized(pageInitialized: boolean): void {
        this._pageInitialized = pageInitialized;
    }

    private _handleParticipantsListFiltersPendingStatusChange(pendingStatus: boolean): void {
        this._isParticipantPendingFilterStatusActive = pendingStatus;
    }

    private _parseParticipants(participants: ProjectParticipantResource[]): void {
        this.participants = participants.map(participant => ProjectParticipantsListRowModel.fromResource(participant));
    }

    private _handleSortStateChange(sorterData: SorterData): void {
        this.sort = sorterData;
    }

    private _triggerDeleteParticipantModal(participantId: string): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Participant_Delete_Confirm',
                description: 'Participant_Delete_Message',
                confirmCallback: () => this._store.dispatch(new ProjectParticipantActions.Delete.One(participantId)),
                cancelCallback: () => this._store.dispatch(new ProjectParticipantActions.Delete.OneReset()),
                requestStatusObservable: this._store.pipe(select(this._participantsQueries.getListRequestStatus())),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Remove',
            },
        });
    }

    private _triggerUpdateRoleParticipantModal(participant: ProjectParticipantResource, newRole: string): void {
        const {id, version} = participant;
        const payload = new SaveProjectParticipantResource(newRole);

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: `Participant_Update_Role${newRole}Title`,
                description: `Participant_Update_Role${newRole}Warning`,
                confirmCallback: () => this._store.dispatch(new ProjectParticipantActions.Update.One(id, payload, version)),
                cancelCallback: () => {},
                requestStatusObservable: this._store.pipe(select(this._participantsQueries.getListRequestStatus())),
                confirmButtonMessage: 'Generic_Ok',
            },
        });
    }

    private _triggerResendInvitationModal(participant: ProjectParticipantResource): void {
        const {id} = participant;

        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Participant_Resend_InvitationTitle',
                description: 'Participant_Resend_InvitationWarning',
                confirmCallback: () => this._store.dispatch(new ProjectParticipantActions.Request.ResendInvitation(id)),
                cancelCallback: () => this._store.dispatch(new ProjectParticipantActions.Request.ResendInvitationReset()),
                requestStatusObservable: this._store.pipe(select(this._participantsQueries.getCurrentItemRequestStatus())),
                confirmButtonMessage: 'Generic_Resend',
            },
        });
    }
}
