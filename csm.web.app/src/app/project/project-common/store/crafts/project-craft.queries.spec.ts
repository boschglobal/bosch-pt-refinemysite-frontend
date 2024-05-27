/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {
    MockStore,
    provideMockStore
} from '@ngrx/store/testing';
import {cloneDeep} from 'lodash';

import {
    MOCK_PROJECT_CRAFT_A,
    MOCK_PROJECT_CRAFT_B
} from '../../../../../test/mocks/crafts';
import {State} from '../../../../app.reducers';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectCraftResource} from '../../api/crafts/resources/project-craft.resource';
import {PROJECT_MODULE_INITIAL_STATE} from '../project-module.initial-state';
import {ProjectCraftQueries} from './project-craft.queries';

describe('Project Craft Queries', () => {
    let projectCraftQueries: ProjectCraftQueries;
    let store: MockStore<State>;

    const listVersion = 1;
    const initialState: Pick<State, 'projectModule'> = {
        projectModule: {
            ...PROJECT_MODULE_INITIAL_STATE,
            projectCraftSlice: {
                currentItem: {
                    id: MOCK_PROJECT_CRAFT_A.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: [MOCK_PROJECT_CRAFT_A, MOCK_PROJECT_CRAFT_B],
                list: {
                    ids: [MOCK_PROJECT_CRAFT_A.id],
                    requestStatus: RequestStatusEnum.success,
                    _links: {
                        self: {
                            href: '',
                        },
                        create: {
                            href: '',
                        },
                    },
                    version: listVersion,
                },
            },
        },
    };
    const moduleDef: TestModuleMetadata = {
        providers: [
            provideMockStore({initialState}),
            ProjectCraftQueries,
            HttpClient,
        ],
    };

    const setStoreState = (newState): void => {
        store.setState(newState);
        store.refreshState();
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCraftQueries = TestBed.inject(ProjectCraftQueries);
        store = TestBed.inject(MockStore);
    });

    it('should observe craft by id', () => {
        projectCraftQueries
            .observeCraftById(MOCK_PROJECT_CRAFT_A.id)
            .subscribe((result: ProjectCraftResource) =>
                expect(result).toEqual(MOCK_PROJECT_CRAFT_A));
    });

    it('should observe crafts', () => {
        projectCraftQueries
            .observeCrafts()
            .subscribe((result: ProjectCraftResource[]) =>
                expect(result).toEqual([MOCK_PROJECT_CRAFT_A]));
    });

    it('should observe crafts sorted by name', () => {
        const newState = cloneDeep(initialState);
        const mockedCraftsItems: ProjectCraftResource[] = [
            {...MOCK_PROJECT_CRAFT_A, name: 'ZZZ'},
            {...MOCK_PROJECT_CRAFT_B, name: 'AAA'},
        ];
        const expectedResult: ProjectCraftResource[] = mockedCraftsItems.reverse();

        newState.projectModule.projectCraftSlice.items = mockedCraftsItems;
        newState.projectModule.projectCraftSlice.list.ids = mockedCraftsItems.map(craft => craft.id);

        setStoreState(newState);

        projectCraftQueries
            .observeCraftsSortedByName()
            .subscribe((result: ProjectCraftResource[]) =>
                expect(result).toEqual(expectedResult));
    });

    it('should observe craft request status', () => {
        projectCraftQueries
            .observeCraftsRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current craft request status', () => {
        projectCraftQueries
            .observeCurrentCraftRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current craft list version', () => {
        projectCraftQueries
            .observeListVersion()
            .subscribe((result: number) =>
                expect(result).toBe(listVersion));
    });

    it('should observe create project craft permission', () => {
        projectCraftQueries
            .observeCreateProjectCraftPermission()
            .subscribe((result: boolean) => {
                expect(result).toEqual(!!initialState.projectModule.projectCraftSlice.list._links.create);
            });
    });
});
