/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule
} from '@angular/forms';

import {AlertModule} from './alert/alert.module';
import {AnimationModule} from './animation/animation.module';
import {BrandModule} from './brand/brand.module';
import {CookieModule} from './cookie/cookie.module';
import {FeedbackModule} from './feedback/feedback.module';
import {FooterModule} from './footer/footer.module';
import {HeaderModule} from './header/header.module';
import {HelpModule} from './help/help.module';
import {JobModule} from './jobs/job.module';
import {MiscModule} from './misc/misc.module';
import {MonitoringModule} from './monitoring/monitoring.module';
import {NavigationModule} from './navigation/navigation.module';
import {NotificationModule} from './notification/notification.module';
import {PrivacyModule} from './privacy/privacy.module';
import {RealtimeModule} from './realtime/realtime.module';
import {RestModule} from './rest/rest.module';
import {StickyModule} from './sticky/sticky.module';
import {TheaterModule} from './theater/theater.module';
import {ToolbarModule} from './toolbar/toolbar.module';
import {TranslationModule} from './translation/translation.module';
import {ModalModule} from './ui/modal/modal.module';
import {UIModule} from './ui/ui.module';

@NgModule({
    exports: [
        AlertModule,
        AnimationModule,
        BrandModule,
        CookieModule,
        CommonModule,
        FeedbackModule,
        FooterModule,
        FormsModule,
        HeaderModule,
        HelpModule,
        JobModule,
        MiscModule,
        ModalModule,
        MonitoringModule,
        NavigationModule,
        NotificationModule,
        PrivacyModule,
        ReactiveFormsModule,
        RealtimeModule,
        RestModule,
        StickyModule,
        TheaterModule,
        ToolbarModule,
        TranslationModule,
        UIModule,
    ],
})

export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule>[] {
        return [
            {ngModule: AlertModule},
            ...AnimationModule.forRoot(),
            {ngModule: BrandModule},
            {ngModule: CookieModule},
            {ngModule: CommonModule},
            {ngModule: FeedbackModule},
            {ngModule: FooterModule},
            {ngModule: FormsModule},
            {ngModule: HeaderModule},
            {ngModule: HelpModule},
            {ngModule: JobModule},
            {ngModule: MiscModule},
            {ngModule: ModalModule},
            {ngModule: MonitoringModule},
            {ngModule: NavigationModule},
            {ngModule: NotificationModule},
            {ngModule: PrivacyModule},
            {ngModule: ReactiveFormsModule},
            {ngModule: RealtimeModule},
            {ngModule: RestModule},
            {ngModule: TheaterModule},
            {ngModule: ToolbarModule},
            ...TranslationModule.forRoot(),
            {ngModule: UIModule},
        ];
    }
}
