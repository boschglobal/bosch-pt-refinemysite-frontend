/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Inject,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';

import {State} from '../../../../../app.reducers';
import {ObjectIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-identifier-pair.datatype';
import {ObjectListIdentifierPair} from '../../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../shared/misc/enums/object-type.enum';
import {
    DRAWER_DATA,
    DrawerService
} from '../../../../../shared/ui/drawer/api/drawer.service';
import {ButtonLink} from '../../../../../shared/ui/links/button-link/button-link.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../shared/ui/menus/menu-list/menu-list.component';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {AttachmentResource} from '../../../../project-common/api/attachments/resources/attachment.resource';
import {ProjectParticipantResource} from '../../../../project-common/api/participants/resources/project-participant.resource';
import {WorkareaResource} from '../../../../project-common/api/workareas/resources/workarea.resource';
import {DependenciesListRelationsObservables} from '../../../../project-common/containers/dependencies-list/dependencies-list.component';
import {ProjectTaskCaptureFormInputEnum} from '../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {TaskStatusEnum} from '../../../../project-common/enums/task-status.enum';
import {Task} from '../../../../project-common/models/tasks/task';
import {ProjectTaskCardAssigneeModel} from '../../../../project-common/presentationals/project-tasks-card-assignee.model';
import {
    AttachmentActions,
    RequestAllAttachmentsPayload
} from '../../../../project-common/store/attachments/attachment.actions';
import {AttachmentQueries} from '../../../../project-common/store/attachments/attachment.queries';
import {CalendarScopeActions} from '../../../../project-common/store/calendar/calendar-scope/calendar-scope.actions';
import {NewsActions} from '../../../../project-common/store/news/news.actions';
import {ProjectParticipantActions} from '../../../../project-common/store/participants/project-participant.actions';
import {ProjectParticipantQueries} from '../../../../project-common/store/participants/project-participant.queries';
import {RelationQueries} from '../../../../project-common/store/relations/relation.queries';
import {ProjectTaskActions} from '../../../../project-common/store/tasks/task.actions';
import {ProjectTaskQueries} from '../../../../project-common/store/tasks/task-queries';
import {WorkareaQueries} from '../../../../project-common/store/workareas/workarea.queries';
import {ProjectUrlRetriever} from '../../../../project-routing/helper/project-url-retriever';

export const DELETE_TASK_ITEM_ID = 'delete-task';

@Component({
    selector: 'ss-tasks-detail-drawer',
    templateUrl: './tasks-detail-drawer.component.html',
    styleUrls: ['./tasks-detail-drawer.component.scss'],
})
export class TasksDetailDrawerComponent implements OnInit, OnDestroy {

    public attachments: AttachmentResource[];

    public detailsPicturePerRow = 4;

    public detailsTextMaxSize = 54;

    public dropdownItems: MenuItemsList[] = [];

    public task: Task;

    public taskLink: ButtonLink;

    private _disposableSubscriptions: Subscription = new Subscription();

    /**
     * @description Property with assignee information
     */
    public assigneeParticipant: ProjectTaskCardAssigneeModel;

    /**
     * @description Property with creator information
     */
    public creatorParticipant: ProjectTaskCardAssigneeModel;

    public dependencyOriginator = new ObjectIdentifierPair(ObjectTypeEnum.Task, this._taskId);

    public relationsObservables: DependenciesListRelationsObservables = {
        requestStatusObservable: this._relationsQueries.observeFinishToStartRelationsRequestStatus(),
        predecessorsObservable: this._relationsQueries.observeFinishToStartPredecessorRelationsByTaskId(this._taskId),
        predecessorsWithResourcesObservable: this._relationsQueries.observeRelationsTaskPredecessorsByTaskId(this._taskId),
        successorsObservable: this._relationsQueries.observeFinishToStartSuccessorRelationsByTaskId(this._taskId),
        successorsWithResourcesObservable: this._relationsQueries.observeRelationsTaskSuccessorsByTaskId(this._taskId),
    };

    public taskCaptureFormField = ProjectTaskCaptureFormInputEnum;

    public workArea: WorkareaResource;

    constructor(
        private _attachmentQueries: AttachmentQueries,
        private _drawerService: DrawerService,
        @Inject(DRAWER_DATA) private _taskId: string,
        private _modalService: ModalService,
        private _projectParticipantQueries: ProjectParticipantQueries,
        private _projectTaskQueries: ProjectTaskQueries,
        private _relationsQueries: RelationQueries,
        private _store: Store<State>,
        private _workAreaQueries: WorkareaQueries) {
    }

    ngOnInit() {
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._deleteTasksNews();
        this._unsetSubscriptions();
    }

    public handleClose(): void {
        this._drawerService.close();
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_TASK_ITEM_ID:
                this._handleDelete();
                break;
        }
    }

    public handleNavigateToTask(): void {
        this._store.dispatch(
            new CalendarScopeActions.Resolve.NavigateToElement(new ObjectIdentifierPair(ObjectTypeEnum.Task, this._taskId)));
    }

    public openModal(focus: ProjectTaskCaptureFormInputEnum = null): void {
        this._store.dispatch(new ProjectTaskActions.Set.Current(this._taskId));
        this._modalService.open({
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: this._taskId,
                focus,
            },
        });
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries.observeTaskById(this._taskId)
                .subscribe((task) => {
                    this._setTaskInformation(task);
                })
        );

        this._disposableSubscriptions.add(
            this._attachmentQueries.observeAttachments(ObjectTypeEnum.Task, this._taskId, false)
                .subscribe(attachments => this.attachments = attachments));
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setTaskInformation(task: Task): void {
        this.task = task;

        this._setTaskLink();
        this._setDropdownItems();
        this._requestParticipants();
        this._requestAttachments();
        this._setWorkAreaSubscriptions();
    }

    private _requestParticipants(): void {
        const {creator, assignee, assigned, status} = this.task;
        let assigneeIdentifier = '';

        if (assigned) {
            assigneeIdentifier = assignee.id;
            this._store.dispatch(new ProjectParticipantActions.Request.One(assigneeIdentifier));
        } else {
            this.assigneeParticipant = this._convertParticipantToAssignee(new ProjectParticipantResource(), assigned, status);
        }

        this._store.dispatch(new ProjectParticipantActions.Request.One(creator.id));

        this._setParticipantsSubscriptions(assigneeIdentifier, creator.id);
    }

    private _requestAttachments(): void {
        const payload: RequestAllAttachmentsPayload = {
            objectIdentifier: new ObjectListIdentifierPair(ObjectTypeEnum.Task, this._taskId, false),
            includeChildren: false,
        };

        this._store.dispatch(new AttachmentActions.Request.AllByTask(payload));
    }

    private _setParticipant(currParticipant: ProjectParticipantResource, role: string): void {
        if (currParticipant) {
            if (role === 'assignee') {
                this.assigneeParticipant = this._convertParticipantToAssignee(currParticipant, this.task.assigned, this.task.status);
            } else {
                this.creatorParticipant = this._convertParticipantToAssignee(currParticipant, true, TaskStatusEnum.OPEN);
            }
        }
    }

    private _setWorkAreaSubscriptions(): void {
        const {workArea} = this.task;

        if (workArea) {
            this._disposableSubscriptions.add(
                this._workAreaQueries.observeWorkareaById(workArea.id)
                    .subscribe((workAreaValue) => this.workArea = workAreaValue)
            );
        } else {
            this.workArea = undefined;
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

    private _setParticipantsSubscriptions(assigneeId: string, creatorId: string): void {
        if (assigneeId) {
            this._disposableSubscriptions.add(
                this._projectParticipantQueries.observeProjectParticipantById(assigneeId)
                    .subscribe((participant: ProjectParticipantResource) => this._setParticipant(participant, 'assignee'))
            );
        }

        this._disposableSubscriptions.add(
            this._projectParticipantQueries.observeProjectParticipantById(creatorId)
                .subscribe((participant: ProjectParticipantResource) => this._setParticipant(participant, 'creator'))
        );
    }

    private _setDropdownItems(): void {
        const items: MenuItemsList[] = [];

        if (this.task.permissions.canDelete) {
            items.push({
                items: [{
                    id: DELETE_TASK_ITEM_ID,
                    label: 'Task_Delete_Label',
                    type: 'button',
                }],
            });
        }

        this.dropdownItems = items;
    }

    private _handleDelete(): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Task_Delete_ConfirmTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => {
                    this._store.dispatch(new ProjectTaskActions.Delete.One(this._taskId));
                    this.handleClose();
                },
                cancelCallback: () => this._store.dispatch(new ProjectTaskActions.Delete.OneReset()),
                requestStatusObservable: this._projectTaskQueries.observeCurrentTaskRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            },
        });
    }

    private _setTaskLink(): void {
        this.taskLink = {
            label: 'Task_View_Label',
            routerLink: [ProjectUrlRetriever.getProjectTaskDetailUrl(this.task.project.id, this.task.id), {
                outlets: {
                    'task-detail': 'information',
                    'task-workflow': 'topics',
                },
            }],
        };
    }

    private _deleteTasksNews(): void {
        this._store.dispatch(
            new NewsActions.Delete.News(
                new ObjectIdentifierPair(ObjectTypeEnum.Task, this._taskId)
            )
        );
    }
}
