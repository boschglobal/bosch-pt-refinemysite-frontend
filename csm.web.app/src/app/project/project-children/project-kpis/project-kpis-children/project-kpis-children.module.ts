/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {NgxChartsModule} from '@swimlane/ngx-charts';

import {IconModule} from '../../../../shared/ui/icons/icon.module';
import {ProjectCommonModule} from '../../../project-common/project-common.module';
import {ProjectPpcAllComponent} from './containers/ppc-all/project-ppc-all.component';
import {ProjectPpcGroupedComponent} from './containers/project-ppc-grouped/project-ppc-grouped.component';
import {ProjectRfvCrComponent} from './containers/rfv-cr/project-rfv-cr.component';
import {ProjectKpisListComponent} from './presentationals/kpis-list/project-kpis-list.component';
import {ProjectKpisSectionComponent} from './presentationals/kpis-section/project-kpis-section.component';
import {ProjectKpisTooltipComponent} from './presentationals/kpis-tooltip/project-kpis-tooltip.component';
import {ProjectPpcComponent} from './presentationals/ppc/project-ppc.component';
import {ProjectPpcAllGraphComponent} from './presentationals/ppc-all-graph/project-ppc-all-graph.component';
import {ProjectPpcAllLegendComponent} from './presentationals/ppc-all-legend/project-ppc-all-legend.component';
import {PpcGroupedTableComponent} from './presentationals/ppc-grouped-table/ppc-grouped-table.component';
import {ProjectRfvComponent} from './presentationals/rfv/project-rfv.component';
import {ProjectRfvCrChartComponent} from './presentationals/rfv-cr-chart/project-rfv-cr-chart.component';
import {ProjectRfvCrChartBarGroupedComponent} from './presentationals/rfv-cr-chart-bar-grouped/project-rfv-cr-chart-bar-grouped.component';
import {ProjectRfvCrChartBarStackedComponent} from './presentationals/rfv-cr-chart-bar-stacked/project-rfv-cr-chart-bar-stacked.component';
import {ProjectRfvCrChartLineComponent} from './presentationals/rfv-cr-chart-line/project-rfv-cr-chart-line.component';
import {ProjectRfvCrLegendComponent} from './presentationals/rfv-cr-legend/project-rfv-cr-legend.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        NgxChartsModule,
        ProjectCommonModule,
    ],
    exports: [
        ProjectPpcComponent,
        ProjectPpcGroupedComponent,
    ],
    declarations: [
        ProjectPpcAllComponent,
        ProjectPpcAllGraphComponent,
        ProjectKpisTooltipComponent,
        ProjectPpcAllLegendComponent,
        ProjectKpisListComponent,
        ProjectPpcComponent,
        ProjectPpcGroupedComponent,
        ProjectKpisSectionComponent,
        PpcGroupedTableComponent,
        ProjectRfvComponent,
        ProjectRfvCrLegendComponent,
        ProjectRfvCrComponent,
        ProjectRfvCrChartComponent,
        ProjectRfvCrChartLineComponent,
        ProjectRfvCrChartBarStackedComponent,
        ProjectRfvCrChartBarGroupedComponent,
    ],
})

export class ProjectKpisChildrenModule {
}
