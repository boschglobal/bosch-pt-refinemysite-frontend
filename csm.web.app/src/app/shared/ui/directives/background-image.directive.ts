/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ChangeDetectorRef,
    Directive,
    HostBinding,
    Input,
    OnDestroy
} from '@angular/core';
import {Subscription} from 'rxjs';

import {BlobService} from '../../rest/services/blob.service';
import {COLORS} from '../constants/colors.constant';

@Directive({selector: '[ssBackgroundImage]'})
export class BackgroundImageDirective implements OnDestroy {
    /**
     *
     * @param {string} image
     */
    @Input()
    set ssBackgroundImage(image: string) {
        this._setImage(image);
    }

    @HostBinding('class.ss-skeleton')
    private get _isImageLoading(): boolean {
        return !this._imageUrl;
    }

    @HostBinding('style.background-color')
    private _backgroundColor = COLORS.light_grey_50;

    @HostBinding('style.background-image')
    private get _backgroundImage(): string {
        return this._imageUrl ? `url('${this._imageUrl}')` : null;
    }

    private _imageUrl: string;

    private _disposableSubscription: Subscription = new Subscription();

    constructor(private _changeDetectorRef: ChangeDetectorRef,
                private _blobService: BlobService) {
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscription.unsubscribe();
    }

    private _setImage(image: string): void {
        this._disposableSubscription.unsubscribe();
        this._disposableSubscription = this._blobService
            .getBlobURL(image)
            .subscribe(imageUrl => {
                this._imageUrl = imageUrl;
                this._changeDetectorRef.markForCheck();
            });
    }
}
