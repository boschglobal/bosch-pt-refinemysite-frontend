/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {ProjectCommonModule} from '../../project-common/project-common.module';
import {ProjectKpisTabNavigationComponent} from './containers/kpis-tab-navigation/project-kpis-tab-navigation.component';
import {ProjectKpisTimeFilterComponent} from './containers/kpis-time-filter/project-kpis-time-filter.component';
import {ProjectKpisComponent} from './presentationals/kpis/project-kpis.component';
import {ProjectKpisChildrenModule} from './project-kpis-children/project-kpis-children.module';

@NgModule({
   imports: [
       ProjectCommonModule,
       ProjectKpisChildrenModule,
       RouterModule,
   ],
   exports: [
   ],
   declarations: [
       ProjectKpisComponent,
       ProjectKpisTimeFilterComponent,
       ProjectKpisTabNavigationComponent,
   ],
})
export class ProjectKpisModule {}
