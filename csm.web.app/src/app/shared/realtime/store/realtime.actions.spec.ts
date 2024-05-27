/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {ObjectIdentifierPair} from '../../misc/api/datatypes/object-identifier-pair.datatype';
import {
    RealtimeActionEnum,
    RealtimeActions
} from './realtime.actions';

describe('Realtime Actions', () => {
    it('should check RealtimeActions.Set.Context() type', () => {
        expect(new RealtimeActions.Set.Context(new ObjectIdentifierPair(null, null)).type)
            .toBe(RealtimeActionEnum.SetContext);
    });

    it('should check RealtimeActions.Unset.Context() type', () => {
        expect(new RealtimeActions.Unset.Context().type)
            .toBe(RealtimeActionEnum.UnsetContext);
    });
});
