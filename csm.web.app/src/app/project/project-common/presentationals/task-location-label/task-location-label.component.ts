/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    Input,
} from '@angular/core';

import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {ProjectTaskCaptureFormInputEnum} from '../../containers/tasks-capture/project-tasks-capture.component';
import {Task} from '../../models/tasks/task';

@Component({
    selector: 'ss-task-location-label',
    templateUrl: './task-location-label.component.html',
    styleUrls: ['./task-location-label.component.scss'],
})
export class TaskLocationLabelComponent {

    @Input()
    public task: Task;

    @Input()
    public workArea: WorkareaResource;

    constructor(private _modalService: ModalService) {
    }

    public handleAddLocation(): void {
        this._modalService.open({
            id: ModalIdEnum.UpdateTask,
            data: {
                taskId: this.task.id,
                focus: ProjectTaskCaptureFormInputEnum.Workarea,
            },
        });
    }

}
