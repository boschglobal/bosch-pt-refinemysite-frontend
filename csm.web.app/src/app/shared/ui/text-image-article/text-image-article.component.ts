/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Input,
    Output
} from '@angular/core';

const MAX_LENGTH = 180;

@Component({
    selector: 'ss-text-image-article',
    templateUrl: './text-image-article.component.html',
    styleUrls: ['./text-image-article.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextImageArticleComponent {
    /**
     * @description picture content to be displayed
     */
    @Input()
    public pictureLinks?: string[] = [];

    /**
     * @description set max size for pictures
     * @type {number | null}
     */
    @Input()
    public picturePerRow?: number | null;

    /**
     * @description text content to be displayed and possible of being shortened
     * @type {string}
     */
    @Input()
    public textContent?: string;

    /**
     * @description set max size in chars for text, default set to 180
     * @type {number | null}
     */
    @Input()
    public textMaxSize?: number | null = MAX_LENGTH;

    /**
     * @description Triggered when thumbnail is clicked
     * @type {EventEmitter<any>}
     */
    @Output()
    public clickThumbnail: EventEmitter<string> = new EventEmitter<string>();

    public maxLength = MAX_LENGTH;

    public textLength = 0;

    private _textCollapsed = true;

    constructor(private _changeDetectorRef: ChangeDetectorRef) {
    }

    public get canShowMore(): boolean {
        return this.textMaxSize !== null && this.textLength > this.textMaxSize;
    }

    public get hasImages(): boolean {
        return this.pictureLinks && this.pictureLinks.length > 0;
    }

    public handleTextLengthChanged(textLength: number): void {
        this.textLength = textLength;
        this._setMaxLength();
        this._changeDetectorRef.detectChanges();
    }

    public onShowMoreChange(): void {
        this._textCollapsed = !this._textCollapsed;
        this._setMaxLength();
        this._changeDetectorRef.detectChanges();
    }

    private _setMaxLength(): void {
        const textCollapsed = this.canShowMore && this._textCollapsed;

        this.maxLength = textCollapsed ? this.textMaxSize : 0;
    }
}
