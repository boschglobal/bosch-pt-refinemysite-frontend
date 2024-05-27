/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {HttpClient} from '@angular/common/http';
import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../../test/mocks/store';
import {
    MOCK_WORKAREA_A,
    MOCK_WORKAREA_B
} from '../../../../../test/mocks/workareas';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {WorkareaResource} from '../../api/workareas/resources/workarea.resource';
import {WorkareaQueries} from './workarea.queries';

describe('Workarea Queries', () => {
    let workareaQueries: WorkareaQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            WorkareaQueries,
            {
                provide: Store,
                useValue: new MockStore(
                    {
                        projectModule: {
                            workareaSlice: {
                                currentItem: {
                                    id: MOCK_WORKAREA_A.id,
                                    requestStatus: RequestStatusEnum.success,
                                },
                                items: [MOCK_WORKAREA_A, MOCK_WORKAREA_B],
                                list: {
                                    ids: [MOCK_WORKAREA_A.id, MOCK_WORKAREA_B.id],
                                    requestStatus: RequestStatusEnum.success,
                                    _links: {
                                        create: {
                                            href: ''
                                        }
                                    }
                                },
                            }
                        }
                    }
                )
            },
            HttpClient,
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => workareaQueries = TestBed.inject(WorkareaQueries));

    it('should observe workareas', () => {
        workareaQueries
            .observeWorkareas()
            .subscribe((result: WorkareaResource[]) =>
                expect(result).toEqual([MOCK_WORKAREA_A, MOCK_WORKAREA_B]));
    });

    it('should observe workarea by id', () => {
        workareaQueries
            .observeWorkareaById(MOCK_WORKAREA_A.id)
            .subscribe((result: WorkareaResource) =>
                expect(result).toEqual(MOCK_WORKAREA_A));
    });

    it('should observe workareas request status', () => {
        workareaQueries
            .observeWorkareasRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });

    it('should have create workarea permission', () => {
        expect(workareaQueries.hasCreatePermission()).toBeTruthy();
    });

    it('should observe current craft request status', () => {
        workareaQueries
            .observeCurrentWorkareaRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });
});
