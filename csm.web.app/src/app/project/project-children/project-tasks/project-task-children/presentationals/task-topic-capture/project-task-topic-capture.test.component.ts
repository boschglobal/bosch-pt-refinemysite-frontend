/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {ResourceReferenceWithPicture} from '../../../../../../shared/misc/api/datatypes/resource-reference-with-picture.datatype';

@Component({
    selector: 'ss-project-task-topic-capture-test',
    template: `
        <ss-project-task-topic-capture
            [isSubmitting]="isSubmitting"
            [isCollapsed]="isCollapsed"
            [user]="user">
        </ss-project-task-topic-capture>
    `,
})
export class ProjectTaskTopicCaptureTestComponent {

    @Input()
    public isSubmitting: boolean;

    @Input()
    public isCollapsed = true;

    @Input()
    public user: ResourceReferenceWithPicture;

}
