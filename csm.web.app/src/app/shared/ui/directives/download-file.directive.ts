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
    EventEmitter,
    HostListener,
    Input,
    Output,
    Renderer2,
} from '@angular/core';
import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

import {BlobExport} from '../../misc/api/datatypes/blob-export.datatype';
import {DownloadFileHelper} from '../../misc/helpers/download-file.helper';

@Directive({
    selector: '[ssDownloadFile]',
})
export class DownloadFileDirective {

    @Input()
    public set downloadSubscriptionFn(subscription: (() => Observable<BlobExport>) | Observable<BlobExport>) {
        this._downloadSubscriptionFn = subscription instanceof Observable ? () => subscription : subscription;
    }

    @Input()
    public downloadDisabled = false;

    @Output()
    public downloadError: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public downloadFinish: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    public downloadStart: EventEmitter<void> = new EventEmitter<void>();

    private _downloadSubscriptionFn: () => Observable<BlobExport>;

    private _isDownloading = false;

    constructor(private _downloadFileHelper: DownloadFileHelper,
                private _elementRef: ElementRef,
                private _renderer: Renderer2) {
    }

    private _disableDownload() {
        this._isDownloading = true;
        this._renderer.setAttribute(this._elementRef.nativeElement, 'disabled', null);
    }

    private _enableDownload() {
        this._isDownloading = false;
        this._renderer.removeAttribute(this._elementRef.nativeElement, 'disabled');
    }

    @HostListener('click')
    private _handleDownload(): void {
        if (!this._isDownloading && !this.downloadDisabled) {
            this._downloadStart();
            this._downloadSubscriptionFn()
                .pipe(first())
                .subscribe(file => {
                    this._downloadFileHelper.downloadBlob(file.name, file.blob);
                    this._downloadFinish();
                }, () => this._downloadError());
        }
    }

    private _downloadError() {
        this._enableDownload();
        this.downloadError.emit();
    }

    private _downloadFinish() {
        this._enableDownload();
        this.downloadFinish.emit();
    }

    private _downloadStart() {
        this._disableDownload();
        this.downloadStart.emit();
    }
}
