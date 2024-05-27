/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {
    MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY
} from '../../../../../test/mocks/rfvs';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {RfvEntity} from '../../entities/rfvs/rfv';
import {RfvQueries} from './rfv.queries';

describe('RFV Queries', () => {
    let rfvQueries: RfvQueries;

    const rfvEntityList = [
        MOCK_RFV_WITH_ACTIVATE_PERMISSION_ENTITY,
        MOCK_RFV_WITH_DEACTIVATE_PERMISSION_ENTITY,
    ];
    const initialState = {
        projectModule: {
            rfvSlice: {
                items: rfvEntityList,
                list: {
                    ids: rfvEntityList.map(item => item.id),
                    requestStatus: RequestStatusEnum.success,
                },
            },
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore(initialState),
            },
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        rfvQueries = TestBed.inject(RfvQueries);
    });

    it('should observe RFV list', () => {
        rfvQueries
            .observeRfvList()
            .subscribe((items: RfvEntity[]) => expect(items).toEqual(rfvEntityList));
    });

    it('should observe RFV list request status', () => {
        rfvQueries
            .observeRfvListRequestStatus()
            .subscribe(status => expect(status).toEqual(RequestStatusEnum.success));
    });

    it('should observe active RFV list', () => {
        const activeRfvList = rfvEntityList.filter(rfv => rfv.active);

        rfvQueries
            .observeActiveRfvList()
            .subscribe((items: RfvEntity[]) => expect(items).toEqual(activeRfvList));
    });
});
