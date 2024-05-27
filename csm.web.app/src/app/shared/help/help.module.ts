/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {MonitorClickActionDirective} from '../monitoring/directives/monitor-click-action.directive';
import {TranslationModule} from '../translation/translation.module';
import {UIModule} from '../ui/ui.module';
import {HelpSectionComponent} from './containers/help-section/help-section.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        MonitorClickActionDirective,
        TranslationModule,
        UIModule,
    ],
    declarations: [
        HelpSectionComponent,
    ],
    exports: [
        HelpSectionComponent,
    ],
})
export class HelpModule {}
