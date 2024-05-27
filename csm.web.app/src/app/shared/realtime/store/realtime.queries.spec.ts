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
import {Store} from '@ngrx/store';

import {MockStore} from '../../../../test/mocks/store';
import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';
import {RealtimeQueries} from './realtime.queries';

describe('Realtime Queries', () => {
    let realtimeQueries: RealtimeQueries;

    const context: ObjectIdentifierPair = new ObjectIdentifierPair(null, null);
    const state = {
        realtimeSlice: {
            context,
        }
    };
    const moduleDef: TestModuleMetadata = {
        providers: [
            {
                provide: Store,
                useValue: new MockStore(state)
            },
        ]
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule(moduleDef).compileComponents();
    }));

    beforeEach(() => {
        realtimeQueries = TestBed.inject(RealtimeQueries);
    });

    it('should retrieve current context', () => {
        realtimeQueries
            .observeContext()
            .subscribe((result: ObjectIdentifierPair) =>
                expect(result).toEqual(context));
    });
});
