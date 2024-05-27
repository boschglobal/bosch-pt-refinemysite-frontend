/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    Component,
    OnDestroy,
    OnInit
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

import {State} from '../../../../../../app.reducers';
import {ObjectListIdentifierPair} from '../../../../../../shared/misc/api/datatypes/object-list-identifier-pair.datatype';
import {ObjectTypeEnum} from '../../../../../../shared/misc/enums/object-type.enum';
import {RequestStatusEnum} from '../../../../../../shared/misc/enums/request-status.enum';
import {TheaterService} from '../../../../../../shared/theater/api/theater.service';
import {AttachmentResource} from '../../../../../project-common/api/attachments/resources/attachment.resource';
import {AttachmentActions} from '../../../../../project-common/store/attachments/attachment.actions';
import {ProjectTaskQueries} from '../../../../../project-common/store/tasks/task-queries';

const ATTACHMENT_CHUNCK_SIZE = 12;

@Component({
    selector: 'ss-task-attachments-list',
    templateUrl: './task-attachments-list.component.html',
    styleUrls: ['./task-attachments-list.component.scss']
})
export class TaskAttachmentsListComponent implements OnInit, OnDestroy {

    /**
     * @description Links of images to be displayed
     * @type {string[]}
     */
    public attachmentPreviewLinks: string[] = [];

    /**
     * @description Property with loading status
     * @type {boolean}
     */
    public isLoading: boolean;

    private _attachments: AttachmentResource[] = [];

    private _attachmentPreviewNumber = ATTACHMENT_CHUNCK_SIZE;

    private _disposableSubscriptions: Subscription = new Subscription();

    private _attachmentLinks: string[] = [];

    constructor(private _store: Store<State>,
                private _projectTaskQueries: ProjectTaskQueries,
                private _theaterService: TheaterService) {
    }

    ngOnInit() {
        this._requestAttachments();
        this._setSubscriptions();
    }

    ngOnDestroy() {
        this._unsetSubscriptions();
    }

    public handleLoadMore(): void {
        this._attachmentPreviewNumber += ATTACHMENT_CHUNCK_SIZE;
        this._setPreviews();
    }

    /**
     * @description Retrieves if we can render more item button
     * @returns {boolean}
     */
    public get hasMoreItemsToShow(): boolean {
        return this._attachments.length > this._attachmentPreviewNumber;
    }

    /**
     * @description Open theater view on the selected picture
     * @param {string} attachmentIndex
     */
    public openTheater(attachmentIndex: number): void {
        this._theaterService.open(this._attachments, this._attachments[attachmentIndex].id);
    }

    private _requestAttachments(): void {
        this._projectTaskQueries
            .observeCurrentTaskId()
            .pipe(
                take(1))
            .subscribe((id: string) => {
                this._store.dispatch(new AttachmentActions.Request.AllByTask({objectIdentifier: new ObjectListIdentifierPair(ObjectTypeEnum.Task, id, true)}));
            });
    }

    private _setSubscriptions(): void {
        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeCurrentTaskAttachments()
                .subscribe(this._setAttachments.bind(this))
        );

        this._disposableSubscriptions.add(
            this._projectTaskQueries
                .observeCurrentTaskAttachmentsRequestStatus()
                .subscribe(this._setLoadingState.bind(this))
        );
    }

    private _unsetSubscriptions(): void {
        this._disposableSubscriptions.unsubscribe();
    }

    private _setAttachments(attachments: AttachmentResource[]): void {
        this._attachments = attachments;
        this._attachmentLinks = this._attachments.map((attachment: AttachmentResource) => attachment._links.preview.href);
        this._setPreviews();
    }

    private _setLoadingState(requestStatus: RequestStatusEnum): void {
        this.isLoading = requestStatus === RequestStatusEnum.progress;
    }

    private _setPreviews(): void {
        this.attachmentPreviewLinks = this._attachmentLinks.slice(0, this._attachmentPreviewNumber);
    }
}
