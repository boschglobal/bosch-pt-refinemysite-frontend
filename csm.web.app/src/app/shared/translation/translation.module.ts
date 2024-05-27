/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {CommonModule} from '@angular/common';
import {
    HttpClient,
    HttpClientModule
} from '@angular/common/http';
import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import {
    MissingTranslationHandler,
    TranslateLoader,
    TranslateModule
} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

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
                    useFactory: HttpLoaderFactory,
                    deps: [HttpClient]
                }
            })
        ];
    }
}

export function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
