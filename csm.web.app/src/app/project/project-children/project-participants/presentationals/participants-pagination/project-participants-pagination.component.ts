/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Component} from '@angular/core';
import {Store} from '@ngrx/store';

import {State} from '../../../../../app.reducers';
import {
    SetItemsPerPageActionType,
    SetPageActionType
} from '../../../../../shared/misc/containers/pagination-component/pagination.component';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';

@Component({
    selector: 'ss-project-participants-pagination',
    templateUrl: './project-participants-pagination.component.html',
})
export class ProjectParticipantsPaginationComponent {

    /**
     * @description Creator class for action to set participants list page
     * @type {ProjectParticipantActions.Set.ParticipantsPage}
     */
    public setPageAction: SetPageActionType =
        (page: number): ProjectParticipantActions => new ProjectParticipantActions.Set.Page(page);

    /**
     * @description Creator class for action to set participants list items per page
     * @type {ProjectParticipantActions.Set.ParticipantsItems}
     */
    public setItemsPerPageAction: SetItemsPerPageActionType =
        (items: number):ProjectParticipantActions => new ProjectParticipantActions.Set.Items(items);

    constructor(private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
    }

    /**
     * @description Paginator date selector function
     * @type {Function}
     */
    public paginatorDataSelectorFunction: (state: State) => {} =
        new ProjectParticipantQueries(this._projectSliceService, this._store).getListPagination();
}
