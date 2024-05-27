/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {MonitorClickActionDirective} from '../../../../shared/monitoring/directives/monitor-click-action.directive';
import {IconModule} from '../../../../shared/ui/icons/icon.module';
import {UIModule} from '../../../../shared/ui/ui.module';
import {ProjectCommonModule} from '../../../project-common/project-common.module';
import {ConstraintListComponent} from './containers/constraint-list/constraint-list.component';
import {ProjectRfvListComponent} from './containers/rfv-list/project-rfv-list.component';
import {WorkingDaysComponent} from './containers/working-days/working-days.component';
import {ConstraintCaptureComponent} from './presentationals/constraint-capture/constraint-capture.component';
import {ConstraintInfoHeaderComponent} from './presentationals/constraint-info-header/constraint-info-header.component';
import {ProjectRfvCaptureComponent} from './presentationals/rfv-capture/project-rfv-capture.component';
import {ProjectRfvInfoHeaderComponent} from './presentationals/rfv-info-header/project-rfv-info-header.component';
import {WorkingDaysCaptureComponent} from './presentationals/working-days-capture/working-days-capture.component';
import {WorkingDaysHolidayCaptureComponent} from './presentationals/working-days-holiday-capture/working-days-holiday-capture.component';
import {WorkingDaysHolidaysListComponent} from './presentationals/working-days-holidays-list/working-days-holidays-list.component';
import {WorkingDaysToggleCaptureComponent} from './presentationals/working-days-toggle-capture/working-days-toggle-capture.component';

@NgModule({
    declarations: [
        ConstraintCaptureComponent,
        ConstraintInfoHeaderComponent,
        ConstraintListComponent,
        ProjectRfvCaptureComponent,
        ProjectRfvInfoHeaderComponent,
        ProjectRfvListComponent,
        WorkingDaysComponent,
        WorkingDaysCaptureComponent,
        WorkingDaysHolidayCaptureComponent,
        WorkingDaysHolidaysListComponent,
        WorkingDaysToggleCaptureComponent,
    ],
    imports: [
        CommonModule,
        IconModule,
        ProjectCommonModule,
        UIModule,
        MonitorClickActionDirective,
    ],
    exports: [
        ProjectRfvListComponent,
    ],
})
export class ProjectSettingsChildrenModule {
}
