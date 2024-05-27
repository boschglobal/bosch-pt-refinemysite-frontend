/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {SorterData} from '../../../../shared/ui/sorter/sorter-data.datastructure';
import {ProjectParticipantListResource} from '../../api/participants/resources/project-participant-list.resource';
import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';
import {SaveProjectParticipantResource} from '../../api/participants/resources/save-project-participant.resource';
import {ProjectParticipantFilters} from './slice/project-participant-filters';

export enum ParticipantActionEnum {
    InitializeAll = '[Participants] Initialize all',
    InitializeCurrent = '[Participants] Initialize current',
    CreateOne = '[Participants] Create one',
    CreateOneFulfilled = '[Participants] Create one fulfilled',
    CreateOneRejected = '[Participants] Create one rejected',
    UpdateOne = '[Participants] Update one',
    UpdateOneFulfilled = '[Participants] Update one fulfilled',
    UpdateOneRejected = '[Participants] Update one rejected',
    CreateOneReset = '[Participants] Create one reset',
    RequestAllActive = '[Participants] Request all active',
    RequestAllActiveFulfilled = '[Participants] Request all active fulfilled',
    RequestAllActiveRejected = '[Participants] Request all active rejected',
    RequestPage = '[Participants] Request page',
    RequestPageFulfilled = '[Participants] Request page fulfilled',
    RequestPageRejected = '[Participants] Request page rejected',
    RequestActiveByRole = '[Participants] Request active by role',
    RequestActiveByRoleFulfilled = '[Participants] Request active by role fulfilled',
    RequestActiveByRoleRejected = '[Participants] Request active by role rejected',
    RequestOne = '[Participants] Request one',
    RequestOneFulfilled = '[Participants] Request one fulfilled',
    RequestOneRejected = '[Participants] Request one rejected',
    RequestCurrent = '[Participants] Request current',
    RequestCurrentFulfilled = '[Participants] Request current fulfilled',
    RequestCurrentRejected = '[Participants] Request current rejected',
    RequestResendInvitation = '[Participants] Request resend invitation',
    RequestResendInvitationFulfilled = 'Request resend invitation fulfilled',
    RequestResendInvitationRejected = 'Request resend invitation rejected',
    RequestResendInvitationReset = 'Request resend invitation reset',
    SetCurrent = '[Participants] Set current',
    SetListFilters = '[Participants] Set list filters',
    SetPage = '[Participants] Set page',
    SetItems = '[Participants] Set items',
    SetSort = '[Participants] Set sort',
    DeleteOne = '[Participants] Delete one',
    DeleteOneFulfilled = '[Participants] Delete one fulfilled',
    DeleteOneRejected = '[Participants] Delete one rejected',
    DeleteOneReset = '[Participants] Delete one reset'
}

export namespace ProjectParticipantActions {

    export namespace Initialize {
        export class All implements Action {
            readonly type = ParticipantActionEnum.InitializeAll;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = ParticipantActionEnum.InitializeCurrent;

            constructor() {
            }
        }
    }

    export namespace Create {
        export class One implements Action {
            readonly type = ParticipantActionEnum.CreateOne;

            constructor(public payload: any) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ParticipantActionEnum.CreateOneFulfilled;

            constructor(public payload: ProjectParticipantResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ParticipantActionEnum.CreateOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = ParticipantActionEnum.CreateOneReset;

            constructor() {
            }
        }
    }

    export namespace Update {
        export class One implements Action {
            readonly type = ParticipantActionEnum.UpdateOne;

            constructor(public participantId: string, public payload: SaveProjectParticipantResource, public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ParticipantActionEnum.UpdateOneFulfilled;

            constructor(public payload: ProjectParticipantResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ParticipantActionEnum.UpdateOneRejected;

            constructor() {
            }
        }
    }

    export namespace Request {
        export class AllActive implements Action {
            readonly type = ParticipantActionEnum.RequestAllActive;

            constructor() {
            }
        }

        export class AllActiveFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestAllActiveFulfilled;

            constructor(public payload: ProjectParticipantListResource) {
            }
        }

        export class AllActiveRejected implements Action {
            readonly type = ParticipantActionEnum.RequestAllActiveRejected;

            constructor() {
            }
        }

        export class Page implements Action {
            readonly type = ParticipantActionEnum.RequestPage;

            constructor() {
            }
        }

        export class PageFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestPageFulfilled;

            constructor(public payload: ProjectParticipantListResource) {
            }
        }

        export class PageRejected implements Action {
            readonly type = ParticipantActionEnum.RequestPageRejected;

            constructor() {
            }
        }

        export class ActiveByRole implements Action {
            readonly type = ParticipantActionEnum.RequestActiveByRole;

            constructor(public payload: string[]) {
            }
        }

        export class ActiveByRoleFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestActiveByRoleFulfilled;

