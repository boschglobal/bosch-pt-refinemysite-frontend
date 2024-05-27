/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {DebugElement} from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    Action,
    Store,
    StoreModule
} from '@ngrx/store';

import {
    MOCK_INITIAL_STATE,
    MOCK_REDUCER,
    MockState
} from '../../../../../test/mocks/reducers';
import {
    InitializeMockResourceAction,
    SetMockResourceItemsAction,
    SetMockResourcePageAction
} from '../../../../../test/mocks/store/mock-resource.actions';
import {MOCK_RESOURCE_REDUCER} from '../../../../../test/mocks/store/mock-resource.reducer';
import {MiscModule} from '../../misc.module';
import {PaginationComponent} from './pagination.component';

describe('Pagination Component', () => {
    let fixture: ComponentFixture<PaginationComponent>;
    let comp: PaginationComponent;
    let de: DebugElement;
    let el: HTMLElement;
    let store: Store<MockState>;

    const testDatePage = 2;
    const testDateItemsPerPage = 50;
    const paginatorDateSelectorFunction: (state: any) => {} = (state: MockState) => state.mockResourceSlice.mockResourceListPaginator;
    const updateItemsAction: Action = new SetMockResourceItemsAction(testDateItemsPerPage);
    const updatePageAction: Action = new SetMockResourcePageAction(testDatePage);
    const initializerAction: Action = new InitializeMockResourceAction();

    const moduleDef: TestModuleMetadata = {
        imports: [
            MiscModule,
            StoreModule.forRoot(MOCK_REDUCER, {initialState: MOCK_INITIAL_STATE})
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PaginationComponent);
        comp = fixture.componentInstance;
        de = fixture.debugElement;
        el = de.nativeElement;

        store = TestBed.inject(Store);

        comp.paginatorDataSelectorFunction = paginatorDateSelectorFunction;
        comp.setItemsPerPageAction = (items) => new SetMockResourceItemsAction(items);
        comp.setPageAction = (page) => new SetMockResourcePageAction(page);
        fixture.detectChanges();
    });

    afterEach(() => {
        store.dispatch(initializerAction);
    });

    it('should query the right state from the store', () => {
        expect(comp.paginatorData).toEqual(MOCK_INITIAL_STATE.mockResourceSlice.mockResourceListPaginator);
    });

    it('should update paginatorData after update of items per page', () => {
        const nextState = MOCK_RESOURCE_REDUCER(MOCK_INITIAL_STATE.mockResourceSlice, updateItemsAction);
        comp.onItemsPerPageChange(testDateItemsPerPage);
        expect(comp.paginatorData).toEqual(nextState.mockResourceListPaginator);
    });

    it('should update paginatorData after update of page number', () => {
        const nextState = MOCK_RESOURCE_REDUCER(MOCK_INITIAL_STATE.mockResourceSlice, updatePageAction);
        comp.onPageChange(testDatePage);
        expect(comp.paginatorData).toEqual(nextState.mockResourceListPaginator);
    });
});
