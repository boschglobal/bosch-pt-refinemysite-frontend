/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ProjectExportResource} from '../../api/project-export/resources/project-export.resource';

export enum ExportProjectActionsEnum {
    ExportOne = '[ProjectExport] Export one',
    ExportOneFulfilled = '[ProjectExport] Export one fulfilled',
    ExportOneRejected = '[ProjectExport] Export one rejected',
    ExportOneReset = '[ProjectExport] Export one reset',
    InitializeAll = '[ProjectExport] Initialize all',
}

export namespace ProjectExportAction {

    export namespace Export {

        export class One implements Action {
            public readonly type = ExportProjectActionsEnum.ExportOne;

            constructor(public projectId: string,
                        public projectExportResource: ProjectExportResource) {
            }
        }

        export class OneFulfilled implements Action {
            public readonly type = ExportProjectActionsEnum.ExportOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            public readonly type = ExportProjectActionsEnum.ExportOneRejected;

            constructor() {
            }
        }

        export class OneReset implements Action {
            public readonly type = ExportProjectActionsEnum.ExportOneReset;

            constructor() {
            }
        }
    }

    export namespace Initialize {

        export class All implements Action {
            public readonly type = ExportProjectActionsEnum.InitializeAll;

            constructor() {
            }
        }
    }

}

export type ProjectExportActions =
    ProjectExportAction.Export.One |
    ProjectExportAction.Export.OneFulfilled |
    ProjectExportAction.Export.OneRejected |
    ProjectExportAction.Export.OneReset |
    ProjectExportAction.Initialize.All;
