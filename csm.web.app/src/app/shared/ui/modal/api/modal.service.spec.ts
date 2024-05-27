/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {TestBed} from '@angular/core/testing';
import {BehaviorSubject} from 'rxjs';

import {ModalInterface} from '../containers/modal-component/modal.component';
import {
    ModalService,
    OPEN_MODAL_CSS_CLASS
} from './modal.service';

describe('Modal Service', () => {
    let modalService: ModalService;

    const modal: ModalInterface = {id: 'test-modal', data: 'test-data'};
    const emptyModal: ModalInterface = {id: null, data: null};

    beforeEach(() => {
        modalService = TestBed.inject(ModalService);
    });

    it('should open the modal when "open" is called', () => {
        modalService.open(modal);

        expect(modalService.currentModalId).toEqual(modal.id);
        expect(modalService.currentModalData).toEqual(modal.data);
        expect(modalService.observeOpenSubject()).toEqual(new BehaviorSubject<ModalInterface>(modal));
    });

    it('should clear the modal when "close" is called', () => {
        modalService.close();

        expect(modalService.currentModalId).toEqual(emptyModal.id);
        expect(modalService.currentModalData).toEqual(emptyModal.data);
        expect(modalService.observeOpenSubject()).toEqual(new BehaviorSubject<ModalInterface>(emptyModal));
    });

    it('should return true if modal open or false if closed', () => {
        modalService.open(modal);
        expect(modalService.isModalOpen).toBeTruthy();

        modalService.close();
        expect(modalService.isModalOpen).toBeFalsy();
    });

    it('should add class to body when the modal is opened', () => {
        modalService.open(modal);
        expect(document.body.classList).toContain(OPEN_MODAL_CSS_CLASS);
    });

    it('should remove class from body when the modal is closed', () => {
        modalService.open(modal);

        modalService.close();
        expect(document.body.classList).not.toContain(OPEN_MODAL_CSS_CLASS);
    });
});
