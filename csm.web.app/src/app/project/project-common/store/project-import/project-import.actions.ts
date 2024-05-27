/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {Action} from '@ngrx/store';

import {ProjectImportAnalyzeResource} from '../../api/project-import/resources/project-import-analyze.resource';
import {ProjectImportUploadResource} from '../../api/project-import/resources/project-import-upload.resource';
import {SaveProjectImportAnalyzeResource} from '../../api/project-import/resources/save-project-import-analyze.resource';

export enum ProjectImportActionEnum {
    InitializeAll = '[Project Import] Initialize all',
    UploadOne = '[Project Import] Upload One',
    UploadOneFulfilled = '[Project Import] Upload fulfilled',
    UploadOneRejected = '[Project Import] Upload rejected',
    UploadOneReset = '[Project Import] Upload reset',
    AnalyzeOne = '[Project Import] Analyze One',
    AnalyzeOneFulfilled = '[Project Import] Analyze fulfilled',
    AnalyzeOneRejected = '[Project Import] Analyze rejected',
    ImportOne = '[Project Import] Import One',
    ImportOneFulfilled = '[Project Import] Import fulfilled',
    ImportOneRejected = '[Project Import] Import rejected',
}

export namespace ProjectImportActions {
    export namespace Initialize {
        export class All implements Action {
            readonly type = ProjectImportActionEnum.InitializeAll;
        }
    }

    export namespace Upload {
        export class One implements Action {
            readonly type = ProjectImportActionEnum.UploadOne;

            constructor(public file: File) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ProjectImportActionEnum.UploadOneFulfilled;

            constructor(public payload: ProjectImportUploadResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ProjectImportActionEnum.UploadOneRejected;
        }

        export class OneReset implements Action {
            readonly type = ProjectImportActionEnum.UploadOneReset;
        }
    }

    export namespace Analyze {
        export class One implements Action {
            readonly type = ProjectImportActionEnum.AnalyzeOne;

            constructor(public payload: SaveProjectImportAnalyzeResource,
                        public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ProjectImportActionEnum.AnalyzeOneFulfilled;

            constructor(public payload: ProjectImportAnalyzeResource) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ProjectImportActionEnum.AnalyzeOneRejected;
        }
    }

    export namespace Import {
        export class One implements Action {
            readonly type = ProjectImportActionEnum.ImportOne;

            constructor(public version: number) {
            }
        }

        export class OneFulfilled implements Action {
            readonly type = ProjectImportActionEnum.ImportOneFulfilled;

            constructor(public id: string) {
            }
        }

        export class OneRejected implements Action {
            readonly type = ProjectImportActionEnum.ImportOneRejected;
        }
    }
}

export type ProjectImportActions =
    ProjectImportActions.Initialize.All |
    ProjectImportActions.Upload.One |
    ProjectImportActions.Upload.OneFulfilled |
    ProjectImportActions.Upload.OneRejected |
    ProjectImportActions.Upload.OneReset |
    ProjectImportActions.Analyze.One |
    ProjectImportActions.Analyze.OneFulfilled |
    ProjectImportActions.Analyze.OneRejected |
    ProjectImportActions.Import.One |
    ProjectImportActions.Import.OneFulfilled |
    ProjectImportActions.Import.OneRejected;
