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

import {ProjectParticipantResource} from '../../api/participants/resources/project-participant.resource';

@Component({
    selector: 'ss-project-card-contact',
    templateUrl: './project-card-contact.component.html',
    styleUrls: ['./project-card-contact.component.scss']
})
export class ProjectCardContactComponent {
    /**
     * @description list of project contacts
     */
    @Input()
    public contacts: ProjectParticipantResource[] = [];

    /**
     * @description emit a contact when clicked
     */
    @Output()
    public contactClicked = new EventEmitter<ProjectParticipantResource>();

    public trackContact(index: number, contact: ProjectParticipantResource) {
        return contact.id;
    }

    public handleClick(event: Event, contact: ProjectParticipantResource): void {
        event.stopPropagation();

        this.contactClicked.emit(contact);
    }
}
