/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore,
} from '@ngrx/store/testing';
import {
    cloneDeep,
    orderBy
} from 'lodash';
import * as moment from 'moment';
import {take} from 'rxjs/operators';

import {
    MOCK_MILESTONE_FILTERS,
    MOCK_MILESTONE_RESOURCE_CRAFT,
    MOCK_MILESTONE_RESOURCE_HEADER,
    MOCK_MILESTONE_RESOURCE_WORKAREA
} from '../../../../../test/mocks/milestones';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {MilestoneResource} from '../../api/milestones/resources/milestone.resource';
import {Milestone} from '../../models/milestones/milestone';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {MilestoneQueries} from './milestone.queries';
import {MilestoneFilters} from './slice/milestone-filters';
import {MilestoneFiltersCriteria} from './slice/milestone-filters-criteria';

describe('Milestone Queries', () => {
    let milestoneQueries: MilestoneQueries;
    let store: MockStore;

    const currentDate = moment();
    const milestoneResources: MilestoneResource[] = [
        MOCK_MILESTONE_RESOURCE_CRAFT,
        MOCK_MILESTONE_RESOURCE_WORKAREA,
        MOCK_MILESTONE_RESOURCE_HEADER,
    ];
    const milestoneIds: string[] = milestoneResources.map(milestone => milestone.id);
    const milestonesSorted: Milestone[] = orderBy(
        milestoneResources.map(milestone => Milestone.fromMilestoneResource(milestone)), 'position', 'asc');

    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            milestoneSlice: {
                ...PROJECT_MODULE_INITIAL_STATE.milestoneSlice,
                currentItem: {
                    id: null,
                    requestStatus: RequestStatusEnum.success,
                },
                filters: new MilestoneFilters(),
                list: {
                    ids: milestoneIds,
                    requestStatus: RequestStatusEnum.success,
                },
                items: milestoneResources,
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
        milestoneQueries = TestBed.inject(MilestoneQueries);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        setStoreState(initialState);
    });

    it('should observe milestone by id', () => {
        milestoneQueries
            .observeMilestoneById(MOCK_MILESTONE_RESOURCE_CRAFT.id)
            .subscribe((result: Milestone) =>
                expect(result).toEqual(Milestone.fromMilestoneResource(MOCK_MILESTONE_RESOURCE_CRAFT)));
    });

    it('should observe milestone by id and return null when not available in the store', () => {
        milestoneQueries
            .observeMilestoneById('missing-milestone-id')
            .subscribe((result: Milestone) =>
                expect(result).toBeNull());
    });

    it('should observe milestone list by milestone filters sorted by position ascending', () => {
        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .subscribe((result: Milestone[]) =>
                expect(result).toEqual(milestonesSorted));
    });

    it('should observe milestone list by milestone filters and retrieve empty milestone array when filters useCriteria and ' +
        'highlight are set to false', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.milestoneSlice.filters.highlight = false;
        newState.projectModule.milestoneSlice.filters.useCriteria = false;
        setStoreState(newState);

        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .subscribe((result: Milestone[]) =>
                expect(result).toEqual([]));
    });

    it('should observe milestone list by milestone filters and retrieve correct milestones filtered when filters are applied and ' +
        'highlight is set to false', () => {
        const newState = cloneDeep(initialState);
        const expectedResult = milestonesSorted.map(milestone => ({...milestone, date: currentDate}));
        const newMilestonesResourcesMatchCriteria = cloneDeep(milestoneResources)
            .map(milestone => ({...milestone, date: currentDate.toDate()}));
        const newMilestonesResourcesDontMatchCriteria: MilestoneResource[] = [
            {...MOCK_MILESTONE_RESOURCE_HEADER, id: 'milestone-outside-criteria', date: currentDate.clone().subtract(1, 'd').toDate()},
        ];

        newState.projectModule.milestoneSlice.filters.highlight = false;
        newState.projectModule.milestoneSlice.filters.criteria.from = currentDate;
        newState.projectModule.milestoneSlice.filters.criteria.to = currentDate;
        newState.projectModule.milestoneSlice.items = [...newMilestonesResourcesMatchCriteria, ...newMilestonesResourcesDontMatchCriteria];
        setStoreState(newState);

        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .pipe(take(1))
            .subscribe((results: Milestone[]) => {
                expect(results.length).toEqual(expectedResult.length);

                results.forEach((result, index) =>
                    expect(result.id).toEqual(expectedResult[index].id));
            });
    });

    it('should observe milestone list by milestone filters and retrieve current store milestones even if they dont match ' +
        'current filter criteria when filters are applied but highlight is set to true', () => {
        const newState = cloneDeep(initialState);
        const milestoneDateOutsideRange = currentDate.clone().subtract(1, 'd');
        const expectedResult = milestonesSorted.map(milestone => ({...milestone, date: milestoneDateOutsideRange}));
        const newMilestonesResourcesDontMatchCriteria = cloneDeep(milestoneResources)
            .map(milestone => ({...milestone, date: milestoneDateOutsideRange.toDate()}));

        newState.projectModule.milestoneSlice.filters.highlight = true;
        newState.projectModule.milestoneSlice.filters.criteria.from = currentDate;
        newState.projectModule.milestoneSlice.filters.criteria.to = currentDate;
        newState.projectModule.milestoneSlice.items = [...newMilestonesResourcesDontMatchCriteria];
        setStoreState(newState);

        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .pipe(take(1))
            .subscribe((results: Milestone[]) => {
                expect(results.length).toEqual(expectedResult.length);

                results.forEach((result, index) =>
                    expect(result.id).toEqual(expectedResult[index].id));
            });
    });

    it('should observe milestone list by milestone filters and retrieve current store milestones when filters are not applied and ' +
        'highlight is set to false', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.milestoneSlice.filters = new MilestoneFilters();
        newState.projectModule.milestoneSlice.filters.highlight = false;
        setStoreState(newState);

        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .subscribe((result: Milestone[]) =>
                expect(result).toEqual(milestonesSorted));
    });

    it('should observe milestone list by milestone filters and retrieve current store milestones when filters are not applied and ' +
        'highlight is set to true', () => {
        const newState = cloneDeep(initialState);

        newState.projectModule.milestoneSlice.filters = new MilestoneFilters();
        newState.projectModule.milestoneSlice.filters.highlight = true;
        setStoreState(newState);

        milestoneQueries
            .observeMilestoneListByMilestoneFilters()
            .subscribe((result: Milestone[]) =>
                expect(result).toEqual(milestonesSorted));
    });

    it('should observe current milestone request status', () => {
        milestoneQueries
            .observeCurrentMilestoneRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe milestone list request status', () => {
        milestoneQueries
            .observeMilestoneListRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe milestone filters', () => {
        const newState = cloneDeep(initialState);
        const results: MilestoneFilters[] = [];

        milestoneQueries
            .observeFilters()
            .pipe(take(2))
            .subscribe((result: MilestoneFilters) => results.push(result));

        newState.projectModule.milestoneSlice.filters = MOCK_MILESTONE_FILTERS;
        setStoreState(newState);

        expect(results[0]).toEqual(new MilestoneFilters());
        expect(results[1]).toEqual(MOCK_MILESTONE_FILTERS);
    });

    it('should observe milestone filters and not emit multiple values when MilestoneFilters.isEqual is true', () => {
        const newState = cloneDeep(initialState);
        const results: MilestoneFilters[] = [];

        spyOn(MilestoneFilters, 'isEqual').and.returnValue(true);

        milestoneQueries
            .observeFilters()
            .subscribe((result: MilestoneFilters) => results.push(result));

        newState.projectModule.milestoneSlice.filters = MOCK_MILESTONE_FILTERS;
        setStoreState(newState);

        expect(results.length).toBe(1);
    });

    it('should observe milestone filters and emit multiple values when MilestoneFilters.isEqual is false', () => {
        const newState = cloneDeep(initialState);
        const results: MilestoneFilters[] = [];

        spyOn(MilestoneFilters, 'isEqual').and.returnValue(false);

        milestoneQueries
            .observeFilters()
            .subscribe((result: MilestoneFilters) => results.push(result));

        newState.projectModule.milestoneSlice.filters = MOCK_MILESTONE_FILTERS;
        setStoreState(newState);

        expect(results.length).toBe(2);
    });

    it('should observe has filters applied', () => {
        const newState = cloneDeep(initialState);
        const results: boolean[] = [];

        milestoneQueries
            .observeHasFiltersApplied()
            .pipe(take(3))
            .subscribe((result: boolean) => results.push(result));

        newState.projectModule.milestoneSlice.filters = MOCK_MILESTONE_FILTERS;
        setStoreState(newState);

        newState.projectModule.milestoneSlice.filters = new MilestoneFilters(new MilestoneFiltersCriteria(), false);
        setStoreState(newState);

        expect(results[0]).toBe(false);
        expect(results[1]).toBe(true);
        expect(results[2]).toBe(true);
    });
});
