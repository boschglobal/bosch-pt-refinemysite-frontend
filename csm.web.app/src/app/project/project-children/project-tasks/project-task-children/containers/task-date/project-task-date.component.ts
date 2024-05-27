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

import {ModalIdEnum} from '../../../../../../shared/misc/enums/modal-id.enum';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';
import {ButtonLink} from '../../../../../../shared/ui/links/button-link/button-link.component';
import {ModalService} from '../../../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../../../shared/ui/modal/containers/modal-component/modal.component';
import {ProjectTaskCaptureFormInputEnum} from '../../../../../project-common/containers/tasks-capture/project-tasks-capture.component';
import {TasksCalendarUrlQueryParamsEnum} from '../../../../../project-common/helpers/tasks-calendar-url-query-params.helper';
import {Task} from '../../../../../project-common/models/tasks/task';
import {TasksCalendarFocusParams} from '../../../../../project-common/models/tasks-calendar-focus-params/tasks-calendar-focus-params';
import {ProjectUrlRetriever} from '../../../../../project-routing/helper/project-url-retriever';

@Component({
    selector: 'ss-project-task-date',
    templateUrl: './project-task-date.component.html',
    styleUrls: ['./project-task-date.component.scss']
})

export class ProjectTaskDateComponent {

    @Input()
    public set task(task: Task) {
        this._task = task;
        this.start = task.schedule && task.schedule.start ? task.schedule.start.toString() : null;
        this.end = task.schedule && task.schedule.end ? task.schedule.end.toString() : null;
        this.canAddTimeScope = this._task.permissions.canUpdate;
    }

    @Input()
    public calendarContext = false;

    @Output()
    public navigateToTask: EventEmitter<void> = new EventEmitter<void>();

    public iconColor = COLORS.dark_grey_75;

    public start: string;

    public end: string;

    public canAddTimeScope = false;

    public taskCaptureFormField = ProjectTaskCaptureFormInputEnum;

    private _editTaskModal: ModalInterface = {
        id: ModalIdEnum.UpdateTask,
        data: {},
    };

    private _task: Task;

    constructor(private _modalService: ModalService) {
    }

    public canView(): boolean {
        return this.canAddTimeScope || this.timeScopeIsComplete();
    }

    public getNavigateToCalendarLink(): ButtonLink {
        const focusParams = new TasksCalendarFocusParams(ObjectTypeEnum.Task, [this._task.id]);

        return {
            label: 'Generic_ViewInCalendar',
            routerLink: [ProjectUrlRetriever.getProjectCalendarUrl(this._task.project.id)],
            queryParams: {
                [TasksCalendarUrlQueryParamsEnum.Focus]: focusParams.toString(),
            },
        };
    }

    public getNavigateWithinCalendarLink(): ButtonLink {
        return {
            label: 'Generic_ViewInCalendar',
            action: () => this.navigateToTask.emit(),
        };
    }

    public openModal(focus: ProjectTaskCaptureFormInputEnum): void {
        this._editTaskModal.data = {
            [TasksCalendarUrlQueryParamsEnum.Focus]: focus,
            taskId: this._task.id,
        };
        this._modalService.open(this._editTaskModal);
    }

    public timeScopeIsComplete(): boolean {
        return !!this.start && !!this.end;
    }
}
