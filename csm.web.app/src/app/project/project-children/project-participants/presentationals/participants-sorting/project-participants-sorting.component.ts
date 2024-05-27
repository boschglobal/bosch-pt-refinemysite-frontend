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
    Output
} from '@angular/core';
import {Store} from '@ngrx/store';

import {State} from '../../../../../app.reducers';
import {SelectOption} from '../../../../../shared/ui/forms/input-select-dropdown/input-select-dropdown.component';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {ProjectSliceService} from '../../../../project-common/store/projects/project-slice.service';

const PARTICIPANTS_SORT_METHODS: SelectOption[] = [
    {
        value: 'company',
        label: 'Participant_Company_Label',
    },
    {
        value: 'user',
        label: 'Generic_Name',
    },
    {
        value: 'role',
        label: 'Participant_Role_Label',
    },
    {
        value: 'email',
        label: 'Participant_Email_Label',
    }
];

@Component({
    selector: 'ss-project-participants-sorting',
    templateUrl: './project-participants-sorting.component.html',
    styleUrls: ['./project-participants-sorting.component.scss'],
})
export class ProjectParticipantsSortingComponent {
    /**
     * @description Emits when the pane is to be dismissed
     * @type {EventEmitter}
     */
    @Output() public close: EventEmitter<null> = new EventEmitter();

    /**
     * @description Options to generate sort field radio buttons
     * @type {SelectOption[]}
     */
    public sortMethods: SelectOption[] = PARTICIPANTS_SORT_METHODS;

    /**
     * @description Action for sorting project participants
     * @type {ProjectParticipantActions.Set.ParticipantsSort}
     */
    public setSortAction: any = ProjectParticipantActions.Set.Sort;

    constructor(private _projectSliceService: ProjectSliceService,
                private _store: Store<State>) {
    }

    /**
     * @description Handles click on cancel button
     */
    public handleCancel(): void {
        this.close.emit();
    }

    /**
     * @description Paginator date selector function
     * @type {Function}
     */
    public sorterDateSelectorFunction: (state: State) => {} =
        new ProjectParticipantQueries(this._projectSliceService, this._store).getListSort();
}
