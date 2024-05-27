/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {IconModule} from '../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectImportUploadStepComponent} from './containers/project-import-upload-step/project-import-upload-step.component';
import {ProjectImportWizardComponent} from './containers/project-import-wizard/project-import-wizard.component';
import {ProjectImportCraftCaptureComponent} from './presentationals/project-import-craft-capture/project-import-craft-capture.component';
import {ProjectImportReviewDataComponent} from './presentationals/project-import-review-data/project-import-review-data.component';
import {ProjectImportUploadCaptureComponent} from './presentationals/project-import-upload-capture/project-import-upload-capture.component';
import {ProjectImportWorkareaCaptureComponent} from './presentationals/project-import-workarea-capture/project-import-workarea-capture.component';

@NgModule({
    imports: [
        ProjectCommonModule,
        IconModule,
    ],
    declarations: [
        ProjectImportCraftCaptureComponent,
        ProjectImportUploadCaptureComponent,
        ProjectImportUploadStepComponent,
        ProjectImportWizardComponent,
        ProjectImportWorkareaCaptureComponent,
        ProjectImportReviewDataComponent,
    ],
    exports: [
        ProjectImportWizardComponent,
    ],
})
export class ProjectImportModule {
}
