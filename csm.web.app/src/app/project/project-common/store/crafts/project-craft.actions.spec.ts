/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ProjectCraftActions,
    ProjectCraftsActionEnum
} from './project-craft.actions';

describe('Project Crafts Actions', () => {
    it('should check ProjectCraftActions.Initialize.All() type', () => {
        expect(new ProjectCraftActions.Initialize.All().type)
            .toBe(ProjectCraftsActionEnum.InitializeAll);
    });

    it('should check ProjectCraftActions.Initialize.Current() type', () => {
        expect(new ProjectCraftActions.Initialize.Current().type)
            .toBe(ProjectCraftsActionEnum.InitializeCurrent);
    });

    it('should check ProjectCraftActions.Initialize.List() type', () => {
        expect(new ProjectCraftActions.Initialize.List().type)
            .toBe(ProjectCraftsActionEnum.InitializeList);
    });

    it('should check ProjectCraftActions.Request.All() type', () => {
        expect(new ProjectCraftActions.Request.All().type)
            .toBe(ProjectCraftsActionEnum.RequestAll);
    });

    it('should check ProjectCraftActions.Request.AllFulfilled() type', () => {
        expect(new ProjectCraftActions.Request.AllFulfilled(null).type)
            .toBe(ProjectCraftsActionEnum.RequestAllFulfilled);
    });

    it('should check ProjectCraftActions.Request.AllRejected() type', () => {
        expect(new ProjectCraftActions.Request.AllRejected().type)
            .toBe(ProjectCraftsActionEnum.RequestAllRejected);
    });

    it('should check ProjectCraftActions.Create.One() type', () => {
        expect(new ProjectCraftActions.Create.One(null).type)
            .toBe(ProjectCraftsActionEnum.CreateOne);
    });

    it('should check ProjectCraftActions.Create.OneFulfilled() type', () => {
        expect(new ProjectCraftActions.Create.OneFulfilled(null).type)
            .toBe(ProjectCraftsActionEnum.CreateOneFulfilled);
    });

    it('should check ProjectCraftActions.Create.OneRejected() type', () => {
        expect(new ProjectCraftActions.Create.OneRejected().type)
            .toBe(ProjectCraftsActionEnum.CreateOneRejected);
    });

    it('should check  ProjectCraftActions.Create.OneReset() type', () => {
        expect(new ProjectCraftActions.Create.OneReset().type)
            .toBe(ProjectCraftsActionEnum.CreateOneReset);
    });

    it('should check ProjectCraftActions.Delete.One() type', () => {
        expect(new ProjectCraftActions.Delete.One(null).type)
            .toBe(ProjectCraftsActionEnum.DeleteOne);
    });

    it('should check ProjectCraftActions.Delete.OneFulfilled() type', () => {
        expect(new ProjectCraftActions.Delete.OneFulfilled(null).type)
            .toBe(ProjectCraftsActionEnum.DeleteOneFulfilled);
    });

    it('should check ProjectCraftActions.Delete.OneRejected() type', () => {
        expect(new ProjectCraftActions.Delete.OneRejected().type)
            .toBe(ProjectCraftsActionEnum.DeleteOneRejected);
    });

    it('should check ProjectCraftActions.Delete.OneReset() type', () => {
        expect(new ProjectCraftActions.Delete.OneReset().type)
            .toBe(ProjectCraftsActionEnum.DeleteOneReset);
    });

    it('should check ProjectCraftActions.Update.One() type', () => {
        expect(new ProjectCraftActions.Update.One(null).type)
            .toBe(ProjectCraftsActionEnum.UpdateOne);
    });

    it('should check ProjectCraftActions.Update.OneFulfilled() type', () => {
        expect(new ProjectCraftActions.Update.OneFulfilled(null).type)
            .toBe(ProjectCraftsActionEnum.UpdateOneFulfilled);
    });

    it('should check ProjectCraftActions.Update.OneRejected() type', () => {
        expect(new ProjectCraftActions.Update.OneRejected().type)
            .toBe(ProjectCraftsActionEnum.UpdateOneRejected);
    });

    it('should check ProjectCraftActions.Update.OneReset() type', () => {
        expect(new ProjectCraftActions.Update.OneReset().type)
            .toBe(ProjectCraftsActionEnum.UpdateOneReset);
    });

    it('should check ProjectCraftActions.Update.List() type', () => {
        expect(new ProjectCraftActions.Update.List(null).type)
            .toBe(ProjectCraftsActionEnum.UpdateList);
    });

    it('should check ProjectCraftActions.Update.ListFulfilled() type', () => {
        expect(new ProjectCraftActions.Update.ListFulfilled(null).type)
            .toBe(ProjectCraftsActionEnum.UpdateListFulfilled);
    });

    it('should check ProjectCraftActions.Update.ListRejected() type', () => {
        expect(new ProjectCraftActions.Update.ListRejected().type)
            .toBe(ProjectCraftsActionEnum.UpdateListRejected);
    });
});
