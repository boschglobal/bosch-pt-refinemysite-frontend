/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Directive,
    ElementRef,
    Input,
    OnInit
} from '@angular/core';

import {BlobService} from '../../rest/services/blob.service';

@Directive({selector: '[ssImage]'})
export class ImageDirective implements OnInit {
    /**
     * @description Image url
     */
    @Input()
    public ssImage: string;

    constructor(public _el: ElementRef,
                private _blobService: BlobService) {
        _el.nativeElement.src = '';
    }

    ngOnInit() {
        this._blobService
            .getBlobURL(this.ssImage)
            .subscribe(this._setSrc.bind(this));
    }

    private _setSrc(imageUrl: string): void {
        this._el.nativeElement.src = imageUrl;
    }
}
