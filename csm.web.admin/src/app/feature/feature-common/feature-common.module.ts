/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2022
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';

import {FeatureCaptureComponent} from './presentationals/feature-capture/feature-capture.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        FeatureCaptureComponent
    ],
    exports: [
        FeatureCaptureComponent
    ]
})
export class FeatureCommonModule {
}
