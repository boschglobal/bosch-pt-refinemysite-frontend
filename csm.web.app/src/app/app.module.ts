/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2023
 *
 * *************************************************************************
 */

import {APP_BASE_HREF} from '@angular/common';
import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {EffectsModule} from '@ngrx/effects';
import {StoreModule} from '@ngrx/store';
import {StoreDevtoolsModule} from '@ngrx/store-devtools';

import {configuration} from '../configurations/configuration';
import {AppComponent} from './app.component';
import {
    INITIAL_STATE,
    reducerProvider,
    reducers,
    reducerToken
} from './app.reducers';
import {APP_ROUTES} from './app.routes';
import {AuthModule} from './auth/auth.module';
import {ProjectModule} from './project/project.module';
import {
    appInitializer,
    AppInitializerHelper,
} from './shared/misc/helpers/app-initializer.helper';
import {LOCATION_TOKEN} from './shared/misc/injection-tokens/location';
import {SharedModule} from './shared/shared.module';
import {UserModule} from './user/user.module';
import {UserCommonModule} from './user/user-common/user-common.module';

Object.assign(reducerToken, reducers);

@NgModule({
    imports: [
        AuthModule,
        BrowserModule,
        BrowserAnimationsModule,
        EffectsModule.forRoot([]),
        ProjectModule,
        RouterModule.forRoot(APP_ROUTES),
        SharedModule.forRoot(),
        StoreModule.forRoot(reducerToken, {initialState: INITIAL_STATE}),
        !configuration.prodMode ? StoreDevtoolsModule.instrument() : [],
        UserCommonModule,
        UserModule,
    ],
    declarations: [AppComponent],
    providers: [
        {
            provide: APP_BASE_HREF,
            useValue: '/',
        },
        reducerProvider,
        {
            provide: LOCATION_TOKEN,
            useValue: window.location,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializer,
            deps: [AppInitializerHelper],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
