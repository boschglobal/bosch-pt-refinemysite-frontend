/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnChanges,
    SimpleChanges,
} from '@angular/core';

import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {TheaterService} from '../../../../shared/theater/api/theater.service';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../shared/ui/modal/containers/modal-component/modal.component';
import {AttachmentResource} from '../../api/attachments/resources/attachment.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../containers/tasks-capture/project-tasks-capture.component';
import {Task} from '../../models/tasks/task';

export const TASK_DETAILS_DESCRIPTION_TEXT_MAX_SIZE = 180;
export const TASK_DETAILS_PICTURES_PER_ROW = 5;

@Component({
    selector: 'ss-task-details',
    templateUrl: './task-details.component.html',
    styleUrls: ['./task-details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsComponent implements OnChanges {

    @Input()
    public attachments: AttachmentResource[];

    @Input()
    public picturesPerRow = TASK_DETAILS_PICTURES_PER_ROW;

    @Input()
    public task: Task;

    @Input()
    public textMaxSize = TASK_DETAILS_DESCRIPTION_TEXT_MAX_SIZE;

    public canUpdate: boolean;

    public canShowDetails: boolean;

    public hasDescription: boolean;

    public hasPictures: boolean;

    public pictureLinks: string[] = [];

    constructor(private _modalService: ModalService,
                private _theaterService: TheaterService) {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (changes.task ||
            changes.attachments) {
            this._setHasPictures(this.attachments);
            this._setPictureLinks();
            this._setPermissions(this.task);
            this._setHasDescription(this.task);
            this._setCanShowDetails();
        }
    }

    public openTheater(attachmentIndex: string): void {
        this._theaterService.open(this.attachments, this.attachments[attachmentIndex].id);
    }

    public openEditTaskModal(): void {
        const editTaskModal: ModalInterface = {
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: this.task.id,
                focus: ProjectTaskCaptureFormInputEnum.Description,
            },
        };

        this._modalService.open(editTaskModal);
    }

    private _setCanShowDetails(): void {
        this.canShowDetails = this.canUpdate || this.hasDescription || this.hasPictures;
    }

    private _setHasDescription(task: Task): void {
        this.hasDescription = !!task.description;
    }

    private _setHasPictures(attachments: AttachmentResource[]): void {
        this.hasPictures = !!attachments.length;
    }

    private _setPermissions(task: Task): void {
        this.canUpdate = task.permissions.canUpdate;
    }

    private _setPictureLinks(): void {
        this.pictureLinks = this.attachments.map(attachment => attachment._links.preview.href);
    }
}
