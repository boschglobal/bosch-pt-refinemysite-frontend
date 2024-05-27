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
    MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
    MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY
} from '../../../../../test/mocks/constraints';
import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ConstraintEntity} from '../../entities/constraints/constraint';
import {ConstraintQueries} from './constraint.queries';

describe('Constraint Queries', () => {
    let constraintQueries: ConstraintQueries;

    const constraintEntityList = [
        MOCK_CONSTRAINT_WITH_ACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_DEACTIVATE_PERMISSION_ENTITY,
        MOCK_CONSTRAINT_WITH_UPDATE_PERMISSION_ENTITY,
    ];
    const initialState = {
        projectModule: {
            constraintSlice: {
                items: constraintEntityList,
                list: {
                    ids: constraintEntityList.map(item => item.id),
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

    beforeEach(waitForAsync(() => TestBed.configureTestingModule(moduleDef).compileComponents()));

    beforeEach(() => constraintQueries = TestBed.inject(ConstraintQueries));

    it('should observe Constraint list', () => {
        constraintQueries
            .observeConstraintList()
            .subscribe((items: ConstraintEntity[]) => expect(items).toEqual(constraintEntityList));
    });

    it('should observe Constraint list request status', () => {
        constraintQueries
            .observeConstraintListRequestStatus()
            .subscribe(status => expect(status).toEqual(RequestStatusEnum.success));
    });

    it('should observe active Constraint list', () => {
        const activeConstraintList = constraintEntityList.filter(item => item.active);

        constraintQueries
            .observeActiveConstraintList()
            .subscribe((items: ConstraintEntity[]) => expect(items).toEqual(activeConstraintList));
    });
});
