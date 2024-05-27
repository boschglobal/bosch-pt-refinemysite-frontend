/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    Input
} from '@angular/core';

import {NotificationResource} from '../../api/resources/notification.resource';

@Component({
    selector: 'ss-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {

    @Input()
    public notification: NotificationResource;

    public getTitle(): string {
        const {template, values} = this.notification.summary;

        return template.replace(new RegExp(/\${(.*?)}/g), (text, key) => {
            return values[key] ? values[key].text : text;
        });
    }

    public getContext(): string {
        const {task, project} = this.notification.context;

        return `${task.displayName} · ${project.displayName}`;
    }
}
