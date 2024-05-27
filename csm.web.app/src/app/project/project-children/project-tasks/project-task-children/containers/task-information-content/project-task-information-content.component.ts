/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../../app.reducers';
import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {BreakpointsEnum} from '../../../../../../shared/ui/constants/breakpoints.constant';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {ProjectParticipantResource} from '../../../../../project-common/api/participants/resources/project-participant.resource';
import {WorkareaResource} from '../../../../../project-common/api/workareas/resources/workarea.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {TaskStatusEnum} from '../../../../../project-common/enums/task-status.enum';
import {Task} from '../../../../../project-common/models/tasks/task';
import {ProjectTaskCardAssigneeModel} from '../../../../../project-common/presentationals/project-tasks-card-assignee.model';
import {AttachmentQueries} from '../../../../../project-common/store/attachments/attachment.queries';
import {ProjectParticipantActions} from '../../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../../project-common/store/participants/project-participant.queries';
import {ProjectTaskActions} from '../../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../../project-common/store/tasks/task-queries';
import {WorkareaActions} from '../../../../../project-common/store/workareas/workarea.actions';
import {WorkareaQueries} from '../../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../../project-routing/helper/project-url-retriever';

export const DELETE_TASK_ITEM_ID = 'delete-task';

@Component({
    templateUrl: './project-task-information-content.component.html',
    styleUrls: ['./project-task-information-content.component.scss'],
})
export class ProjectTaskInformationComponent implements OnInit, OnDestroy {
    /**
     * @description Property with task information
     */
    public task: Task;

    /**
     * @description Property with Task Attachments
     */
    public attachments: AttachmentResource[];

    /**
     * @description Property with creator information
     */
    public creatorParticipant: ProjectTaskCardAssigneeModel;

    /**
     * @description Property with assignee information
     */
    public assigneeParticipant: ProjectTaskCardAssigneeModel;

    /**
     * @description Property with the information of when should sticky behaviour stop
     * @type {BreakpointsEnum}
     */
    public stickyBreakpointValue = BreakpointsEnum.lg;

    public calendarEditTaskModalId = ModalIdEnum.UpdateTask;

    public calendarUpdateConstraintsModalId = ModalIdEnum.UpdateConstraints;

    public isLoading = false;

    public editTaskModal: ModalInterface = {
        id: ModalIdEnum.UpdateTask,
        data: {},
    };

    public dropdownItems: MenuItemsList[] = [];

    public taskCaptureFormField = ProjectTaskCaptureFormInputEnum;

    private _disposableSubscriptions: Subscription = new Subscription();

    public workArea: WorkareaResource;

    constructor(private _modalService: ModalService,
                private _attachmentTaskQueries: AttachmentQueries,
                private _projectTaskQueries: ProjectTaskQueries,
                private _projectParticipantQueries: ProjectParticipantQueries,
                private _router: Router,
                private _store: Store<State>,
                private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._requestWorkareas();
        this._setSubscription();
    }

    ngOnDestroy() {
        this._unsetSubscription();
    }

    /**
     * @description Checks if task is not closed to show edit icon
     * @returns {boolean}
     */
    public get canEdit(): boolean {
        return this.task.permissions.canUpdate;
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_TASK_ITEM_ID:
                this._handleDelete();
                break;
        }
    }

    /**
     * @description Open edit task on Modal
     */
    public openModal(focus: ProjectTaskCaptureFormInputEnum = null): void {
        this.editTaskModal.data = {
            taskId: this.task.id,
            focus,
        };
        this._modalService.open(this.editTaskModal);
    }

    public closeModal(): void {
        this._modalService.close();
    }

    private _setSubscription(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCurrentTask()
                .subscribe(task => this._setTaskInformation(task))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeCurrentTaskRequestStatus()
                .subscribe(status => this._handleRequestStatusChange(status))
        );

        this._disposableSubscriptions.add(
            this._attachmentTaskQueries.observeAttachments(ObjectTypeEnum.Task, this.task.id)
                .subscribe(attachments => {
                    this._setTaskAttachments(attachments);
                })
        );
    }

    private _handleRequestStatusChange(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _unsetSubscription(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _handleDelete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Task_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new ProjectTaskActions.Delete.One(this.task.id)),
                completeCallback: () => this._router.navigateByUrl(ProjectUrlRetriever.getProjectTasksUrl(this.task.project.id)),
                cancelCallback: () => this._store.dispatch(new ProjectTaskActions.Delete.OneReset()),
                requestStatusObservable: this._projectTaskQueries.observeCurrentTaskRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _requestWorkareas(): void {
        this._store.dispatch(new WorkareaActions.Request.All());
    }

    private _setParticipant(currentParticipant: ProjectParticipantResource, participant: string): void {
        if (currentParticipant) {
            if (participant === 'assignee') {
                this.assigneeParticipant = this._convertParticipantToAssignee(currentParticipant, this.task.assigned, this.task.status);
            } else {
                this.creatorParticipant = this._convertParticipantToAssignee(currentParticipant, true, TaskStatusEnum.OPEN);
            }
        }
    }

    private _convertParticipantToAssignee(participant: ProjectParticipantResource,
                                          assigned: boolean,
                                          status: TaskStatusEnum): ProjectTaskCardAssigneeModel {
        const {id, project, permissions} = this.task;
        return new ProjectTaskCardAssigneeModel(
            id,
            project.id,
            assigned,
            participant.user,
            participant.company,
            status,
            permissions.canAssign,
            permissions.canSend,
            participant.id,
            participant.email,
            participant.phoneNumbers);
    }

    private _setTaskInformation(currentTask: Task): void {
        if (typeof currentTask === 'undefined') {
            return;
        }

        this.task = currentTask;
        this._setDropdownItems();
        this._requestParticipants();
        this._setWorkAreaSubscriptions();
    }

    public get _canDelete(): boolean {
        return this.task.permissions.canDelete;
    }

    private _setDropdownItems(): void {
        const items: MenuItem[] = [];

        if (this._canDelete) {
            items.push({
                id: DELETE_TASK_ITEM_ID,
                type: 'button',
                label: 'Task_Delete_Label',
            });
        }

        this.dropdownItems = items.length ? [{items}] : [];
    }

    private _setWorkAreaSubscriptions(): void {
        this.workArea = undefined;
        const {workArea} = this.task;

        if (workArea) {
            this._disposableSubscriptions.add(
                this._workAreaQueries.observeWorkareaById(workArea.id)
                    .subscribe((workAreaValue) => this.workArea = workAreaValue)
            );
        }
    }

    private _setTaskAttachments(attachments: AttachmentResource[]): void {
        this.attachments = attachments;
    }

    private _requestParticipants(): void {
        const {creator, assignee, assigned, status} = this.task;
        let assigneeId = '';

        if (assigned) {
            assigneeId = assignee.id;

            this._store.dispatch(new ProjectParticipantActions.Request.One(assigneeId));
        } else {
            this.assigneeParticipant = this._convertParticipantToAssignee(new ProjectParticipantResource(), assigned, status);
        }

        this._store.dispatch(new ProjectParticipantActions.Request.One(creator.id));

        this._setParticipantsSubscriptions(assigneeId, creator.id);
    }

    private _setParticipantsSubscriptions(assigneeId: string, creatorId: string): void {
        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeProjectParticipantById(assigneeId)
                .subscribe((participant: ProjectParticipantResource) => this._setParticipant(participant, 'assignee'))
        );

        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeProjectParticipantById(creatorId)
                .subscribe((participant: ProjectParticipantResource) => this._setParticipant(participant, 'creator'))
        );
    }
}
