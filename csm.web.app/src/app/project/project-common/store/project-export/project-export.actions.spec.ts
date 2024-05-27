/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {
    ExportProjectActionsEnum,
    ProjectExportAction
} from './project-export.actions';

describe('Project Export Actions', () => {
    it('should check ProjectExportAction.Initialize.All() type', () => {
        expect(new ProjectExportAction.Initialize.All().type)
            .toBe(ExportProjectActionsEnum.InitializeAll);
    });

    it('should check ProjectExportAction.Export.One() type', () => {
        expect(new ProjectExportAction.Export.One(null, null).type)
            .toBe(ExportProjectActionsEnum.ExportOne);
    });

    it('should check ProjectExportAction.Export.OneFulfilled() type', () => {
        expect(new ProjectExportAction.Export.OneFulfilled(null).type)
            .toBe(ExportProjectActionsEnum.ExportOneFulfilled);
    });

    it('should check ProjectExportAction.Export.OneRejected() type', () => {
        expect(new ProjectExportAction.Export.OneRejected().type)
            .toBe(ExportProjectActionsEnum.ExportOneRejected);
    });

    it('should check ProjectExportAction.Export.OneReset() type', () => {
        expect(new ProjectExportAction.Export.OneReset().type)
            .toBe(ExportProjectActionsEnum.ExportOneReset);
    });
});
