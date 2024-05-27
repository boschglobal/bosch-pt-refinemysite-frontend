/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {MiscModule} from '../misc/misc.module';
import {TranslationModule} from '../translation/translation.module';
import {IconModule} from '../ui/icons/icon.module';
import {UIModule} from '../ui/ui.module';
import {AccountMenuComponent} from './components/account-menu/account-menu.component';
import {BreadcrumbComponent} from './components/breadcrumb-component/breadcrumb.component';
import {NavbarComponent} from './components/navbar-component/navbar.component';
import {NavbarItemComponent} from './components/navbar-item-component/navbar-item.component';

@NgModule({
    imports: [
        CommonModule,
        IconModule,
        MiscModule,
        RouterModule,
        TranslationModule,
        UIModule,
    ],
    declarations: [
        AccountMenuComponent,
        BreadcrumbComponent,
        NavbarComponent,
        NavbarItemComponent,
    ],
    exports: [
        AccountMenuComponent,
        BreadcrumbComponent,
        NavbarComponent,
        NavbarItemComponent,
    ],
})
export class NavigationModule {
}
