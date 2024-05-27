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
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {Store} from '@ngrx/store';

import {State} from '../../../../app.reducers';
import {CardInformationSize} from '../../../../shared/ui/cards/card-information-component/card-information.component';
import {CardUserSize} from '../../../../shared/ui/cards/card-user-component/card-user.component';
import {ProjectUrlRetriever} from '../../../project-routing/helper/project-url-retriever';
import {TaskStatusEnum} from '../../enums/task-status.enum';
import {ProjectTaskCardAssigneeModel} from '../../presentationals/project-tasks-card-assignee.model';
import {ProjectTaskActions} from '../../store/tasks/task.actions';

@Component({
    selector: 'ss-project-tasks-card-assignee',
    templateUrl: './project-tasks-card-assignee.component.html',
    styleUrls: ['./project-tasks-card-assignee.component.scss'],
})
export class ProjectTasksCardAssigneeComponent {
    /**
     * @description Input for the required information of the task
     */
    @Input()
    public projectTaskCardAssigneeModel: ProjectTaskCardAssigneeModel;

    /**
     * @description Input for the assignee card size
     * @type {ProjectTasksCardAssigneeSize}
     */
    @Input()
    public set size(size: ProjectTasksCardAssigneeSize) {
        this.userCardSize = size;
        this.informationCardSize = size === 'large' ? 'normal' : size;
    }

    /**
     * @description Property injected to allow selection
     * @type {boolean}
     */
    @Input()
    public isSelecting: boolean;

    /**
     * @description Property injected to navigate to edit task information
     */
    @Input()
    public enableFocus: boolean;

    @Output()
    public openCapture: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * @description Variable for user card size
     * @type {CardUserSize}
     */
    public userCardSize: CardUserSize = 'normal';

    /**
     * @description Variable for information card size
     * @type {CardInformationSize}
     */
    public informationCardSize: CardInformationSize = 'normal';

    constructor(private _activatedRoute: ActivatedRoute,
                private _router: Router,
                private _store: Store<State>) {
    }

    /**
     * @description Retrieves if the task is assigned or not
     * @returns {boolean}
     */
    public isAssigned(): boolean {
        return this.projectTaskCardAssigneeModel.assigned;
    }

    /**
     * @description Retrieves if the task is sent or not
     * @returns {boolean}
     */
    public isSent(): boolean {
        return this.projectTaskCardAssigneeModel.status !== TaskStatusEnum.DRAFT;
    }

    public canBeAssigned(): boolean {
        return this.projectTaskCardAssigneeModel.canBeAssigned;
    }

    public canBeSent(): boolean {
        return this.projectTaskCardAssigneeModel.canBeSent;
    }

    /**
     * @description Sets selecting mode on and adds task id to list of selected tasks
     * @param {Event} event
     */
    public handleAssign(event: Event): void {
        if (this.isSelecting) {
            return;
        }

        if (this.enableFocus) {
            this.openCapture.emit(true);
        }

        event.stopPropagation();

        this._store.dispatch(new ProjectTaskActions.Set.AssignSelecting(true));
        this._store.dispatch(new ProjectTaskActions.Set.AssignIds([this.projectTaskCardAssigneeModel.taskId]));
    }

    /**
     * @description Send the clicked task
     * @param {Event} event
     */
    public handleSend(event: Event): void {
        if (this.isSelecting) {
            return;
        }

        event.stopPropagation();
        this._store.dispatch(new ProjectTaskActions.Send.All([this.projectTaskCardAssigneeModel.taskId]));
    }

    /**
     * @description Navigate to user profile when clicking the user card
     */
    public navigateToUserProfile(event: Event): void {
        const {projectId, participantId} = this.projectTaskCardAssigneeModel;

        event.stopPropagation();

        this._router.navigateByUrl(ProjectUrlRetriever.getProjectParticipantsProfileUrl(projectId, participantId));
    }
}

type ProjectTasksCardAssigneeSize = 'large' | 'normal' | 'small';
