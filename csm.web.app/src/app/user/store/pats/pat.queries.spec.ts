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
import {provideMockStore} from '@ngrx/store/testing';

import {
    MOCK_PAT_RESOURCE,
    MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION
} from '../../../../test/mocks/pat';
import {State} from '../../../app.reducers';
import {PATResource} from '../../../project/project-common/api/pats/resources/pat.resource';
import {RequestStatusEnum} from '../../../shared/misc/enums/request-status.enum';
import {USER_MODULE_INITIAL_STATE} from '../user-module.initial-state';
import {PATQueries} from './pat.queries';

describe('PAT Queries', () => {
    let patQueries: PATQueries;

    const listVersion = 1;
    const initialState: Pick<State, 'userModule'> = {
        userModule: {
            ...USER_MODULE_INITIAL_STATE,
            patSlice: {
                currentItem: {
                    id: MOCK_PAT_RESOURCE.id,
                    requestStatus: RequestStatusEnum.success,
                },
                items: [MOCK_PAT_RESOURCE, MOCK_PAT_RESOURCE_WITHOUT_DESCRIPTION],
                list: {
                    ids: [MOCK_PAT_RESOURCE.id],
                    requestStatus: RequestStatusEnum.success,
                    _links: {
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
            PATQueries,
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        patQueries = TestBed.inject(PATQueries);
    });

    it('should observe current item', () => {
        patQueries
            .observeCurrentItem()
            .subscribe((result: PATResource) =>
                expect(result).toEqual(MOCK_PAT_RESOURCE));
    });

    it('should observe PAT by id', () => {
        patQueries
            .observePATById(MOCK_PAT_RESOURCE.id)
            .subscribe((result: PATResource) =>
                expect(result).toEqual(MOCK_PAT_RESOURCE));
    });

    it('should observe PATs', () => {
        patQueries
            .observePATs()
            .subscribe((result: PATResource[]) =>
                expect(result).toEqual([MOCK_PAT_RESOURCE]));
    });

    it('should observe PAT request status', () => {
        patQueries
            .observePATsRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should observe current PAT request status', () => {
        patQueries
            .observeCurrentPATRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });
});
