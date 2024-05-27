/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {MenuItem} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {ParticipantStatusEnum} from '../../../../project-common/enums/participant-status.enum';
import {ProjectParticipantsListRowModel} from '../../containers/participants-content/project-participants-content.model';

@Component({
    selector: 'ss-project-participants-list',
    templateUrl: './project-participants-list.component.html',
    styleUrls: ['./project-participants-list.component.scss'],
})
export class ProjectParticipantsListComponent {

    /**
     * @description Property injected to loader and table component to handle loadings
     * @type {boolean}
     */
    @Input()
    public isLoading = false;

    /**
     * @description Property injected to table component as records
     * @type {ProjectParticipantsListRowModel[]}
     */
    @Input()
    public set participants(participants: ProjectParticipantsListRowModel[]) {
        this._participants = participants;
        this._someParticipantsHaveActions = participants.some(participant => !!participant.options.length);
    }

    /**
     * @description Getter for Participants List Row Model
     * @type {ProjectParticipantsListRowModel[]}
     */
    public get participants(): ProjectParticipantsListRowModel[] {
        return this._participants;
    }

    /**
     * @description Triggered when participant details is clicked
     * @type {EventEmitter<ProjectParticipantsListRowModel>}
     */
    @Output()
    public onClickDetails: EventEmitter<ProjectParticipantsListRowModel> = new EventEmitter<ProjectParticipantsListRowModel>();

    /**
     * @description Triggered when an action item is clicked
     * @type {EventEmitter<MenuItem<ProjectParticipantResource>>}
     */
    @Output()
    public actionClicked = new EventEmitter<MenuItem<ProjectParticipantResource>>();

    /**
     * @description Private Participants List Row Model
     * @type {ProjectParticipantsListRowModel[]}
     */
    private _participants: ProjectParticipantsListRowModel[];

    /**
     * @description Determines if at least one Participant List Row Model has actions
     * @type {boolean}
     */
    private _someParticipantsHaveActions: boolean;

    /**
     * @description Triggered when an action item is clicked
     * @type {MenuItem<ProjectParticipantResource>}
     */
    public handleDropdownItemClicked(item: MenuItem<ProjectParticipantResource>): void {
        this.actionClicked.emit(item);
    }

    /**
     * @description Triggered when form details button is triggered
     * @param {ProjectParticipantsListRowModel} participant
     */
    public onClickDetailsParticipant(participant: ProjectParticipantsListRowModel): void {
        if (this.isActiveParticipant(participant)) {
            this.onClickDetails.emit(participant);
        }
    }

    /**
     * @description Check if a participant has ACTIVE status
     * @param {ProjectParticipantsListRowModel} participant
     */
    public isActiveParticipant(participant: ProjectParticipantsListRowModel): boolean {
        return participant.status === ParticipantStatusEnum.ACTIVE;
    }

    /**
     * @description Determines whether the actions placeholder should be displayed
     * @param {ProjectParticipantsListRowModel} participant
     */
    public showActionsPlaceholder(participant: ProjectParticipantsListRowModel): boolean {
        return this._someParticipantsHaveActions && !participant.options.length;
    }
}
