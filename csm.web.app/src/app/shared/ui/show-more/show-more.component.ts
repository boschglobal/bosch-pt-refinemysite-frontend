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
    selector: 'ss-show-more',
    templateUrl: './show-more.component.html',
    styleUrls: ['./show-more.component.scss'],
})
export class ShowMoreComponent {

    /**
     * @description Event triggered to check if show more is enable
     * @type {EventEmitter<boolean>}
     */
    @Output()
    public showMoreEnabled: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * @description Object to identify the needs of Show More
     * @type {boolean}
     */
    @Input()
    public showMore: ShowMore = {
            enabled: false,
            message: {
                more: 'Generic_ShowMore',
                less: 'Generic_ShowLess',
            },
        };

    /**
     * @description returns the message to be displayed if it is enabled or false
     * @returns {string}
     */
    public getText(): string {
        return this.showMore.enabled ? this.showMore.message.less : this.showMore.message.more;
    }

    /**
     * @description change the state of show more enabled/disabled
     */
    public handleShowMore(): void {
        this.showMore.enabled = !this.showMore.enabled;
        this.showMoreEnabled.emit(this.showMore.enabled);
    }
}

export interface ShowMore {
    enabled: boolean;
    message: {
        less: string;
        more: string;
    };
}
