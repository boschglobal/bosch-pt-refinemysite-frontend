/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    HttpClient,
    HttpClientModule
} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {
    MissingTranslationHandler,
    TranslateLoader,
    TranslateModule
} from '@ngx-translate/core';

import {SmartSiteMissingTranslationHandler} from './helper/smart-site-missing-translation-handler.helper';

@NgModule({
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule
    ],
    exports: [
        TranslateModule
    ],
})
export class TranslationModule {
    public static forRoot(): ModuleWithProviders<TranslationModule>[] {
        return [
            {
                ngModule: TranslationModule,
                providers: [
                    {
                        provide: MissingTranslationHandler,
                        useClass: SmartSiteMissingTranslationHandler
                    }
                ]
            },
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useFactory: httpLoaderFactory,
                    deps: [HttpClient]
                },
                defaultLanguage: 'en'
            })
        ];
    }
}

export function httpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
