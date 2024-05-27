/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NO_ERRORS_SCHEMA} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';
import {Subject} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {TEST_USER_RESOURCE_REGISTERED} from '../../../../../test/mocks/user';
import {
    MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
    MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2
} from '../../../../../test/mocks/user-legal-documents';
import {ModalIdEnum} from '../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ModalService} from '../../../../shared/ui/modal/api/modal.service';
import {ModalInterface} from '../../../../shared/ui/modal/containers/modal-component/modal.component';
import {UserResource} from '../../../api/resources/user.resource';
import {LegalDocumentResource} from '../../../api/resources/user-legal-documents.resource';
import {LegalDocumentsActions} from '../../../store/legal-documents/legal-documents.actions';
import {LegalDocumentsQueries} from '../../../store/legal-documents/legal-documents.queries';
import {UserQueries} from '../../../store/user/user.queries';
import {LegalDocumentsModalComponent} from './legal-documents-modal.component';

describe('Legal Documents Modal Component', () => {
    let fixture: ComponentFixture<LegalDocumentsModalComponent>;
    let comp: LegalDocumentsModalComponent;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: jasmine.SpyObj<Store>;

    const user = TEST_USER_RESOURCE_REGISTERED;
    const legalDocuments = [
        MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_1,
        MOCK_USER_LEGAL_DOCUMENTS_NOT_CONSENTED_2,
    ];

    const legalDocumentsQueriesMock: LegalDocumentsQueries = mock(LegalDocumentsQueries);
    const userQueriesMock: UserQueries = mock(UserQueries);
    const currentUserSubject = new Subject<UserResource>();
    const requestStatusSubject = new Subject<RequestStatusEnum>();
    const legalDocumentsSubject = new Subject<LegalDocumentResource[]>();

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            LegalDocumentsModalComponent,
        ],
        providers: [
            {
                provide: LegalDocumentsQueries,
                useFactory: () => instance(legalDocumentsQueriesMock),
            },
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open', 'close']),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
            {
                provide: UserQueries,
                useFactory: () => instance(userQueriesMock),
            },
        ],
    };

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => {
        fixture = TestBed.createComponent(LegalDocumentsModalComponent);
        comp = fixture.componentInstance;

        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(userQueriesMock.observeCurrentUser()).thenReturn(currentUserSubject);
        when(legalDocumentsQueriesMock.observeLegalDocumentsListToConsent()).thenReturn(legalDocumentsSubject);
        when(legalDocumentsQueriesMock.observeLegalDocumentsRequestStatus()).thenReturn(requestStatusSubject);

        modalService.close.calls.reset();
        modalService.open.calls.reset();
        store.dispatch.calls.reset();

        fixture.detectChanges();
    });

    it('should request the legal documents when the user is logged in', () => {
        const expectedResult = new LegalDocumentsActions.Request.All();

        expect(store.dispatch).not.toHaveBeenCalled();

        currentUserSubject.next(user);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should open the modal when the user has legal documents to consent', () => {
        const expectedModalConfig: ModalInterface = {
            id: ModalIdEnum.LegalDocuments,
            data: null,
        };

        legalDocumentsSubject.next(legalDocuments);

        expect(modalService.open).toHaveBeenCalledWith(expectedModalConfig);
    });

    it('should dispatch Consent action when handleAccept is called', () => {
        const ids = legalDocuments.map(({id}) => id);
        const expectedResult = new LegalDocumentsActions.Consent.All(ids);

        comp.handleAccept(ids);

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch Delay action when handleDelay is called', () => {
        const expectedResult = new LegalDocumentsActions.Consent.Delay();

        comp.handleDelay();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should set isLoading to true when requestStatus is progress and a action was dispatched', () => {
        comp.handleDelay();
        requestStatusSubject.next(RequestStatusEnum.progress);

        expect(comp.isLoading).toBeTruthy();
    });

    it('should not set isLoading to true when requestStatus is progress and no action was dispatched', () => {
        requestStatusSubject.next(RequestStatusEnum.progress);

        expect(comp.isLoading).toBeFalsy();
    });

    it('should set isLoading to false when requestStatus is not progress and a action was dispatched', () => {
        comp.handleDelay();
        requestStatusSubject.next(RequestStatusEnum.success);

        expect(comp.isLoading).toBeFalsy();
    });

    it('should close the modal when the requestStatus is success and a action was dispatched', () => {
        comp.handleDelay();
        requestStatusSubject.next(RequestStatusEnum.success);

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should not close the modal when the requestStatus is success and no action was dispatched', () => {
        requestStatusSubject.next(RequestStatusEnum.success);

        expect(modalService.close).not.toHaveBeenCalled();
    });
});
