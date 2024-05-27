/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {EffectsModule} from '@ngrx/effects';

import {ProjectEffects} from './store/project.effects';
import {ProjectInformationComponent} from './presentationals/project-information/project-information.component';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    declarations: [ProjectInformationComponent],
    imports: [
        EffectsModule.forFeature([ProjectEffects]),
        SharedModule,
    ],
    exports: [ProjectInformationComponent],
})
export class ProjectCommonModule {

}
