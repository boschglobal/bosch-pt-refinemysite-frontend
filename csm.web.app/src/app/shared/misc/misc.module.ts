/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';
import {RouterModule} from '@angular/router';

import {FeedbackModule} from '../feedback/feedback.module';
import {StickyModule} from '../sticky/sticky.module';
import {ToolbarModule} from '../toolbar/toolbar.module';
import {TranslationModule} from '../translation/translation.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {PaginationComponent} from './containers/pagination-component/pagination.component';
import {SortingComponent} from './containers/sorting-component/sorting.component';
import {MaintenanceComponent} from './error-pages/maintenance/maintenance.component';
import {NotAuthorisedComponent} from './error-pages/not-authorised-component/not-authorised.component';
import {PageNotFoundComponent} from './error-pages/page-not-found-component/page-not-found.component';
import {AuditableResourceLabelComponent} from './presentationals/auditable-resource-label/auditable-resource-label.component';
import {FormGroupPhoneComponent} from './presentationals/form-group-phone/form-group-phone.component';
import {GenericBannerComponent} from './presentationals/generic-banner/generic-banner.component';
import {GenericDashboardTileComponent} from './presentationals/generic-dashboard-tile/generic-dashboard-tile.component';
import {NavigationTabsComponent} from './presentationals/navigation-tabs/navigation-tabs.component';
import {ProfileComponent} from './presentationals/profile/profile.component';
import {SupergraphicComponent} from './presentationals/supergraphic/supergraphic.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IconModule,
        ReactiveFormsModule,
        RouterModule,
        TranslationModule,
        UIModule,
        FeedbackModule,
        ToolbarModule,
        StickyModule,
    ],
    declarations: [
        AuditableResourceLabelComponent,
        FormGroupPhoneComponent,
        GenericBannerComponent,
        GenericDashboardTileComponent,
        MaintenanceComponent,
        NavigationTabsComponent,
        NotAuthorisedComponent,
        PageNotFoundComponent,
        PaginationComponent,
        ProfileComponent,
        SortingComponent,
        SupergraphicComponent,

    ],
    exports: [
        AuditableResourceLabelComponent,
        FormGroupPhoneComponent,
        GenericBannerComponent,
        GenericDashboardTileComponent,
        NavigationTabsComponent,
        NotAuthorisedComponent,
        PageNotFoundComponent,
        PaginationComponent,
        ProfileComponent,
        SortingComponent,
        SupergraphicComponent,
    ],
})
export class MiscModule {
}
