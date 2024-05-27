/*
 * *************************************************************************
 *
 * Copyright: Robert Bosch Power Tools GmbH, 2021
 *
 * *************************************************************************
 */

import {
    ModuleWithProviders,
    NgModule
} from '@angular/core';
import player from 'lottie-web';
import {
    LottieCacheModule,
    LottieModule
} from 'ngx-lottie';

export function playerFactory() {
    return player;
}

@NgModule({
    exports: [
        LottieModule,
        LottieCacheModule,
    ],
})
export class AnimationModule {
    static forRoot(): ModuleWithProviders<AnimationModule>[] {
        return [
            LottieModule.forRoot({player: playerFactory}),
            LottieCacheModule.forRoot(),
        ];
    }
}
