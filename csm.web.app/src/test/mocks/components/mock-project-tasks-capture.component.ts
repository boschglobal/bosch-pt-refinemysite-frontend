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

import {SaveTaskResource} from '../../../app/project/project-common/api/tasks/resources/save-task.resource';

@Component({
    selector: 'ss-project-tasks-capture',
    template: ''
})
export class MockProjectTasksCaptureComponent {
    @Output()
    public onCancel: EventEmitter<null> = new EventEmitter();

    @Output()
    public onSubmit: EventEmitter<SaveTaskResource> = new EventEmitter<SaveTaskResource>();

    @Output()
    public onUpdate: EventEmitter<SaveTaskResource> = new EventEmitter<SaveTaskResource>();

    public resetForm(): void {}

    public onAssignAndSend(): void {
        this.onSubmit.emit();
    }
    public onSaveAsDraft(): void {
        this.onSubmit.emit();
    }
    public handleCancel(): void {
        this.onCancel.emit();
    }
}
