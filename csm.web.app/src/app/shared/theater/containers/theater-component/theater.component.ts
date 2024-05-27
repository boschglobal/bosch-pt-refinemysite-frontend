/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    Component,
    HostListener,
    OnDestroy,
    OnInit,
} from '@angular/core';
import {
    DomSanitizer,
    SafeUrl
} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {TranslateService} from '@ngx-translate/core';
import * as moment from 'moment';
import {
    Observable,
    Subscription
} from 'rxjs';
import {map} from 'rxjs/operators';

import {State} from '../../../../app.reducers';
import {AttachmentResource} from '../../../../project/project-common/api/attachments/resources/attachment.resource';
import {AttachmentActions} from '../../../../project/project-common/store/attachments/attachment.actions';
import {AttachmentQueries} from '../../../../project/project-common/store/attachments/attachment.queries';
import {BlobExport} from '../../../misc/api/datatypes/blob-export.datatype';
import {KeyEnum} from '../../../misc/enums/key.enum';
import {ModalIdEnum} from '../../../misc/enums/modal-id.enum';
import {AttachmentHelper} from '../../../misc/helpers/attachment.helper';
import {BlobService} from '../../../rest/services/blob.service';
import {BreakpointsEnum} from '../../../ui/constants/breakpoints.constant';
import {ModalService} from '../../../ui/modal/api/modal.service';
import {TheaterService} from '../../api/theater.service';

@Component({
    selector: 'ss-theater',
    templateUrl: './theater.component.html',
    styleUrls: ['./theater.component.scss'],
})
export class TheaterComponent implements OnInit, OnDestroy {

    private _currentAttachmentId: string;

    private _disposableSubscriptions: Subscription = new Subscription();

    /**
     * @description List of attachments to be displayed
     */
    public attachments: AttachmentResource[];

    /**
     * @description Attachment that is currently being displayed
     */
    public currentAttachment: AttachmentResource;

    /**
     * @description Index of attachment that is currently being displayed
     */
    public currentAttachmentIndex: number;

    /**
     * @description Parsed metadata of attachment that is currently being displayed
     */
    public currentAttachmentMetadata: AttachmentMetadata[];

    /**
     * @description Url of compressed attachment that is currently being displayed
     */
    public currentCompressedAttachmentUrl: SafeUrl;

    /**
     * @description Open state of information panel
     */
    public isInformationPanelOpen: boolean;

    /**
     * @description Loading state of current attachment
     */
    public isLoading: boolean;

    /**
     * @description Listener to keyup event to navigate and exit
     * @param event
     */
    @HostListener('window:keyup', ['$event'])
    public onKeyup(event: KeyboardEvent): void {
        switch (event.key) {
            case KeyEnum.Escape:
            case KeyEnum.Tab:
                this.handleClose();
                break;
            case KeyEnum.ArrowLeft:
                this.previousAttachment();
                break;
            case KeyEnum.ArrowRight:
                this.nextAttachment();
                break;
        }

        event.preventDefault();
        event.stopPropagation();
    }

    constructor(private _attachmentHelper: AttachmentHelper,
                private _attachmentQueries: AttachmentQueries,
                private _blobService: BlobService,
                private _domSanitizer: DomSanitizer,
                private _modalService: ModalService,
                private _store: Store<State>,
                private _theaterService: TheaterService,
                private _translateService: TranslateService) {
    }

    ngOnInit() {
        this._setInitialInformationPanelState();
        this._setAttachments();
        this._setTheaterVisibility();
        this._setBodyClass();
    }

    ngOnDestroy() {
        this._unsetBodyClass();
        this._unsetSubscriptions();
    }

    private _triggerDeleteAttachmentModal() {
        this._modalService.open({
            id: ModalIdEnum.ConfirmationDialog,
            data: {
                title: 'Attachment_Delete_ConfirmationTitle',
                description: 'Generic_DeleteConfirmDescription',
                confirmCallback: () => this._store.dispatch(new AttachmentActions.Delete.One(this._currentAttachmentId)),
                completeCallback: () => this._theaterService.close(),
                cancelCallback: () => this._store.dispatch(new AttachmentActions.Delete.OneReset()),
                requestStatusObservable: this._attachmentQueries.observeCurrentAttachmentRequestStatus(),
                isDestructiveAction: true,
                confirmButtonMessage: 'Generic_Delete',
            }
        });
    }

    private _setBodyClass(): void {
        document.querySelector('body').classList.add('ss-theater--open');
    }

