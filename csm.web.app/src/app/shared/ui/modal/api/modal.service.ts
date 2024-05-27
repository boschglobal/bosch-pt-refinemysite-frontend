/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

import {ModalInterface} from '../containers/modal-component/modal.component';

export const OPEN_MODAL_CSS_CLASS = 'ss-modal--open';

@Injectable({
    providedIn: 'root',
})
export class ModalService {

    private _bodyClassList: DOMTokenList = document.body.classList;

    private _currentModalData: any;

    private _currentModalId: string;

    private _emptyModal: ModalInterface = {id: null, data: null};

    private _openSubject: BehaviorSubject<ModalInterface> = new BehaviorSubject<ModalInterface>(this._emptyModal);

    private _isModalOpen = false;

    public get currentModalData(): any {
        return this._currentModalData;
    }

    public get currentModalId(): string {
        return this._currentModalId;
    }

    public get isModalOpen(): boolean {
        return this._isModalOpen;
    }

    public observeOpenSubject(): BehaviorSubject<ModalInterface> {
        return this._openSubject;
    }

    public open(modal: ModalInterface): void {
        this._currentModalData = modal.data;
        this._currentModalId = modal.id;
        this._openSubject.next(modal);
        this._isModalOpen = true;
        this._bodyClassList.add(OPEN_MODAL_CSS_CLASS);
    }

    public close(): void {
        this._currentModalData = this._emptyModal.data;
        this._currentModalId = this._emptyModal.id;
        this._openSubject.next(this._emptyModal);
        this._isModalOpen = false;
        this._bodyClassList.remove(OPEN_MODAL_CSS_CLASS);
    }
}
