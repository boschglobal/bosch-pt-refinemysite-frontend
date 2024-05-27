/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync,
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore,
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';

import {
    MOCK_QUICK_FILTER_RESOURCE,
    MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS,
} from '../../../../../test/mocks/quick-filters';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {QuickFilterResource} from '../../api/quick-filters/resources/quick-filter.resource';
import {
    QuickFilter,
    QuickFilterId
} from '../../models/quick-filters/quick-filter';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {QUICK_FILTER_SLICE_INITIAL_STATE} from './quick-filter.initial-state';
import {QuickFilterQueries} from './quick-filter.queries';
import {QuickFilterAppliedFilters} from './quick-filter.slice';

describe('Quick Filter Queries', () => {
    let quickFilterQueries: QuickFilterQueries;
    let store: MockStore;

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            quickFilterSlice: {
                ...QUICK_FILTER_SLICE_INITIAL_STATE,
                currentItem: {
                    id: null,
                    requestStatus: RequestStatusEnum.success,
                },
                appliedFilterId: {
                    list: 'all',
                    calendar: 'my-tasks',
                },
                list: {
                    ids: [
                        MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS.id,
                        MOCK_QUICK_FILTER_RESOURCE.id,
                    ],
                    requestStatus: RequestStatusEnum.success,
                    _links: {
                        self: {
                            href: 'self',
                        },
                        create: {
                            href: 'create',
                        },
                    },
                },
                items: [
                    MOCK_QUICK_FILTER_WITHOUT_PERMISSIONS,
                    MOCK_QUICK_FILTER_RESOURCE,
                ],
            },
        },
    };

    const setStoreState = (newState: any): void => {
        store.setState(newState);
        store.refreshState();
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        quickFilterQueries = TestBed.inject(QuickFilterQueries);
        store = TestBed.inject(MockStore);
    });

    it('should observe quick filter by id', () => {
        quickFilterQueries
            .observeQuickFilterById(MOCK_QUICK_FILTER_RESOURCE.id)
            .subscribe((result: QuickFilter) =>
                expect(result).toEqual(QuickFilter.fromQuickFilterResource(MOCK_QUICK_FILTER_RESOURCE)));
    });

    it('should observe quick filter by id and return null when not available in the store', () => {
        quickFilterQueries
            .observeQuickFilterById('missing-quick-filter-id')
            .subscribe((result: QuickFilter) =>
                expect(result).toBeNull());
    });

    it('should observe quick filter list sorted by name ascending', () => {
        const newState = cloneDeep(initialState);
        const quickFilter1: QuickFilterResource = {...MOCK_QUICK_FILTER_RESOURCE, id: '1', name: 'A'};
        const quickFilter2: QuickFilterResource = {...MOCK_QUICK_FILTER_RESOURCE, id: '2', name: 'b'};
        const quickFilter3: QuickFilterResource = {...MOCK_QUICK_FILTER_RESOURCE, id: '3', name: 'C'};
        const unorderedList: QuickFilterResource[] = [
            quickFilter3,
            quickFilter1,
            quickFilter2,
        ];

        newState.projectModule.quickFilterSlice.items = unorderedList;
        newState.projectModule.quickFilterSlice.list.ids = unorderedList.map(({id}) => id);

        setStoreState(newState);

        quickFilterQueries
            .observeQuickFilterList()
            .subscribe((result: QuickFilter[]) =>
                expect(result).toEqual([
                    QuickFilter.fromQuickFilterResource(quickFilter1),
                    QuickFilter.fromQuickFilterResource(quickFilter2),
                    QuickFilter.fromQuickFilterResource(quickFilter3),
                ]));
    });

    it('should observe quick filter list request status', () => {
        quickFilterQueries
            .observeQuickFilterListRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current quick filter request status', () => {
        quickFilterQueries
            .observeCurrentQuickFilterRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current quick filter create permission', () => {
        quickFilterQueries
            .observeQuickFilterListCreatePermission()
            .subscribe((result: boolean) =>
                expect(result).toBeTruthy());
    });

    it('should observe applied filters', () => {
        const expectedResult: QuickFilterAppliedFilters = {
            list: 'all',
            calendar: 'my-tasks',
        };

        quickFilterQueries
            .observeAppliedFilters()
            .subscribe((result: QuickFilterAppliedFilters) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe applied filter for list context', () => {
        quickFilterQueries
            .observeAppliedFilterByContext('list')
            .subscribe((result: QuickFilterId) =>
                expect(result).toBe('all'));
    });

    it('should observe applied filter for calendar context', () => {
        quickFilterQueries
            .observeAppliedFilterByContext('calendar')
            .subscribe((result: QuickFilterId) =>
                expect(result).toBe('my-tasks'));
    });
});
