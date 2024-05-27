/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {
    ProjectImportActionEnum,
    ProjectImportActions,
} from './project-import.actions';

describe('Project Import Actions', () => {
    it('should check ProjectImportActions.Initialize.All() type', () => {
        expect(new ProjectImportActions.Initialize.All().type)
            .toBe(ProjectImportActionEnum.InitializeAll);
    });

    it('should check ProjectImportActions.Upload.One() type', () => {
        expect(new ProjectImportActions.Upload.One(null).type)
            .toBe(ProjectImportActionEnum.UploadOne);
    });

    it('should check ProjectImportActions.Upload.OneFulfilled() type', () => {
        expect(new ProjectImportActions.Upload.OneFulfilled(null).type)
            .toBe(ProjectImportActionEnum.UploadOneFulfilled);
    });

    it('should check ProjectImportActions.Upload.OneRejected() type', () => {
        expect(new ProjectImportActions.Upload.OneRejected().type)
            .toBe(ProjectImportActionEnum.UploadOneRejected);
    });

    it('should check ProjectImportActions.Upload.OneReset() type', () => {
        expect(new ProjectImportActions.Upload.OneReset().type)
            .toBe(ProjectImportActionEnum.UploadOneReset);
    });

    it('should check ProjectImportActions.Analyze.One() type', () => {
        expect(new ProjectImportActions.Analyze.One(null, null).type)
            .toBe(ProjectImportActionEnum.AnalyzeOne);
    });

    it('should check ProjectImportActions.Analyze.OneFulfilled() type', () => {
        expect(new ProjectImportActions.Analyze.OneFulfilled(null).type)
            .toBe(ProjectImportActionEnum.AnalyzeOneFulfilled);
    });

    it('should check ProjectImportActions.Analyze.OneRejected() type', () => {
        expect(new ProjectImportActions.Analyze.OneRejected().type)
            .toBe(ProjectImportActionEnum.AnalyzeOneRejected);
    });

    it('should check ProjectImportActions.Import.One() type', () => {
        expect(new ProjectImportActions.Import.One(null).type)
            .toBe(ProjectImportActionEnum.ImportOne);
    });

    it('should check ProjectImportActions.Import.OneFulfilled() type', () => {
        expect(new ProjectImportActions.Import.OneFulfilled(null).type)
            .toBe(ProjectImportActionEnum.ImportOneFulfilled);
    });

    it('should check ProjectImportActions.Import.OneRejected() type', () => {
        expect(new ProjectImportActions.Import.OneRejected().type)
            .toBe(ProjectImportActionEnum.ImportOneRejected);
    });
});
