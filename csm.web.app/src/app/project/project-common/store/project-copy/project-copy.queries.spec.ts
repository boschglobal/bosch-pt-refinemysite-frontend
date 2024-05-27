/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
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
import {RequestStatusEnum} from '../../../../shared/misc/enums/request-status.enum';
import {ProjectCopyQueries} from './project-copy.queries';

describe('Project Copy Queries', () => {
    let projectCopyQueries: ProjectCopyQueries;

    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue:
                    new MockStore(
                        {
                            projectModule: {
                                projectCopySlice: {
                                    currentItem: {
                                        requestStatus: RequestStatusEnum.success,
                                    },
                                },
                            },
                        }
                    ),
            },
            HttpClient,
        ],
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        projectCopyQueries = TestBed.inject(ProjectCopyQueries);
    });

    it('should observe milestone by id', () => {
        projectCopyQueries
            .observeCurrentProjectCopyRequestStatus()
            .subscribe((result: RequestStatusEnum) =>
                expect(result).toBe(RequestStatusEnum.success));
    });
});
