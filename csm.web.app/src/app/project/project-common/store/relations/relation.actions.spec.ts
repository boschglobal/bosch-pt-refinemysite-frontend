/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    RelationActionEnum,
    RelationActions
} from './relation.actions';

describe('Relation Actions', () => {
    it('should check RelationActions.Initialize.All() type', () => {
        expect(new RelationActions.Initialize.All().type)
            .toBe(RelationActionEnum.InitializeAll);
    });

    it('should check RelationActions.Request.All() type', () => {
        expect(new RelationActions.Request.All(null).type)
            .toBe(RelationActionEnum.RequestAll);
    });

    it('should check RelationActions.Request.AllFulfilled() type', () => {
        expect(new RelationActions.Request.AllFulfilled(null).type)
            .toBe(RelationActionEnum.RequestAllFulfilled);
    });

    it('should check RelationActions.Request.AllRejected() type', () => {
        expect(new RelationActions.Request.AllRejected().type)
            .toBe(RelationActionEnum.RequestAllRejected);
    });

    it('should check RelationActions.Create.All() type', () => {
        expect(new RelationActions.Create.All(null, null).type)
            .toBe(RelationActionEnum.CreateAll);
    });

    it('should check RelationActions.Create.AllFulfilled() type', () => {
        expect(new RelationActions.Create.AllFulfilled(null).type)
            .toBe(RelationActionEnum.CreateAllFulfilled);
    });

    it('should check RelationActions.Create.AllRejected() type', () => {
        expect(new RelationActions.Create.AllRejected(null).type)
            .toBe(RelationActionEnum.CreateAllRejected);
    });

    it('should check RelationActions.Delete.One() type', () => {
        expect(new RelationActions.Delete.One(null, null, null).type)
            .toBe(RelationActionEnum.DeleteOne);
    });

    it('should check RelationActions.Delete.OneFulfilled() type', () => {
        expect(new RelationActions.Delete.OneFulfilled(null).type)
            .toBe(RelationActionEnum.DeleteOneFulfilled);
    });

    it('should check RelationActions.Delete.OneRejected() type', () => {
        expect(new RelationActions.Delete.OneRejected(null).type)
            .toBe(RelationActionEnum.DeleteOneRejected);
    });

    it('should check RelationActions.Request.AllByIds() type', () => {
        expect(new RelationActions.Request.AllByIds(null, null).type)
            .toBe(RelationActionEnum.RequestAllByIds);
    });

    it('should check RelationActions.Request.AllByIdsFulfilled() type', () => {
        expect(new RelationActions.Request.AllByIdsFulfilled(null, null).type)
            .toBe(RelationActionEnum.RequestAllByIdsFulfilled);
    });

    it('should check RelationActions.Request.AllByIdsRejected() type', () => {
        expect(new RelationActions.Request.AllByIdsRejected().type)
            .toBe(RelationActionEnum.RequestAllByIdsRejected);
    });

    it('should check RelationActions.Set.AllCritical() type', () => {
        expect(new RelationActions.Set.AllCritical(null).type)
            .toBe(RelationActionEnum.SetAllCritical);
    });

    it('should check RelationActions.Set.AllUncritical() type', () => {
        expect(new RelationActions.Set.AllUncritical(null).type)
            .toBe(RelationActionEnum.SetAllUncritical);
    });
});