            constructor(public payload: ProjectParticipantListResource) {
            }
        }

        export class ActiveByRoleRejected implements Action {
            readonly type = ParticipantActionEnum.RequestActiveByRoleRejected;

            constructor() {
            }
        }

        export class One implements Action {
            readonly type = ParticipantActionEnum.RequestOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestOneFulfilled;

            constructor(public payload: ProjectParticipantResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ParticipantActionEnum.RequestOneRejected;

            constructor() {
            }
        }

        export class Current implements Action {
            readonly type = ParticipantActionEnum.RequestCurrent;

            constructor() {
            }
        }

        export class CurrentFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestCurrentFulfilled;

            constructor(public payload: ProjectParticipantResource) {
            }
        }

        export class CurrentRejected implements Action {
            readonly type = ParticipantActionEnum.RequestCurrentRejected;

            constructor() {
            }
        }

        export class ResendInvitation implements Action {
            readonly type = ParticipantActionEnum.RequestResendInvitation;

            constructor(public payload: string) {
            }

        }

        export class ResendInvitationFulfilled implements Action {
            readonly type = ParticipantActionEnum.RequestResendInvitationFulfilled;

            constructor() {
            }
        }

        export class ResendInvitationRejected implements Action {
            readonly type = ParticipantActionEnum.RequestResendInvitationRejected;

            constructor() {
            }
        }

        export class ResendInvitationReset implements Action {
            readonly type = ParticipantActionEnum.RequestResendInvitationReset;

            constructor() {
            }
        }
    }

    export namespace Set {
        export class Current implements Action {
            readonly type = ParticipantActionEnum.SetCurrent;

            constructor(public payload: string) {
            }
        }

        export class ListFilters implements Action {
            readonly type = ParticipantActionEnum.SetListFilters;

            constructor(public payload: ProjectParticipantFilters) {
            }
        }

        export class Page implements Action {
            readonly type = ParticipantActionEnum.SetPage;

            constructor(public payload: number) {
            }
        }

        export class Items implements Action {
            readonly type = ParticipantActionEnum.SetItems;

            constructor(public payload: number) {
            }
        }

        export class Sort implements Action {
            readonly type = ParticipantActionEnum.SetSort;

            constructor(public payload: SorterData) {
            }
        }
    }

    export namespace Delete {
        export class One implements Action {
            readonly type = ParticipantActionEnum.DeleteOne;

            constructor(public payload: string) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ParticipantActionEnum.DeleteOneFulfilled;

            constructor(public payload: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ParticipantActionEnum.DeleteOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            readonly type = ParticipantActionEnum.DeleteOneReset;

            constructor() {
            }
        }
    }
}

export type ProjectParticipantActions =
    ProjectParticipantActions.Initialize.All |
    ProjectParticipantActions.Initialize.Current |
    ProjectParticipantActions.Create.One |
    ProjectParticipantActions.Create.OneFulfilled |
    ProjectParticipantActions.Create.OneRejected |
    ProjectParticipantActions.Create.OneReset |
    ProjectParticipantActions.Request.Current |
    ProjectParticipantActions.Request.CurrentFulfilled |
    ProjectParticipantActions.Request.CurrentRejected |
    ProjectParticipantActions.Request.AllActive |
    ProjectParticipantActions.Request.AllActiveFulfilled |
    ProjectParticipantActions.Request.AllActiveRejected |
    ProjectParticipantActions.Request.Page |
    ProjectParticipantActions.Request.PageFulfilled |
    ProjectParticipantActions.Request.PageRejected |
    ProjectParticipantActions.Request.ActiveByRole |
    ProjectParticipantActions.Request.ActiveByRoleFulfilled |
    ProjectParticipantActions.Request.ActiveByRoleRejected |
    ProjectParticipantActions.Request.One |
    ProjectParticipantActions.Request.OneFulfilled |
    ProjectParticipantActions.Request.OneRejected |
    ProjectParticipantActions.Request.ResendInvitation |
    ProjectParticipantActions.Request.ResendInvitationFulfilled |
    ProjectParticipantActions.Request.ResendInvitationRejected |
    ProjectParticipantActions.Request.ResendInvitationReset |
    ProjectParticipantActions.Set.Current |
    ProjectParticipantActions.Set.ListFilters |
    ProjectParticipantActions.Set.Page |
    ProjectParticipantActions.Set.Items |
    ProjectParticipantActions.Set.Sort |
    ProjectParticipantActions.Update.One |
    ProjectParticipantActions.Update.OneFulfilled |
    ProjectParticipantActions.Update.OneRejected |
    ProjectParticipantActions.Delete.One |
    ProjectParticipantActions.Delete.OneFulfilled |
    ProjectParticipantActions.Delete.OneRejected |
    ProjectParticipantActions.Delete.OneReset;
