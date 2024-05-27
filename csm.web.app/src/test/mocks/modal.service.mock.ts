/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {OPEN_MODAL_CSS_CLASS} from '../../app/shared/ui/modal/api/modal.service';

export class ModalServiceMock {

    private _bodyClassList: DOMTokenList = document.body.classList;

    private _isModalOpen = false;

    public get isModalOpen(): boolean {
        return this._isModalOpen;
    }

    public open(): void {
        this._isModalOpen = true;
        this._bodyClassList.add(OPEN_MODAL_CSS_CLASS);
    }

    public close(): void {
        this._isModalOpen = false;
        this._bodyClassList.remove(OPEN_MODAL_CSS_CLASS);
    }

}
