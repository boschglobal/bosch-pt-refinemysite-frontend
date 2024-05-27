/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2020
 *
 * *************************************************************************
 */

import {APP_BASE_HREF} from '@angular/common';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BrowserModule} from '@angular/platform-browser';
import {EffectsModule} from '@ngrx/effects';
import {HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {StoreModule} from '@ngrx/store';

import {APP_ROUTES} from './app-routes';
import {AppComponent} from './app.component';
import {AuthModule} from './auth/auth.module';
import {configuration} from '../configurations/configuration';
import {
    INITIAL_STATE,
    reducerProvider,
    reducerToken
} from './app.reducers';
import {ManagementModule} from './management/management.module';
import {LOCATION_TOKEN} from './shared/misc/injection-tokens/location';
import {SharedModule} from './shared/shared.module';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        AuthModule,
        BrowserAnimationsModule,
        BrowserModule,
        EffectsModule.forRoot([]),
        HttpClientModule,
        ManagementModule,
        RouterModule.forRoot(APP_ROUTES),
        SharedModule.forRoot(),
        StoreModule.forRoot(reducerToken, {initialState: INITIAL_STATE}),
        !configuration.prodMode ? StoreDevtoolsModule.instrument() : [],
    ],
    providers: [
        {
            provide: APP_BASE_HREF,
            useValue: '/'
        },
        reducerProvider,
        {
            provide: LOCATION_TOKEN,
            useValue: window.location,
        },
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
