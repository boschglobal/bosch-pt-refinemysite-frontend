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

@Component({
    selector: 'ss-thumbnail-gallery',
    templateUrl: './thumbnail-gallery.component.html',
    styleUrls: ['./thumbnail-gallery.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThumbnailGalleryComponent {

    /**
     * @description Property with max items per row
     * @type {number}
     */
    @Input()
    public itemsPerRow = 0;

    /**
     * @description if not NaN, the displayed links are limited to the specified amount.
     */
    @Input()
    public set limit(value: number) {
        this._limit = value;
        this._updateSlicedLinks();
    }

    /**
     * @description Property with links array
     * @type {Array}
     */
    @Input()
    public set links(value: string[]) {
        this._links = value;
        this._updateSlicedLinks();
    }

    /**
     * @description Triggered when thumbnail is clicked
     * @type {EventEmitter<any>}
     */
    @Output()
    public clickThumbnail: EventEmitter<string> = new EventEmitter<string>();

    private _collapsed = true;

    private _limit = NaN;

    private _links: string[] = [];

    private _slicedLinks: string[] = [];

    constructor(private _changeDetectorRef: ChangeDetectorRef) {}

    public get numberOfFurtherPics(): number {
        if (Number.isFinite(this._limit) && this._collapsed) {
            return this._links.length - this._limit;
        }
        return NaN;
    }

    public get collapsed(): boolean {
        return Number.isFinite(this._limit) && this._links.length > this._limit && this._collapsed;
    }

    /**
     * @desciption Get links collection
     * @returns collapsed or full links collection
     */
    public getLinksCollection(): string[] {
        return this.collapsed ?
            this._slicedLinks : this._links;
    }

    public isOverlayIndex(index: number): boolean {
        return (this.collapsed && index === this._limit - 1);
    }

    public clickHandler(index: number): void {
        if (this.isOverlayIndex(index)) {
            this._collapsed = false;
            this._changeDetectorRef.detectChanges();
            return;
        }
        this.clickThumbnail.emit(index.toString());
    }

    private _updateSlicedLinks(): void {
        this._slicedLinks = Number.isFinite(this._limit) ? this._links.slice(0, this._limit) : this._links;
    }
}
