/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output
} from '@angular/core';

import {COLORS} from '../../constants/colors.constant';

@Component({
    selector: 'ss-reply-actions',
    templateUrl: './reply-actions.component.html',
    styleUrls: ['./reply-actions.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReplyActionsComponent implements OnChanges{

    @Input()
    public isReplyListOpen: boolean;

    @Input()
    public hasMarker: boolean;

    @Input()
    public replyAmount: number;

    @Output()
    public clickedReply: EventEmitter<boolean> = new EventEmitter();

    public arrowIconColor: string = COLORS.dark_grey;

    public arrowRotation = 270;

    public replyIconColor: string = COLORS.dark_blue;

    public replyKey = 'Reply_Single_Label';

    public ngOnChanges(): void {
        this._setIconRotation();
        this._setReplyKey();
    }

    public clickedReplies(): void {
        this.clickedReply.emit(true);
    }

    private _setIconRotation(): void {
        const downArrow = 270;
        const upArrow = 90;

        this.arrowRotation = this.isReplyListOpen ? downArrow : upArrow;
    }

    private _setReplyKey(): void {
        this.replyKey = this.replyAmount === 1 ? 'Reply_Single_Label' : 'Reply_Multiple_Label';
    }
}
