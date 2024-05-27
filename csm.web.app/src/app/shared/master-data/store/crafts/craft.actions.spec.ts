/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    CraftActions,
    REQUEST_CRAFTS,
    REQUEST_CRAFTS_FULFILLED,
    REQUEST_CRAFTS_REJECTED
} from '../../../../../app/shared/master-data/store/crafts/craft.actions';

describe('Craft Actions', () => {
    it('should check CraftActions.Request.Crafts() type', () => {
        expect(new CraftActions.Request.Crafts().type).toBe(REQUEST_CRAFTS);
    });

    it('should check CraftActions.Request.CraftsFulfilled() type', () => {
        expect(new CraftActions.Request.CraftsFulfilled(null).type).toBe(REQUEST_CRAFTS_FULFILLED);
    });

    it('should check CraftActions.Request.Crafts() type', () => {
        expect(new CraftActions.Request.CraftsRejected().type).toBe(REQUEST_CRAFTS_REJECTED);
    });
});
