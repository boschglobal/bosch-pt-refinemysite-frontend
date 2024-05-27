/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import {HeaderComponent} from './components/header-component/header.component';
import {MiscModule} from '../misc/misc.module';
import {NavigationModule} from '../navigation/navigation.module';
import {TranslationModule} from '../translation/translation.module';


@NgModule({
    imports: [
        CommonModule,
        MiscModule,
        MatIconModule,
        NavigationModule,
        RouterModule,
        TranslationModule,
    ],
    declarations: [
        HeaderComponent
    ],
    exports: [
        HeaderComponent
    ]
})
export class HeaderModule {}
