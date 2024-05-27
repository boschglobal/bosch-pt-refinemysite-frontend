/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';

import {IconModule} from '../../shared/ui/icons/icon.module';
import {BrandModule} from '../brand/brand.module';
import {HelpModule} from '../help/help.module';
import {JobModule} from '../jobs/job.module';
import {MiscModule} from '../misc/misc.module';
import {NavigationModule} from '../navigation/navigation.module';
import {NotificationModule} from '../notification/notification.module';
import {StickyModule} from '../sticky/sticky.module';
import {TranslationModule} from '../translation/translation.module';
import {UIModule} from '../ui/ui.module';
import {HeaderComponent} from './components/header-component/header.component';

@NgModule({
    imports: [
        BrandModule,
        CommonModule,
        HelpModule,
        IconModule,
        JobModule,
        MiscModule,
        NavigationModule,
        NotificationModule,
        StickyModule,
        TranslationModule,
        UIModule,
    ],
    declarations: [
        HeaderComponent,
    ],
    exports: [
        HeaderComponent,
    ],
})
export class HeaderModule {}
