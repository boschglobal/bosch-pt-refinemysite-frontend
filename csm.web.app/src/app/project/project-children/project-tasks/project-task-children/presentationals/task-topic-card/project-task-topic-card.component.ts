/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {ViewportScroller} from '@angular/common';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

import {TheaterService} from '../../../../../../shared/theater/api/theater.service';
import {COLORS} from '../../../../../../shared/ui/constants/colors.constant';
import {InputFilesSize} from '../../../../../../shared/ui/forms/input-files/input-files.component';
import {
    MenuItem,
    MenuItemsList,
} from '../../../../../../shared/ui/menus/menu-list/menu-list.component';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {TopicCriticalityEnum} from '../../../../../project-common/enums/topic-criticality.enum';
import {TASK_MESSAGE_LIST_ID} from '../../containers/task-message-list/project-task-message-list.component';
import {ProjectTaskTopicCardModel} from './project-task-topic-card.model';

export const DELETE_TOPIC_ITEM_ID = 'delete-topic';
export const TOPIC_CRITICALITY_ID = 'critical-topic';

const PICTURE_PER_ROW = 4;

const CRITICALITY_LABEL: { [key in TopicCriticalityEnum]: string } = {
    [TopicCriticalityEnum.CRITICAL]: 'Topic_Critical_Label',
    [TopicCriticalityEnum.UNCRITICAL]: 'Topic_Uncritical_Label',
};

@Component({
    selector: 'ss-project-task-topic-card',
    templateUrl: './project-task-topic-card.component.html',
    styleUrls: ['./project-task-topic-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTaskTopicCardComponent {

    @Input()
    public inputFilesSize: InputFilesSize;

    @Input()
    public textMaxSize: number;

    @Input()
    public set topicContent(topicModel: ProjectTaskTopicCardModel) {
        this.topic = topicModel;

        this._setLinks();
        this._setDropdownItems();
    }

    @Output()
    public criticalityChanged: EventEmitter<CriticalityChange> = new EventEmitter<CriticalityChange>();

    @Output()
    public delete: EventEmitter<string> = new EventEmitter<string>();

    public topic: ProjectTaskTopicCardModel;

    public attachments: AttachmentResource[];

    public criticalityColor: string = COLORS.red;

    public dropdownItems: MenuItemsList[] = [];

    public isReplyListCollapsed = true;

    public readonly picturePerRow = PICTURE_PER_ROW;

    public pictureLinks: string[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _viewportScroller: ViewportScroller,
                private _theaterService: TheaterService) {
    }

    public clickedReplies(): void {
        this.isReplyListCollapsed = !this.isReplyListCollapsed;
        this._changeDetectorRef.detectChanges();

        if (!this.isReplyListCollapsed) {
            this._scroll(TASK_MESSAGE_LIST_ID);
        }
    }

    public openTheater(attachmentIndex: string): void {
        this._theaterService.open(this.attachments, this.attachments[attachmentIndex].id);
    }

    public handleDropdownItemClicked({id}: MenuItem): void {
        switch (id) {
            case DELETE_TOPIC_ITEM_ID:
                this._handleDelete();
                break;
            case TOPIC_CRITICALITY_ID:
                this._handleCriticalityChange();
                break;
        }
    }

    private _handleDelete(): void {
        this.delete.emit(this.topic.id);
    }

    private _handleCriticalityChange(): void {
        const criticality: TopicCriticalityEnum = this.topic.criticality === TopicCriticalityEnum.UNCRITICAL ?
            TopicCriticalityEnum.CRITICAL : TopicCriticalityEnum.UNCRITICAL;

        const criticalityChange: CriticalityChange = {
            id: this.topic.id,
            criticality,
        };

        this.criticalityChanged.emit(criticalityChange);
    }

    private _setLinks(): void {
        this.attachments = this.topic.attachments;

        if (this.attachments.length === 0) {
            return;
        }

        this.pictureLinks = this.attachments.map((attachment: AttachmentResource) => attachment._links.preview.href);
    }

    private _setDropdownItems(): void {
        const items: MenuItem[] = [];

        if (this.topic.canChangeCriticality) {
            items.push({
                id: TOPIC_CRITICALITY_ID,
                type: 'button',
                label: CRITICALITY_LABEL[this.topic.criticality],
            });
        }

        if (this.topic.canDelete) {
            items.push({
                id: DELETE_TOPIC_ITEM_ID,
                type: 'button',
                label: 'Topic_Delete_Label',
            });
        }

        this.dropdownItems = items.length ? [{items}] : [];
    }

    private _scroll(elementId): void {
        const el = document.getElementById(elementId);
        el.scrollIntoView();
    }
}

export interface CriticalityChange {
    id: string;
    criticality: TopicCriticalityEnum;
}
