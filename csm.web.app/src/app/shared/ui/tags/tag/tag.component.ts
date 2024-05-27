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

@Component({
    selector: 'ss-tag',
    templateUrl: './tag.component.html',
    styleUrls: ['./tag.component.scss']
})

export class TagComponent {

    /**
     * @description Property with tag state
     * @type Tag
     */
    @Input()
    public item: Tag;

    /**
     * @description Emits when tag is removed
     * @type {EventEmitter}
     */
    @Output() public onRemoveTag: EventEmitter<Tag> = new EventEmitter<Tag>();

    /**
     * @description Triggered when remove tag is clicked
     * @param {Tag} item
     */
    public removeTag(item: Tag): void {
        this.onRemoveTag.emit(item);
    }
}

export interface Tag {
    id: string;
    displayName: string;
}