    private _unsetBodyClass(): void {
        document.querySelector('body').classList.remove('ss-theater--open');
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setAttachments(): void {
        this.attachments = this._theaterService.attachments;
        this._currentAttachmentId = this._theaterService.currentAttachmentId;

        if (this.theaterCanBeShown()) {
            this._setCurrentAttachment();
        }
    }

    private _setCurrentAttachment(): void {
        this.currentAttachmentIndex = this._getCurrentAttachmentIndex();
        this._requestAttachment();
    }

    private _requestAttachment(): void {
        this.currentAttachment = this._getCurrentAttachment();
        this.currentAttachmentMetadata = this._getCurrentAttachmentMetadata();
        this.isLoading = true;
        this.currentCompressedAttachmentUrl = '';
        this._unsetSubscriptions();
        this._disposableSubscriptions = this._blobService
            .getBlobURL(this.currentCompressedAttachmentHref)
            .subscribe(url => {
                this.currentCompressedAttachmentUrl = this._domSanitizer.bypassSecurityTrustUrl(url);
                this.isLoading = false;
            });
    }

    private _setInitialInformationPanelState(): void {
        this.isInformationPanelOpen = window.innerWidth > BreakpointsEnum.sm;
    }

    private _setTheaterVisibility(): void {
        if (!this.theaterCanBeShown()) {
            this._theaterService.close();
        }
    }

    private _getCurrentAttachment(): AttachmentResource {
        return this.attachments[this.currentAttachmentIndex];
    }

    private _getCurrentAttachmentIndex(): number {
        return this.attachments
            .findIndex(attachment => attachment.id === this._currentAttachmentId);
    }

    private _getCurrentLang(): string {
        return this._translateService.defaultLang;
    }

    private _getFormattedDate(date: string): string {
        return date ? moment(date).locale(this._getCurrentLang()).calendar() : '-';
    }

    private _getCurrentAttachmentMetadata(): AttachmentMetadata[] {
        const {fileSize, createdBy, lastModifiedDate, captureDate} = this.currentAttachment;

        return [
            {
                label: 'Attachment_FileSize_Label',
                value: this._attachmentHelper.getHumanFriendlyFileSize(fileSize)
            },
            {
                label: 'Attachment_Author_Label',
                value: createdBy.displayName
            },
            {
                label: 'Attachment_UploadDate_Label',
                value: this._getFormattedDate(lastModifiedDate)
            },
            {
                label: 'Attachment_ImageMetadataCreationDate_Label',
                value: this._getFormattedDate(captureDate)
            },
        ];
    }

    /**
     * @description Retrieves classes for information panel
     * @returns {Object}
     */
    public getAsideClasses(): Object {
        return {
            'ss-theater__information--active': this.isInformationPanelOpen,
        };
    }

    /**
     * @description Closes the theater
     */
    public handleClose(): void {
        this._theaterService.close();
    }

    public handleDownload(): Observable<BlobExport> {
        return this._blobService.getBlob(this.currentOriginalAttachmentHref)
            .pipe(map(blob => ({name: this.currentAttachment.fileName, blob})));
    }

    /**
     * @description Checks if the user has permission to delete the current attachment
     */
    public get canDelete(): boolean {
        return this.currentAttachment._links.hasOwnProperty('delete');
    }

    /**
     * @description Triggers the modal to delete an attachment
     */
    public handleDelete(): void {
        this._triggerDeleteAttachmentModal();
    }

    /**
     * @description Toggles visibility of the information panel
     */
    public toggleInformationPanel(): void {
        this.isInformationPanelOpen = !this.isInformationPanelOpen;
    }

    /**
     * @description Retrieves current compressed attachment url
     * @returns {string}
     */
    public get currentCompressedAttachmentHref(): string {
        return this.currentAttachment._links.data.href;
    }

    /**
     * @description Retrieves current original attachment url
     * @returns {string}
     */
    public get currentOriginalAttachmentHref(): string {
        return this.currentAttachment._links.original.href;
    }

    /**
     * @description Retrieves whether the theater can be displeyed
     * @returns {number|boolean}
     */
    public theaterCanBeShown(): boolean {
        return this.attachments.length && !!this._currentAttachmentId;
    }

    /**
     * @description Navigates to previous attachment
     */
    public previousAttachment(): void {
        const previousIndex = this.currentAttachmentIndex - 1;
        this.currentAttachmentIndex = previousIndex >= 0 ? previousIndex : this.attachments.length - 1;
        this._requestAttachment();
    }

    /**
     * @description Navigates to next attachment
     */
    public nextAttachment(): void {
        const nextIndex = this.currentAttachmentIndex + 1;
        this.currentAttachmentIndex = nextIndex < this.attachments.length ? nextIndex : 0;
        this._requestAttachment();
    }
}

interface AttachmentMetadata {
    label: string;
    value: string;
}
