/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
} from '@angular/core';
import {sum} from 'lodash';
import {of} from 'rxjs';

import {
    INTERNAL_URL_REGEX,
    URL_REGEX,
} from '../../misc/constants/regular-expression.constant';
import {ModalIdEnum} from '../../misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../misc/enums/request-status.enum';
import {
    ButtonLink,
    ButtonLinkIcon,
} from '../links/button-link/button-link.component';
import {ModalService} from '../modal/api/modal.service';

@Component({
    selector: 'ss-text-link',
    templateUrl: './text-link.component.html',
    styleUrls: ['./text-link.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextLinkComponent implements OnChanges {

    /**
     * The max number of characters that can be displayed
     * It needs to be at least 3, otherwise the component will force it to be
     *
     * @param maxLength
     */
    @Input()
    public set maxLength(maxLength: number) {
        this._maxLength = maxLength > 0 && maxLength < this._ellipsisLength ? this._ellipsisLength : maxLength;
    }

    @Input()
    public text: string;

    @Output()
    public truncatedTextLength = new EventEmitter<number>(true);

    public items: TextLinkItem[] = [];

    public linkIcon: ButtonLinkIcon = {
        name: 'external-link-tiny',
    };

    private _maxLength = 0;

    private readonly _ellipsisLength = 3;

    private readonly _maxLinkLength = 50;

    private readonly _rawTextLinkItemMap: { [key in TextLinkItemType]: (item: RawTextLinkItem) => TextLinkItem } = {
        text: this._getTextItem.bind(this),
        link: this._getLinkItem.bind(this),
    };

    constructor(private _modalService: ModalService) {
    }

    ngOnChanges(): void {
        const rawItems = this._getRawItems();
        const truncatedRawItems = this._getTruncatedRawItems(rawItems);

        this.items = this._mapRawItemsToItems(truncatedRawItems);
        this._emitTruncatedTextLength(rawItems);
    }

    private _emitTruncatedTextLength(rawItems: RawTextLinkItem[]): void {
        const textLength = sum(rawItems.map(({length}) => length));

        this.truncatedTextLength.emit(textLength);
    }

    private _getButtonLink(item: RawTextLinkItem): ButtonLink {
        const link = item.text;
        const parsedLink = link.startsWith('http') ? link : '//' + link;
        const label = this._getTruncatedLinkLabel(item);
        const internalLink = link.match(INTERNAL_URL_REGEX);

        if (internalLink) {
            return {
                label,
                href: parsedLink,
                hrefNewTab: false,
            };
        } else {
            return {
                label,
                action: () => this._openConfirmationDialog(parsedLink),
            };
        }
    }

    private _getLinkItem(item: RawTextLinkItem): TextLinkItem {
        const {text, type} = item;
        const link: ButtonLink = this._getButtonLink(item);
        const linkIcon: ButtonLinkIcon = link.href ? null : this.linkIcon;

        return {
            link,
            linkIcon,
            text,
            type,
        };
    }

    private _getRawItems(): RawTextLinkItem[] {
        const strings: string[] = this.text.split(URL_REGEX);
        const links = this.text.match(URL_REGEX) || [];

        return strings.reduce<RawTextLinkItem[]>((items, text, index) => {
            const link = links[index];

            if (text.length !== 0) {
                items.push({text, type: 'text', length: text.length});
            }

            if (link) {
                const length = Math.min(link.length, this._maxLinkLength);

                items.push({text: links[index], type: 'link', length});
            }

            return items;
        }, []);
    }

    private _getTextItem({text, truncateIndex}: RawTextLinkItem): TextLinkItem {
        const parsedText = truncateIndex >= 0 ? text.substring(0, truncateIndex) + '...' : text;

        return {
            text: parsedText,
            type: 'text',
        };
    }

    private _getTruncatedLinkLabel({text, truncateIndex}: RawTextLinkItem): string {
        const maxLinkLengthWithoutEllipsis = this._maxLinkLength - this._ellipsisLength;
        const maxLengthTruncatedIndex = truncateIndex >= 0 ? truncateIndex : Infinity;
        const maxLinkLengthTruncatedIndex = text.length > this._maxLinkLength ? maxLinkLengthWithoutEllipsis : Infinity;
        const minTruncateIndex = Math.min(maxLengthTruncatedIndex, maxLinkLengthTruncatedIndex);

        return minTruncateIndex === Infinity ? text : text.substring(0, minTruncateIndex) + '...';
    }

    private _getTruncatedRawItems(rawItems: RawTextLinkItem[]): RawTextLinkItem[] {
        const itemsLength: number[] = rawItems.map(({length}) => length);
        const textLength: number = sum(itemsLength);

        if (this._maxLength > 0 && textLength > this._maxLength) {
            const maxLength = this._maxLength - this._ellipsisLength;
            const items = [];
            let currentNrOfCharacters = 0;
            let itemsIndex = -1;

            while (currentNrOfCharacters <= maxLength) {
                itemsIndex++;
                currentNrOfCharacters += itemsLength[itemsIndex];
                items.push(rawItems[itemsIndex]);
            }

            items[itemsIndex].truncateIndex = itemsLength[itemsIndex] - (currentNrOfCharacters - maxLength);

            return items;
        } else {
            return rawItems;
        }
    }

    private _handleConfirmationDialogConfirmed(link: string): void {
        window.open(link, '_blank');
        this._modalService.close();
    }

    private _mapRawItemsToItems(rawItems: RawTextLinkItem[]): TextLinkItem[] {
        return rawItems.map(item => this._rawTextLinkItemMap[item.type](item));
    }

    private _openConfirmationDialog(link: string): void {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Weblinks_Follow_Title',
                description: 'Weblinks_Follow_ConfirmMessage',
                confirmCallback: () => this._handleConfirmationDialogConfirmed(link),
                requestStatusObservable: of(RequestStatusEnum.empty),
            },
        });
    }
}

export type TextLinkItemType = 'text' | 'link';

interface RawTextLinkItem {
    type: TextLinkItemType;
    text: string;
    length: number;
    truncateIndex?: number;
}

export interface TextLinkItem {
    type: TextLinkItemType;
    text: string;
    link?: ButtonLink;
    linkIcon?: ButtonLinkIcon | null;
}
