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
    Output,
} from '@angular/core';

import {Tag} from '../tag/tag.component';

@Component({
    selector: 'ss-tag-list',
    templateUrl: './tag-list.component.html',
    styleUrls: ['./tag-list.component.scss']
})
export class TagListComponent {

    /**
     * @description Property with tag state
     * @type {Tag}[]
     */
    @Input()
    public items: Tag[];

    /**
     * @description Emits when tag is removed
     * @type {EventEmitter}
     */
    @Output()
    public onRemoveTag: EventEmitter<Tag> = new EventEmitter<Tag>();

    /**
     * @description Emits when all tags are removed
     */
    @Output()
    public onRemoveAllTags: EventEmitter<Tag> = new EventEmitter<Tag>();

    /**
     * @description Triggered when clear tag is clicked
     * @param {Tag} item
     */
    public clearTag(item: Tag): void {
        this.onRemoveTag.emit(item);
    }

    /**
     * @description Triggered when clear all tags is clicked
     */
    public clearAllTags(): void {
        this.onRemoveAllTags.emit();
    }
}
