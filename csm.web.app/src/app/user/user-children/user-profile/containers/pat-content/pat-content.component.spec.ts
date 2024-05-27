/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
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
import {of} from 'rxjs';
import {
    instance,
    mock,
    when
} from 'ts-mockito';

import {
    MOCK_PAT_RESOURCE,
    MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION,
} from '../../../../../../test/mocks/pat';
import {ModalIdEnum} from '../../../../../shared/misc/enums/modal-id.enum';
import {RequestStatusEnum} from '../../../../../shared/misc/enums/request-status.enum';
import {TranslationModule} from '../../../../../shared/translation/translation.module';
import {ModalService} from '../../../../../shared/ui/modal/api/modal.service';
import {PATActions} from '../../../../store/pats/pat.actions';
import {PATQueries} from '../../../../store/pats/pat.queries';
import {PatContentModel} from '../pat-content-model/pat-content.model';
import {PatContentComponent} from './pat-content.component';

describe('Pat Content Component', () => {
    let component: PatContentComponent;
    let fixture: ComponentFixture<PatContentComponent>;
    let modalService: jasmine.SpyObj<ModalService>;
    let store: jasmine.SpyObj<Store>;

    const patQueriesMock: PATQueries = mock(PATQueries);

    const moduleDef: TestModuleMetadata = {
        schemas: [NO_ERRORS_SCHEMA],
        declarations: [
            PatContentComponent,
        ],
        imports: [
            TranslationModule.forRoot(),
        ],
        providers: [
            {
                provide: ModalService,
                useValue: jasmine.createSpyObj('ModalService', ['open', 'close']),
            },
            {
                provide: PATQueries,
                useFactory: () => instance(patQueriesMock),
            },
            {
                provide: Store,
                useValue: jasmine.createSpyObj('Store', ['dispatch']),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PatContentComponent);
        component = fixture.componentInstance;

        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        when(patQueriesMock.observePATsRequestStatus()).thenReturn(of(RequestStatusEnum.success));
        when(patQueriesMock.observePATs()).thenReturn(of([MOCK_PAT_RESOURCE, MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION]));

        modalService.close.calls.reset();
        modalService.open.calls.reset();
        store.dispatch.calls.reset();

        component.ngOnInit();
        fixture.detectChanges();
    });

    afterAll(() => component.ngOnDestroy());

    it('should trigger PATActions.Request.All on ngOnInit', () => {
        const expectedAction = new PATActions.Request.All();

        expect(store.dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it('should set patList after ngOnInit', () => {
        const expectedPATList: PatContentModel[] = [
            PatContentModel.fromPATResource(MOCK_PAT_RESOURCE),
            PatContentModel.fromPATResource(MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION),
        ];

        component.patList = null;

        component.ngOnInit();

        expect(component.patList).toEqual(expectedPATList);
    });

    it('should set isLoading to true when request status is progress', () => {
        when(patQueriesMock.observePATsRequestStatus()).thenReturn(of(RequestStatusEnum.progress));

        component.ngOnInit();

        expect(component.isLoading).toBeTruthy();
    });

    it('should not set isLoading to false when request status is not progress', () => {
        when(patQueriesMock.observePATsRequestStatus()).thenReturn(of(RequestStatusEnum.success));

        expect(component.isLoading).toBeFalsy();
    });

    it('should close modal when modalClose is triggered', () => {
        component.closeModal();

        expect(modalService.close).toHaveBeenCalled();
    });

    it('should open modal to create new PAT when openCreatePAT is called', () => {
        component.openCreatePAT();

        expect(component.patResource).toBeNull();
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.CreatePAT,
            data: null,
        });
    });

    it('should open modal to update PAT when openUpdatePAT is called', () => {
        component.openUpdatePAT(MOCK_PAT_RESOURCE.id);

        expect(component.patResource).toEqual(MOCK_PAT_RESOURCE);
        expect(modalService.open).toHaveBeenCalledWith({
            id: ModalIdEnum.UpdatePAT,
            data: null,
        });
    });

    it('should call modalService open when handleDeletePAT is called and dispatch the correct action ' +
        'when confirmCallback is called', () => {
        const expectedResult = new PATActions.Delete.One(MOCK_PAT_RESOURCE.id);

        modalService.open.and.callFake(params => params.data.confirmCallback());

        component.handleDeletePAT(MOCK_PAT_RESOURCE.id);

        expect(modalService.open).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });

    it('should dispatch PATActions.Initialize.Current when closeCreateModal is called', () => {
        const expectedResult = new PATActions.Initialize.Current();

        component.closeCreateModal();

        expect(store.dispatch).toHaveBeenCalledWith(expectedResult);
    });
});
