/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    TestBed,
    TestModuleMetadata,
    waitForAsync
} from '@angular/core/testing';
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../../test/mocks/store';
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {AbstractItem} from '../../../../shared/misc/store/datatypes/abstract-item.datatype';
import {ProjectExportQueries} from './project-export.queries';
import {ProjectExportSlice} from './project-export.slice';

describe('Project Export Queries', () => {
    let projectExportQueries: ProjectExportQueries;

    const projectExportSlice: ProjectExportSlice = {
        currentItem: {
            id: 'foo',
            requestStatus: RequestStatusEnum.empty,
        } as AbstractItem,
    };

    const initialState = {
        projectModule: {
            projectExportSlice,
        },
    };

    const moduleDef: TestModuleMetadata = {
        providers: [
            ProjectExportQueries,
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
        projectExportQueries = TestBed.inject(ProjectExportQueries);
    });

    it('should obverse project export request status', () => {
        const expectedStatus = projectExportSlice.currentItem.requestStatus;

        projectExportQueries.observeProjectExportRequestStatus()
            .subscribe(status => expect(status).toEqual(expectedStatus));
    });
});
