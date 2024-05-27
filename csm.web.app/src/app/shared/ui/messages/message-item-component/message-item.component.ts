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
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';

import {TheaterService} from '../../../theater/api/theater.service';
import {
    MenuItem,
    MenuItemsList,
} from '../../menus/menu-list/menu-list.component';
import {MessageItemModel} from './message-item.model';

export const DELETE_MESSAGE_ITEM_ID = 'delete-message';

@Component({
    selector: 'ss-message-item',
    templateUrl: './message-item.component.html',
    styleUrls: ['./message-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessageItemComponent implements OnChanges {

    /**
     * @description Property with message information
     */
    @Input()
    public message: MessageItemModel;

    @Input()
    public textMaxSize = 110;

    @Output()
    public delete: EventEmitter<string> = new EventEmitter<string>();

    public dropdownItems: MenuItemsList[] = [];

    public pictureLinks: string[] = [];

    constructor(private _theaterService: TheaterService) {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('message' in changes) {
            this._setDropdownItems();
            this._setPictureLinks();
        }
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_MESSAGE_ITEM_ID:
                this._handleDelete();
                break;
        }
    }

    /**
     * @description Open theater view on the selected picture
     */
    public openTheater(attachmentIndex: string): void {
        const attachmentId = this.message.attachments[attachmentIndex].id;

        this._theaterService.open(this.message.attachments, attachmentId);
    }

    private _handleDelete(): void {
        this.delete.emit(this.message.id);
    }

    private _setDropdownItems(): void {
        const items: MenuItem[] = [];

        if (this.message.canDelete) {
            items.push({
                id: DELETE_MESSAGE_ITEM_ID,
                type: 'button',
                label: 'Reply_Delete_Label',
            });
        }

        this.dropdownItems = items.length ? [{items}] : [];
    }

    private _setPictureLinks(): void {
        this.pictureLinks = this.message.attachments?.map(attachment => attachment._links.preview.href) || [];
    }
}
